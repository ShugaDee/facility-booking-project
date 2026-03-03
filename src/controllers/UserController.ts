import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";

const userRepository = AppDataSource.getRepository(User);

export class UserController {
    static async createUser(req: Request, res: Response): Promise<void> {
        try {
            const { name, email, role } = req.body;

            if (!name || !email) {
                res.status(400).json({ message: "Name and email are required" });
                return;
            }

            // Check if user already exists
            const existingUser = await userRepository.findOne({ where: { email } });
            if (existingUser) {
                res.status(409).json({ message: "User with this email already exists" });
                return;
            }

            const newUser = userRepository.create({
                name,
                email,
                role: role === "admin" ? "admin" : "user", // Default to user unless explicitly admin
            });

            const savedUser = await userRepository.save(newUser);

            // Return user without sensitive data if any (just good practice, though we just have names and emails here)
            res.status(201).json(savedUser);
        } catch (error) {
            res.status(500).json({ message: "Error creating user", error });
        }
    }

    static async loginUser(req: Request, res: Response): Promise<void> {
        try {
            const { email } = req.body;

            if (!email) {
                res.status(400).json({ message: "Email is required to login" });
                return;
            }

            const user = await userRepository.findOne({ where: { email } });

            if (!user) {
                res.status(404).json({ message: "User not found" });
                return;
            }

            if (user.role === "blocked") {
                res.status(403).json({ message: "Account has been blocked. Please contact an administrator." });
                return;
            }

            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ message: "Error logging in", error });
        }
    }

    static async getAllUsers(req: Request, res: Response): Promise<void> {
        try {
            const users = await userRepository.find();
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ message: "Error retrieving users", error });
        }
    }

    static async updateUserRole(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { role } = req.body;

            const user = await userRepository.findOne({ where: { id: Number(id) } });

            if (!user) {
                res.status(404).json({ message: "User not found" });
                return;
            }

            user.role = role;
            const updatedUser = await userRepository.save(user);

            res.status(200).json(updatedUser);
        } catch (error) {
            res.status(500).json({ message: "Error updating user role", error });
        }
    }

    static async deleteUser(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            const user = await userRepository.findOne({ where: { id: Number(id) } });

            if (!user) {
                res.status(404).json({ message: "User not found" });
                return;
            }

            await userRepository.remove(user);
            res.status(200).json({ message: "User deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: "Error deleting user", error });
        }
    }
}
