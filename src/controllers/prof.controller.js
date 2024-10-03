import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError, ApiResponse } from "../utils/ApiErrorRes.js";
import bcrypt from "bcrypt";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { pool } from "../db/index.js";
import dotenv from "dotenv";
import { searchProfByUsernameOrEmailQuery } from "../queries/profs.queries.js";
import { createProjectInsertQuery } from "../queries/projects.queries.js";

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

const createProject = asyncHandler(async (req,res) => {
    const {title, description, field_of_study, skills_required,project_type, stage, progress_percentage, start_date, end_date, vacancies, status, application_deadline, total_applications,resource_links, enrolled_count, enrollment_criteria} = req.body;

    const prof_id = req.user.prof_id;

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
    try {
        const query = createProjectInsertQuery({
            title,
            description,
            prof_id, //coming from jwt, not req.body
            field_of_study,
            skills_required,
            project_type,
            stage,
            progress_percentage,
            start_date,
            end_date,
            vacancies,
            status,
            application_deadline,
            total_applications,
            resource_links,
            enrolled_count,
            enrollment_criteria,
        });
        await pool.query(query)
        return res
            .status(201)
            .send(new ApiResponse(201, {}, "Project created successfully"));
    }catch (err){
        return res.status(500).send(new ApiResponse(500, err, "Failed to create project"))
    }



})

export { checkHealth, login, logout, createProject };
