import "dotenv/config";
import { Client } from "@elastic/elasticsearch";

const main = async () => {
  const client = new Client({
    node: process.env.ELASTIC_APP_SEARCH_URL,
    auth: {
      apiKey: process.env.ELASTIC_APP_SEARCH_API_KEY ?? "",
    },
  });
  console.log(client);

  let result;
  try {
    result = await client.search({
      index: "food",
      body: {
        query: {
          match: { description: "kale" },
        },
      },
    });
  } catch (e) {
    console.log(e);
  }

  console.log(result);
};

main();
