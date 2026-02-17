import "reflect-metadata";
import app from "./app";
import { AppDataSource } from "./data-source";

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log("Database connected successfully");

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}

start();
