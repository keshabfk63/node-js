import mongoose from "mongoose";
import { dbConfig } from "./AppConfig";
import dns from "node:dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);
(async () => {
  try {
    await mongoose.connect(dbConfig.mongodb.url as string, {
      dbName: dbConfig.mongodb.dbName,
      autoCreate: true,
      autoIndex: true,
    });
    console.log("Mongodb connection sucessfull");
  } catch (exception) {
    console.error("*****Mongodb Connection Problem*****");
    console.error(exception);
    process.exit(1);
  }
})();
