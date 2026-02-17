import { Router } from "express";
import { BookingController } from "../controllers/BookingController";

const router = Router();

router.get("/", BookingController.getBookings);
router.post("/", BookingController.createBooking);
router.put("/:id", BookingController.updateBooking);
router.delete("/:id", BookingController.deleteBooking);

export default router;
