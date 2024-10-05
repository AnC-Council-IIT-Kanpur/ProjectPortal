import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError, ApiResponse } from "../utils/ApiErrorRes.js";
import bcrypt from "bcrypt";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { pool } from "../db/index.js";
import dotenv from "dotenv";
import { searchProfByUsernameOrEmailQuery } from "../queries/profs.queries.js";

dotenv.config({ path: "././.env" });

const checkHealth = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .send(
            new ApiResponse(
                200,
                { "Prof route status": "Healthy" },
                "Prof route is working fine"
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

    const query = searchProfByUsernameOrEmailQuery;
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

const notice = asyncHandler(async (req, res) => {
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
    return res
        .status(200)
        .send(new ApiResponse(200, { Notice: "Added" }, "New notice is added"));
});

export { checkHealth, login, logout, notice };