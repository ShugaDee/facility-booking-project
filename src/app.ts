import express, { Express } from "express";
import facilitiesRouter from "./routes/facilities";
import bookingsRouter from "./routes/bookings";
import { BookingController } from "./controllers/BookingController";

const app: Express = express();

// Middleware
app.use(express.json());

// Routes
app.use("/facilities", facilitiesRouter);
app.use("/bookings", bookingsRouter);
app.get("/availability", BookingController.checkAvailability);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ message: "Server is running" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

export default app;
