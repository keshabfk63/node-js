import http from "http";
import app from "./app";
const httpServer = http.createServer(app);
const PORT: number = 9006;
const HOST: string = "localhost";

httpServer.listen(PORT, HOST, () => {
  console.log(`Server is running at ${"http://" + HOST + ":" + PORT}`);
  console.log("TO stop server from running press ctrl + c");
});

httpServer.on("error", (err) => {
  console.log("SERVER error");
  console.log(err);
  process.exit(1);
});
