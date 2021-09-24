import AppSearchClient from "@elastic/app-search-node";

export default new AppSearchClient(
  undefined,
  process.env.ELASTIC_APP_SEARCH_API_KEY,
  () => process.env.ELASTIC_APP_SEARCH_URL ?? ""
);
