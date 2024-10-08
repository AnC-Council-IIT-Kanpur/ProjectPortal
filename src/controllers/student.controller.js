import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError, ApiResponse } from "../utils/ApiErrorRes.js";
import bcrypt from "bcrypt";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { pool } from "../db/index.js";
import dotenv from "dotenv";
import { searchStudentByUsernameOrEmailQuery } from "../queries/students.query.js";
import { createStudentInsertQuery } from "../queries/students.query.js";

dotenv.config({ path: "././.env" });

const checkHealth = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .send(
            new ApiResponse(
                200,
                { "Student route status": "Healthy" },
                "Student route is working fine"
            )
        );
});

const login = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res
            .status(400)
            .send(
                new ApiResponse(
                    400,
                    errors.array(),
                    "Validation error, empty fields"
                )
            );
    }

    const { username, password } = req.body;

    const query = searchStudentByUsernameOrEmailQuery;
    const values = [username, username];
    let user;
    try {
        const queryResponse = await pool.query(query, values);
        user = queryResponse.rows[0];
    } catch (err) {
        return res
            .status(500)
            .send(
                new ApiResponse(
                    500,
                    err,
                    "Unable to reach database, at this moment"
                )
            );
    }

    if (!user || user.length === 0) {
        return res
            .status(404)
            .send(new ApiResponse(404, null, "User not found"));
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        return res
            .status(401)
            .send(new ApiResponse(401, null, "Invalid password"));
    }

    const accessToken = jwt.sign(
        { username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: process.env.SESSION_EXPIRY }
    );

    const httpOptions = {
        httpOnly: true,
        secure: false,
        sameSite: "None",
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, httpOptions)
        .send(
            new ApiResponse(
                200,
                { username, accessToken },
                "User logged in successfully"
            )
        );
});
const signup = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res
            .status(400)
            .send(
                new ApiResponse(
                    400,
                    errors.array(),
                    "Validation error, empty fields"
                )
            );
    }
    const {
        username,
        student_id,
        email_id,
        password,
        first_name,
        middle_name,
        last_name,
    } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = {
        student_id,
        username,
        email_id,
        password: hashedPassword,  // Use the hashed password
        first_name,
        middle_name,
        last_name,
    };
    const query = createStudentInsertQuery(student)

    try {
        await pool.query(query);
        const accessToken = jwt.sign(
            { username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: process.env.SESSION_EXPIRY }
        );
        const httpOptions = {
            httpOnly: true,
            secure: false,
            sameSite: "None",
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, httpOptions)
            .send(
                new ApiResponse(
                    200,
                    { username: student.username, accessToken },
                    "User signed up successfully"
                )
            );
    } catch (err) {
        if (err.code === '23505') {  // Postgres error code for unique constraint violation
            return res.status(400).send(
                new ApiResponse(400, err.detail, "Username or email already exists")
            );
        }
        return res.status(500).send(
            new ApiResponse(500, err, "Error inserting student into database")
        );
    }
});

const logout = asyncHandler(async (req, res) => {
    const httpOptions = {
        httpOnly: true,
        secure: false,
        sameSite: "None",
    };

    return res
        .status(200)
        .clearCookie("accessToken", httpOptions)
        .clearCookie("refreshToken", httpOptions)
        .send(new ApiResponse(200, {}, "User logged out successfully"));
});

export { checkHealth, login, signup, logout };
