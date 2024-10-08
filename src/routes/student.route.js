import { Router } from "express";
import { checkHealth, login, signup, logout } from "../controllers/student.controller.js";
import { body } from "express-validator";
import { verifyStudentJWT } from "../middlewares/auth.middleware.js";
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

router
    .route("/signup")
    .post(
        body("firstName")
            .notEmpty()
            .isString()
            .withMessage("Enter first name"),
        body("middleName")
            .optional()
            .isString()
            .withMessage("Middle name must be a string"),
        body("lastName")
            .optional()
            .isString()
            .withMessage("Enter last name"),
        body("username")
            .notEmpty()
            .isString()
            .withMessage("Enter username"),
        body("email")
            .isEmail()
            .withMessage("Enter a valid email"),
        body("student_id")
            .isInt()
            .notEmpty()
            .withMessage("Enter your roll number"),
        body("password")
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters long"),
        body("confirmPassword")
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error('Password confirmation does not match password');
                }
                return true;
            }),
        signup
    );


router.route("/checkAuth").get(verifyStudentJWT, (req, res) => {
    return res
        .status(200)
        .send(new ApiResponse(200, req.user, "User is authenticated"));
});

router.route("/logout").post(verifyStudentJWT, logout);

export default router;
