import express, { Express } from "express";
import cors from "cors";
import path from "path";
import facilitiesRouter from "./routes/facilities";
import bookingsRouter from "./routes/bookings";
import usersRouter from "./routes/users";
import { BookingController } from "./controllers/BookingController";

const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/facilities", facilitiesRouter);
app.use("/bookings", bookingsRouter);
app.use("/users", usersRouter);
app.get("/availability", BookingController.checkAvailability);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ message: "Server is running" });
});

// Serve frontend static files from the client folder
// Note: In TS, dist/src/app.js is the compiled path, so we go up two levels to reach the root.
app.use(express.static(path.join(__dirname, "../../client")));

// Fallback to index.html for any frontend SPA navigation
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../client/index.html"));
});

// 404 handler (Catch-all for API errors)
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

export default app;
