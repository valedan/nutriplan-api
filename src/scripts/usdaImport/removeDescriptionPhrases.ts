import { PrismaClient } from "@prisma/client"

// These are useless filler phrases that degrade elastic search by making their foods seem less relevant
const PHRASES = [
  "(Includes foods for USDA's Food Distribution Program)",
  "(garbanzo beans, bengal gram), ",
  ", broilers or fryers",
  ", broiler or fryers",
]

const DATA_SOURCES = [
  "usda_sr_legacy_food",
  "usda_survey_fndds_food",
  "usda_foundation_food",
]

const removeDescriptionPhrases = async (
  prisma = new PrismaClient()
): Promise<void> => {
  let index = 0
  const foods = await prisma.food.findMany({
    where: { dataSource: { in: DATA_SOURCES } },
  })
  for await (const food of foods) {
    if (
      PHRASES.some(
        (phrase) => food.description && food.description.includes(phrase)
      )
    ) {
      let newDescription = food.description || ""
      PHRASES.forEach((phrase) => {
        newDescription = newDescription.replace(phrase, "")
      })
      await prisma.food.update({
        where: { id: food.id },
        data: { description: newDescription },
      })
    }
    index += 1
    console.log(`Removed useless descriptions ${index}`)
  }
}

export default removeDescriptionPhrases
