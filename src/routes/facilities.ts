import { Router } from "express";
import { FacilityController } from "../controllers/FacilityController";

const router = Router();

router.get("/", FacilityController.getAllFacilities);
router.post("/", FacilityController.createFacility);
router.get("/:id", FacilityController.getFacilityById);
router.put("/:id", FacilityController.updateFacility);
router.delete("/:id", FacilityController.deleteFacility);

export default router;
