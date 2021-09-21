/**
 * This file was generated by Nexus Schema
 * Do not make changes to this file directly
 */


import type { MyContext } from "./context"
import type { FieldAuthorizeResolver } from "nexus/dist/plugins/fieldAuthorizePlugin"
import type { core } from "nexus"
declare global {
  interface NexusGenCustomInputMethods<TypeName extends string> {
    /**
     * A date string, such as 2007-12-03, compliant with the `full-date` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar.
     */
    date<FieldName extends string>(fieldName: FieldName, opts?: core.CommonInputFieldConfig<TypeName, FieldName>): void // "Date";
    /**
     * A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar.
     */
    datetime<FieldName extends string>(fieldName: FieldName, opts?: core.CommonInputFieldConfig<TypeName, FieldName>): void // "DateTime";
  }
}
declare global {
  interface NexusGenCustomOutputMethods<TypeName extends string> {
    /**
     * A date string, such as 2007-12-03, compliant with the `full-date` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar.
     */
    date<FieldName extends string>(fieldName: FieldName, ...opts: core.ScalarOutSpread<TypeName, FieldName>): void // "Date";
    /**
     * A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar.
     */
    datetime<FieldName extends string>(fieldName: FieldName, ...opts: core.ScalarOutSpread<TypeName, FieldName>): void // "DateTime";
  }
}


declare global {
  interface NexusGen extends NexusGenTypes {}
}

export interface NexusGenInputs {
  AddIngredientInput: { // input type
    foodId: number; // Int!
    planId?: number | null; // Int
    recipeId?: number | null; // Int
  }
  CreatePlanInput: { // input type
    endDate: NexusGenScalars['DateTime']; // DateTime!
    name: string; // String!
    startDate: NexusGenScalars['DateTime']; // DateTime!
  }
  UpdatePlanInput: { // input type
    endDate?: NexusGenScalars['DateTime'] | null; // DateTime
    id: number; // Int!
    name?: string | null; // String
    startDate?: NexusGenScalars['DateTime'] | null; // DateTime
  }
}

export interface NexusGenEnums {
  ServingSizeUnit: "g" | "ml"
}

export interface NexusGenScalars {
  String: string
  Int: number
  Float: number
  Boolean: boolean
  ID: string
  Date: any
  DateTime: any
}

export interface NexusGenObjects {
  Food: { // root type
    brandName?: string | null; // String
    category?: string | null; // String
    dataSource: string; // String!
    description?: string | null; // String
    id: number; // Int!
    searchScore?: number | null; // Float
  }
  FoodNutrient: { // root type
    amount: number; // Float!
    id: number; // Int!
    name: string; // String!
    unit: string; // String!
  }
  Ingredient: { // root type
    amount: number; // Float!
    id: number; // Int!
    measure: string; // String!
    order?: number | null; // Int
  }
  Meal: { // root type
    id: number; // Int!
    order?: number | null; // Int
    servings: number; // Int!
  }
  Mutation: {};
  Plan: { // root type
    endDate?: NexusGenScalars['DateTime'] | null; // DateTime
    id: number; // Int!
    name?: string | null; // String
    startDate?: NexusGenScalars['DateTime'] | null; // DateTime
  }
  Portion: { // root type
    description?: string | null; // String
    gramWeight: number; // Float!
    measure?: string | null; // String
    order?: number | null; // Int
    unit?: string | null; // String
  }
  Query: {};
  Recipe: { // root type
    id: number; // Int!
    name?: string | null; // String
    servings?: number | null; // Int
  }
  ServingSize: { // root type
    amount: number; // Float!
    description: string; // String!
    unit: NexusGenEnums['ServingSizeUnit']; // ServingSizeUnit!
  }
}

export interface NexusGenInterfaces {
}

export interface NexusGenUnions {
}

export type NexusGenRootTypes = NexusGenObjects

export type NexusGenAllTypes = NexusGenRootTypes & NexusGenScalars & NexusGenEnums

export interface NexusGenFieldTypes {
  Food: { // field return type
    brandName: string | null; // String
    category: string | null; // String
    dataSource: string; // String!
    description: string | null; // String
    id: number; // Int!
    nutrients: NexusGenRootTypes['FoodNutrient'][]; // [FoodNutrient!]!
    portions: NexusGenRootTypes['Portion'][]; // [Portion!]!
    searchScore: number | null; // Float
    servingSize: NexusGenRootTypes['ServingSize'] | null; // ServingSize
  }
  FoodNutrient: { // field return type
    amount: number; // Float!
    id: number; // Int!
    name: string; // String!
    unit: string; // String!
  }
  Ingredient: { // field return type
    amount: number; // Float!
    food: NexusGenRootTypes['Food'] | null; // Food
    id: number; // Int!
    measure: string; // String!
    order: number | null; // Int
  }
  Meal: { // field return type
    id: number; // Int!
    ingredients: NexusGenRootTypes['Ingredient'][]; // [Ingredient!]!
    order: number | null; // Int
    plan: NexusGenRootTypes['Plan'] | null; // Plan
    recipe: NexusGenRootTypes['Recipe'] | null; // Recipe
    servings: number; // Int!
  }
  Mutation: { // field return type
    addIngredient: NexusGenRootTypes['Ingredient'] | null; // Ingredient
    createPlan: NexusGenRootTypes['Plan'] | null; // Plan
    deletePlan: NexusGenRootTypes['Plan'] | null; // Plan
    removeIngredient: NexusGenRootTypes['Ingredient'] | null; // Ingredient
    updatePlan: NexusGenRootTypes['Plan'] | null; // Plan
  }
  Plan: { // field return type
    endDate: NexusGenScalars['DateTime'] | null; // DateTime
    id: number; // Int!
    ingredients: NexusGenRootTypes['Ingredient'][]; // [Ingredient!]!
    meals: NexusGenRootTypes['Meal'][]; // [Meal!]!
    name: string | null; // String
    startDate: NexusGenScalars['DateTime'] | null; // DateTime
  }
  Portion: { // field return type
    description: string | null; // String
    gramWeight: number; // Float!
    measure: string | null; // String
    order: number | null; // Int
    unit: string | null; // String
  }
  Query: { // field return type
    food: NexusGenRootTypes['Food'] | null; // Food
    foods: NexusGenRootTypes['Food'][]; // [Food!]!
    plan: NexusGenRootTypes['Plan'] | null; // Plan
    plans: NexusGenRootTypes['Plan'][]; // [Plan!]!
    recipe: NexusGenRootTypes['Recipe'] | null; // Recipe
    recipes: NexusGenRootTypes['Recipe'][]; // [Recipe!]!
    searchFoods: Array<NexusGenRootTypes['Food'] | null> | null; // [Food]
  }
  Recipe: { // field return type
    id: number; // Int!
    ingredients: NexusGenRootTypes['Ingredient'][]; // [Ingredient!]!
    meals: NexusGenRootTypes['Meal'][]; // [Meal!]!
    name: string | null; // String
    servings: number | null; // Int
  }
  ServingSize: { // field return type
    amount: number; // Float!
    description: string; // String!
    unit: NexusGenEnums['ServingSizeUnit']; // ServingSizeUnit!
  }
}

export interface NexusGenFieldTypeNames {
  Food: { // field return type name
    brandName: 'String'
    category: 'String'
    dataSource: 'String'
    description: 'String'
    id: 'Int'
    nutrients: 'FoodNutrient'
    portions: 'Portion'
    searchScore: 'Float'
    servingSize: 'ServingSize'
  }
  FoodNutrient: { // field return type name
    amount: 'Float'
    id: 'Int'
    name: 'String'
    unit: 'String'
  }
  Ingredient: { // field return type name
    amount: 'Float'
    food: 'Food'
    id: 'Int'
    measure: 'String'
    order: 'Int'
  }
  Meal: { // field return type name
    id: 'Int'
    ingredients: 'Ingredient'
    order: 'Int'
    plan: 'Plan'
    recipe: 'Recipe'
    servings: 'Int'
  }
  Mutation: { // field return type name
    addIngredient: 'Ingredient'
    createPlan: 'Plan'
    deletePlan: 'Plan'
    removeIngredient: 'Ingredient'
    updatePlan: 'Plan'
  }
  Plan: { // field return type name
    endDate: 'DateTime'
    id: 'Int'
    ingredients: 'Ingredient'
    meals: 'Meal'
    name: 'String'
    startDate: 'DateTime'
  }
  Portion: { // field return type name
    description: 'String'
    gramWeight: 'Float'
    measure: 'String'
    order: 'Int'
    unit: 'String'
  }
  Query: { // field return type name
    food: 'Food'
    foods: 'Food'
    plan: 'Plan'
    plans: 'Plan'
    recipe: 'Recipe'
    recipes: 'Recipe'
    searchFoods: 'Food'
  }
  Recipe: { // field return type name
    id: 'Int'
    ingredients: 'Ingredient'
    meals: 'Meal'
    name: 'String'
    servings: 'Int'
  }
  ServingSize: { // field return type name
    amount: 'Float'
    description: 'String'
    unit: 'ServingSizeUnit'
  }
}

export interface NexusGenArgTypes {
  Mutation: {
    addIngredient: { // args
      input: NexusGenInputs['AddIngredientInput']; // AddIngredientInput!
    }
    createPlan: { // args
      input: NexusGenInputs['CreatePlanInput']; // CreatePlanInput!
    }
    deletePlan: { // args
      id: number; // Int!
    }
    removeIngredient: { // args
      id: number; // Int!
    }
    updatePlan: { // args
      input: NexusGenInputs['UpdatePlanInput']; // UpdatePlanInput!
    }
  }
  Query: {
    food: { // args
      id: number; // Int!
    }
    foods: { // args
      ids: number[]; // [Int!]!
    }
    plan: { // args
      id: number; // Int!
    }
    recipe: { // args
      id: number; // Int!
    }
    recipes: { // args
      ids: number[]; // [Int!]!
    }
    searchFoods: { // args
      searchTerm: string; // String!
    }
  }
}

export interface NexusGenAbstractTypeMembers {
}

export interface NexusGenTypeInterfaces {
}

export type NexusGenObjectNames = keyof NexusGenObjects;

export type NexusGenInputNames = keyof NexusGenInputs;

export type NexusGenEnumNames = keyof NexusGenEnums;

export type NexusGenInterfaceNames = never;

export type NexusGenScalarNames = keyof NexusGenScalars;

export type NexusGenUnionNames = never;

export type NexusGenObjectsUsingAbstractStrategyIsTypeOf = never;

export type NexusGenAbstractsUsingStrategyResolveType = never;

export type NexusGenFeaturesConfig = {
  abstractTypeStrategies: {
    isTypeOf: false
    resolveType: true
    __typename: false
  }
}

export interface NexusGenTypes {
  context: MyContext;
  inputTypes: NexusGenInputs;
  rootTypes: NexusGenRootTypes;
  inputTypeShapes: NexusGenInputs & NexusGenEnums & NexusGenScalars;
  argTypes: NexusGenArgTypes;
  fieldTypes: NexusGenFieldTypes;
  fieldTypeNames: NexusGenFieldTypeNames;
  allTypes: NexusGenAllTypes;
  typeInterfaces: NexusGenTypeInterfaces;
  objectNames: NexusGenObjectNames;
  inputNames: NexusGenInputNames;
  enumNames: NexusGenEnumNames;
  interfaceNames: NexusGenInterfaceNames;
  scalarNames: NexusGenScalarNames;
  unionNames: NexusGenUnionNames;
  allInputTypes: NexusGenTypes['inputNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['scalarNames'];
  allOutputTypes: NexusGenTypes['objectNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['unionNames'] | NexusGenTypes['interfaceNames'] | NexusGenTypes['scalarNames'];
  allNamedTypes: NexusGenTypes['allInputTypes'] | NexusGenTypes['allOutputTypes']
  abstractTypes: NexusGenTypes['interfaceNames'] | NexusGenTypes['unionNames'];
  abstractTypeMembers: NexusGenAbstractTypeMembers;
  objectsUsingAbstractStrategyIsTypeOf: NexusGenObjectsUsingAbstractStrategyIsTypeOf;
  abstractsUsingStrategyResolveType: NexusGenAbstractsUsingStrategyResolveType;
  features: NexusGenFeaturesConfig;
}


declare global {
  interface NexusGenPluginTypeConfig<TypeName extends string> {
  }
  interface NexusGenPluginInputTypeConfig<TypeName extends string> {
  }
  interface NexusGenPluginFieldConfig<TypeName extends string, FieldName extends string> {
    /**
     * Authorization for an individual field. Returning "true"
     * or "Promise<true>" means the field can be accessed.
     * Returning "false" or "Promise<false>" will respond
     * with a "Not Authorized" error for the field.
     * Returning or throwing an error will also prevent the
     * resolver from executing.
     */
    authorize?: FieldAuthorizeResolver<TypeName, FieldName>
  }
  interface NexusGenPluginInputFieldConfig<TypeName extends string, FieldName extends string> {
  }
  interface NexusGenPluginSchemaConfig {
  }
  interface NexusGenPluginArgConfig {
  }
}