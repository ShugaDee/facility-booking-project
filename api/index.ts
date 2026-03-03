import "reflect-metadata";
import app from "../src/app";
import { AppDataSource } from "../src/data-source";

let initialized = false;

export default async function handler(req: any, res: any) {
    if (!initialized) {
        try {
            if (!AppDataSource.isInitialized) {
                await AppDataSource.initialize();
            }
            initialized = true;
            console.log("Database connected from Vercel Serverless");
        } catch (error) {
            console.error("Database connection error:", error);
        }
    }

    // Pass the request to the Express app
    return app(req, res);
}
