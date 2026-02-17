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
}
