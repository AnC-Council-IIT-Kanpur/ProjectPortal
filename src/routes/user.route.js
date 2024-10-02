import { Router } from "express";
import { checkHealth } from "../controllers/user.controller.js";

const router = Router();

router.route("/health").get(checkHealth);

export default router;