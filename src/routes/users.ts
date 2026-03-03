import { Router } from "express";
import { UserController } from "../controllers/UserController";

const router = Router();

router.post("/signup", UserController.createUser);
router.post("/login", UserController.loginUser);
router.get("/", UserController.getAllUsers);
router.patch("/:id/role", UserController.updateUserRole);
router.delete("/:id", UserController.deleteUser);

export default router;
