import _ from "lodash"
import { PorterStemmer } from "natural"
import { Food, FoodNutrient, Nutrient } from "@prisma/client"
import ElasticClient from "../client"
import elasticOptions from "./elasticSearchOptions"
import db from "../../../config/db"

const EXACT_MATCH_WEIGHT = 2.5
const START_OF_DESCRIPTION_WEIGHT = 3

interface SearchResult {
  description: { raw: string }
  id: { raw: string }
  _meta: {
    engine: string
    score: number
    id: string
  }
}

interface SearchResponse {
  meta: {
    alerts: string[]
    warnings: string[]
    precision: number
    page: {
      current: number
      total_pages: number
      total_results: number
      size: number
    }
    engine: {
      name: string
      type: string
    }
    request_id: string
  }
  results: SearchResult[]
}

type FoodResult = Food & {
  food_nutrients: (FoodNutrient & {
    nutrient: Nutrient
  })[]
}

type FoodResultWithScore = FoodResult & { searchScore: number }

const removeDuplicates = (
  foods: FoodResultWithScore[]
): FoodResultWithScore[] => {
  const fields = <const>[
    "description",
    "category",
    "brand_name",
    "brand_owner",
    "data_source",
  ]
  const uniqueFoods = _.uniqWith(foods, (a, b) =>
    fields.every((field) => a[field] === b[field])
  )
  return uniqueFoods
}

const prioritizeMoreNutrients = (
  foods: FoodResultWithScore[]
): FoodResultWithScore[] => {
  const prioritizedFoods = foods.map((food) => {
    const nutrientCount = food.food_nutrients.length
    return {
      ...food,
      // Just adding the nutrients meant that for low-scoring result sets, nutrient count was completely dominant, and for high-scoring result sets, it was a bit irrelevant. Can't simply multiply because then again it would completely dominate.
      // Too bad I can't do this weighting as part of the elastic query, that would allow removing the data source boosts.
      searchScore: food.searchScore * Math.log10(nutrientCount),
    }
  })
  return prioritizedFoods
}

const prioritizeStartOfDescription = (
  foods: FoodResultWithScore[],
  searchTerm: string
): FoodResultWithScore[] => {
  // This checks that all search terms are at the start of the description
  // For single-word searches, check that it is in first 2 words
  // The reason for checking at least the first 2 is because descriptions often start with a category,
  // and without that little bit of fuzziness we get dumb results,
  // like "cheddar cheese" getting a much higher score than "cheese, cheddar" for a "cheddar" search

  // TODO: This messes up the results for butter a bit, test on a large dataset to see if it's better than nothing
  const searchWords = PorterStemmer.tokenizeAndStem(
    searchTerm.toLocaleLowerCase()
  )
  const prioritizedFoods = foods.map((food) => {
    const startOfDescription = PorterStemmer.tokenizeAndStem(
      food.description?.toLocaleLowerCase() || ""
    ).slice(0, Math.max(searchWords.length, 2))
    if (_.difference(searchWords, startOfDescription).length === 0) {
      return {
        ...food,
        searchScore: food.searchScore * START_OF_DESCRIPTION_WEIGHT,
      }
    }
    return food
  })
  return prioritizedFoods
}

const prioritizeExactMatches = (
  foods: FoodResultWithScore[],
  searchTerm: string
) => {
  const prioritizedFoods = foods.map((food) => {
    const description = PorterStemmer.tokenizeAndStem(
      food.description?.trim().toLowerCase() || ""
    )
    const search = PorterStemmer.tokenizeAndStem(
      searchTerm.trim().toLowerCase()
    )
    if (_.isEqual(description, search)) {
      return {
        ...food,
        searchScore: food.searchScore * EXACT_MATCH_WEIGHT,
      }
    }
    return food
  })
  return prioritizedFoods
  // const exactMatches = foods.filter(
  //   (food) => food.description.trim().toLowerCase() === searchTerm.trim().toLowerCase()
  // );
  // const exactMatchIds = exactMatches.map((food) => food.id);
  // return [...exactMatches, ...foods.filter((food) => !exactMatchIds.includes(food.id))];
}

const searchFoods = async (
  searchTerm: string
): Promise<FoodResultWithScore[]> => {
  const resp = (await ElasticClient.search(
    "food",
    searchTerm,
    elasticOptions
  )) as SearchResponse
  const elasticIds = resp.results.map((result: { id: { raw: string } }) =>
    parseInt(result.id.raw, 10)
  )

  const foodsWithPortions = await db.food.findMany({
    where: { id: { in: elasticIds } },
    include: { food_nutrients: { include: { nutrient: true } } },
  })

  foodsWithPortions.sort(
    (a, b) => elasticIds.indexOf(a.id) - elasticIds.indexOf(b.id)
  )
  const foodsWithScores = foodsWithPortions.map((food) => ({
    ...food,
    searchScore:
      resp.results.find((result) => parseInt(result.id.raw, 10) === food.id)
        ?._meta.score || 0,
  }))

  let foodResults = foodsWithScores
  foodResults = prioritizeExactMatches(foodResults, searchTerm)
  foodResults = prioritizeMoreNutrients(foodResults)
  foodResults = prioritizeStartOfDescription(foodResults, searchTerm)
  foodResults = removeDuplicates(foodResults)
  foodResults = foodResults.sort((a, b) => b.searchScore - a.searchScore)
  return foodResults
}

export default searchFoods
