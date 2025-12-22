import mongoose from "mongoose";
import dotenv from "dotenv";
import { log, error } from "./chalk.js";

dotenv.config({ quiet: true });

async function connectToMongoDB() {
    try {
        await mongoose.connect(process.env.mongoURI);
        console.log(`${log("log")}: mongoDB connected successfully.`);
    } catch (err) {
        console.error(`${error("error")}: ${err.message}.`);
        process.exit(1);
    }
}

export { connectToMongoDB };