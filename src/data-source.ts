import { DataSource } from "typeorm";
import "reflect-metadata";
import * as dotenv from "dotenv";
import { User } from "./entities/User";
import { Facility } from "./entities/Facility";
import { Booking } from "./entities/Booking";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: true,
  extra: {
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  },
  entities: [User, Facility, Booking],
  synchronize: false,
  logging: process.env.NODE_ENV === "development",
  logger: "advanced-console",
  migrationsRun: false,
});
