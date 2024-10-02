import { Router } from "express";
import { checkHealth, login, logout} from "../controllers/prof.controller.js";
import { body } from "express-validator";
import { verifyProfJWT } from "../middlewares/auth.middleware.js";
import { ApiResponse } from "../utils/ApiErrorRes.js";

router.route("/login").post(
    body("username")
        .notEmpty()
        .withMessage("Please enter username or email"),
    body("password")
        .trim()
        .notEmpty()
        .withMessage("Password cannot be empty"),
    login);

    router.route("/checkAuth").get(verifyProfJWT, (req, res) => {
        return res.status(200).send(new ApiResponse(200, req.user, "User is authenticated"));
    }) ;
    
    router.route("/logout").post(verifyProfJWT, logout);
    
    export default router;