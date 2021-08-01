/* eslint-disable no-console */
import server from "./server";

server
  .listen({ port: process.env.PORT || 4000 })
  .then(({ url }: { url: string }) => {
    console.log(`🚀 Server ready at ${url}`);
  })
  .catch(() => {
    console.error("Could not start server");
  });
