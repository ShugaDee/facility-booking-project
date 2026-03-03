import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Facility } from "../entities/Facility";

const facilityRepository = AppDataSource.getRepository(Facility);

export class FacilityController {
  static async getAllFacilities(req: Request, res: Response): Promise<void> {
    try {
      const facilities = await facilityRepository.find();
      res.status(200).json(facilities);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error retrieving facilities", error: error });
    }
  }

  static async getFacilityById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const facility = await facilityRepository.findOne({
        where: { id: parseInt(id) },
      });

      if (!facility) {
        res.status(404).json({ message: "Facility not found" });
        return;
      }

      res.status(200).json(facility);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error retrieving facility", error: error });
    }
  }

  static async createFacility(req: Request, res: Response): Promise<void> {
    try {
      const { name, location, capacity } = req.body;

      if (!name || !location || !capacity) {
        res.status(400).json({ message: "Name, location, and capacity are required" });
        return;
      }

      const newFacility = facilityRepository.create({
        name,
        location,
        capacity: parseInt(capacity),
      });

      const savedFacility = await facilityRepository.save(newFacility);
      res.status(201).json(savedFacility);
    } catch (error) {
      res.status(500).json({ message: "Error creating facility", error });
    }
  }

  static async updateFacility(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, location, capacity } = req.body;

      const facility = await facilityRepository.findOne({
        where: { id: parseInt(id) },
      });

      if (!facility) {
        res.status(404).json({ message: "Facility not found" });
        return;
      }

      if (name) facility.name = name;
      if (location) facility.location = location;
      if (capacity) facility.capacity = parseInt(capacity);

      const updatedFacility = await facilityRepository.save(facility);
      res.status(200).json(updatedFacility);
    } catch (error) {
      res.status(500).json({ message: "Error updating facility", error });
    }
  }

  static async deleteFacility(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const facility = await facilityRepository.findOne({
        where: { id: parseInt(id) },
      });

      if (!facility) {
        res.status(404).json({ message: "Facility not found" });
        return;
      }

      await facilityRepository.remove(facility);
      res.status(200).json({ message: "Facility deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting facility", error });
    }
  }
}
