import { server } from "./server";

console.log("test");
server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
