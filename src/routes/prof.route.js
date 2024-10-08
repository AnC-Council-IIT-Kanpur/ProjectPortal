import { Router } from "express";
import {
    checkHealth,
    login,
    logout,
    createProject,
    getAllProjects,
    getProjectById,
    updateProjectById,
    deleteProjectById,
    getProjectsByProfId,
} from "../controllers/prof.controller.js";
import { body } from "express-validator";
import { verifyProfJWT } from "../middlewares/auth.middleware.js";
import { ApiResponse } from "../utils/ApiErrorRes.js";

const router = Router();

router.route("/health").get(checkHealth);

router
    .route("/login")
    .post(
        body("username")
            .notEmpty()
            .withMessage("Please enter username or email"),
        body("password")
            .trim()
            .notEmpty()
            .withMessage("Password cannot be empty"),
        login
    );

router.route("/checkAuth").get(verifyProfJWT, (req, res) => {
    return res
        .status(200)
        .send(new ApiResponse(200, req.user, "User is authenticated"));
});

router.get("/projects", getAllProjects);
router.route("/logout").post(verifyProfJWT, logout);
router.route("/").post(verifyProfJWT, createProject);
router.get("/:prof_id", getProjectsByProfId);
router
    .route("/:project_id")
    .get(getProjectById)
    .put(verifyProfJWT, updateProjectById)
    .delete(verifyProfJWT, deleteProjectById);

export default router;
