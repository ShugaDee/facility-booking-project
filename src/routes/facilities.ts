import { Router } from "express";
import { FacilityController } from "../controllers/FacilityController";

const router = Router();

router.get("/", FacilityController.getAllFacilities);
router.get("/:id", FacilityController.getFacilityById);

export default router;
