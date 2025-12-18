import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({quiet: true});

async function connectToMongoDB() {
    try {
        await mongoose.connect(process.env.mongoURI);
        console.log("log: mongoDB connected successfully.");
    } catch(err) {
        console.error(`error: ${err.message}.`);
        process.exit(1);
    }
}

export { connectToMongoDB };