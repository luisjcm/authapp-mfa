import { Router } from "express";
import { login, verifyMFA } from "../controllers/auth.controllers.js";

const router = Router();
router.post("/login", login);
router.post("/verify", verifyMFA);

export default router;