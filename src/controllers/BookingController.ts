import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Booking } from "../entities/Booking";
import { Facility } from "../entities/Facility";
import { User } from "../entities/User";

const bookingRepository = AppDataSource.getRepository(Booking);
const facilityRepository = AppDataSource.getRepository(Facility);
const userRepository = AppDataSource.getRepository(User);

export class BookingController {
  static async getBookings(req: Request, res: Response): Promise<void> {
    try {
      const bookings = await bookingRepository.find({
        relations: ["user", "facility"],
      });
      res.status(200).json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving bookings", error });
    }
  }

  static async createBooking(req: Request, res: Response): Promise<void> {
    try {
      const { facility_id, user_id, date, start_time, end_time, status } =
        req.body;

      // Validate required fields
      if (!facility_id || !user_id || !date || !start_time || !end_time) {
        res.status(400).json({ message: "Missing required fields" });
        return;
      }

      // Check if facility exists
      const facility = await facilityRepository.findOne({
        where: { id: facility_id },
      });
      if (!facility) {
        res.status(404).json({ message: "Facility not found" });
        return;
      }

      // Check if user exists
      const user = await userRepository.findOne({
        where: { id: user_id },
      });
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      // Check for booking conflicts
      const existingBooking = await bookingRepository.findOne({
        where: {
          facility_id,
          date,
          status: "confirmed",
        },
      });

      if (existingBooking) {
        const existingStart = existingBooking.start_time;
        const existingEnd = existingBooking.end_time;

        if (
          (start_time >= existingStart && start_time < existingEnd) ||
          (end_time > existingStart && end_time <= existingEnd) ||
          (start_time <= existingStart && end_time >= existingEnd)
        ) {
          res
            .status(409)
            .json({ message: "Facility is already booked for this time slot" });
          return;
        }
      }

      const newBooking = bookingRepository.create({
        facility_id,
        user_id,
        date,
        start_time,
        end_time,
        status: status || "pending",
      });

      const savedBooking = await bookingRepository.save(newBooking);
      res.status(201).json(savedBooking);
    } catch (error) {
      res.status(500).json({ message: "Error creating booking", error });
    }
  }

  static async updateBooking(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const booking = await bookingRepository.findOne({
        where: { id: parseInt(id) },
      });

      if (!booking) {
        res.status(404).json({ message: "Booking not found" });
        return;
      }

      if (status) {
        booking.status = status;
      }

      const updatedBooking = await bookingRepository.save(booking);
      res.status(200).json(updatedBooking);
    } catch (error) {
      res.status(500).json({ message: "Error updating booking", error });
    }
  }

  static async deleteBooking(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const booking = await bookingRepository.findOne({
        where: { id: parseInt(id) },
      });

      if (!booking) {
        res.status(404).json({ message: "Booking not found" });
        return;
      }

      booking.status = "cancelled";
      await bookingRepository.save(booking);

      res.status(200).json({ message: "Booking cancelled successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error cancelling booking", error });
    }
  }

  static async checkAvailability(req: Request, res: Response): Promise<void> {
    try {
      const { facilityId, date } = req.query;

      if (!facilityId || !date) {
        res.status(400).json({ message: "facilityId and date are required" });
        return;
      }

      // Check if facility exists
      const facility = await facilityRepository.findOne({
        where: { id: parseInt(facilityId as string) },
      });

      if (!facility) {
        res.status(404).json({ message: "Facility not found" });
        return;
      }

      // Get all confirmed bookings for this date
      const bookings = await bookingRepository.find({
        where: {
          facility_id: parseInt(facilityId as string),
          date: date as string,
          status: "confirmed",
        },
      });

      // Generate all 30-minute slots for a day (8 AM to 6 PM)
      const allSlots = [];
      for (let hour = 8; hour < 18; hour++) {
        allSlots.push(
          `${String(hour).padStart(2, "0")}:00`,
          `${String(hour).padStart(2, "0")}:30`,
        );
      }

      // Find available slots
      const availableSlots = allSlots.filter((slot) => {
        const [slotHour, slotMin] = slot.split(":").map(Number);
        const slotTime = `${String(slotHour).padStart(2, "0")}:${String(slotMin).padStart(2, "0")}`;

        return !bookings.some((booking) => {
          return slotTime >= booking.start_time && slotTime < booking.end_time;
        });
      });

      res.status(200).json({ date, facilitId: facilityId, availableSlots });
    } catch (error) {
      res.status(500).json({ message: "Error checking availability", error });
    }
  }
}
