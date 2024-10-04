import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError, ApiResponse } from "../utils/ApiErrorRes.js";
import bcrypt from "bcrypt";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { pool } from "../db/index.js";
import dotenv from "dotenv";
import { searchProfByUsernameOrEmailQuery } from "../queries/profs.queries.js";
import {
    searchProjectByProfIdQuery,
    createProjectInsertQuery,
} from "../queries/projects.queries.js";

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

const createProject = asyncHandler(async (req, res) => {
    if (!req.user || !req.user.prof_id) {
        return res
            .status(403)
            .send(
                new ApiResponse(
                    403,
                    null,
                    "Unauthorized: Only authenticated professors can create projects"
                )
            );
    }

    const project = req.body;
    project.prof_id = req.user.email;

    // Validate request
    if (!project.title || !project.start_date) {
        return res
            .status(400)
            .send(
                new ApiResponse(
                    400,
                    null,
                    "Required fields (title, start_date) are missing"
                )
            );
    }

    const insertQuery = createProjectInsertQuery(project);

    try {
        await pool.query(insertQuery);
        return res
            .status(201)
            .send(
                new ApiResponse(201, project, "Project created successfully")
            );
    } catch (err) {
        return res
            .status(500)
            .send(
                new ApiResponse(500, err, "Error creating project in database")
            );
    }
});
// Update a project by ID
const updateProjectById = asyncHandler(async (req, res) => {
    const { project_id } = req.params;
    const updates = req.body;

    // Fetch the existing project to verify ownership
    const projectQuery = "SELECT * FROM project WHERE project_id = $1;";
    const projectValues = [project_id];

    try {
        const projectResponse = await pool.query(projectQuery, projectValues);
        if (projectResponse.rows.length === 0) {
            return res
                .status(404)
                .send(new ApiResponse(404, null, "Project not found"));
        }

        const existingProject = projectResponse.rows[0];

        // Check if the requesting professor is the owner
        if (existingProject.prof_id !== req.user.prof_id) {
            return res
                .status(403)
                .send(
                    new ApiResponse(
                        403,
                        null,
                        "You are not authorized to update this project"
                    )
                );
        }

        // Prepare updates
        const fields = Object.keys(updates)
            .map((key, index) => `${key} = $${index + 1}`)
            .join(", ");

        const values = Object.values(updates);

        if (fields.length === 0) {
            return res
                .status(400)
                .send(
                    new ApiResponse(400, null, "No fields provided for update")
                );
        }

        const query = `UPDATE project SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE project_id = $${values.length + 1} RETURNING *;`;
        values.push(project_id);

        const queryResponse = await pool.query(query, values);
        return res
            .status(200)
            .send(
                new ApiResponse(
                    200,
                    queryResponse.rows[0],
                    "Project updated successfully"
                )
            );
    } catch (err) {
        return res
            .status(500)
            .send(new ApiResponse(500, err, "Error updating project"));
    }
});
// Delete a project by ID
const deleteProjectById = asyncHandler(async (req, res) => {
    const { project_id } = req.params;

    // Fetch the existing project to verify ownership
    const projectQuery = "SELECT * FROM project WHERE project_id = $1;";
    const projectValues = [project_id];

    try {
        const projectResponse = await pool.query(projectQuery, projectValues);
        if (projectResponse.rows.length === 0) {
            return res
                .status(404)
                .send(new ApiResponse(404, null, "Project not found"));
        }

        const existingProject = projectResponse.rows[0];

        // Check if the requesting professor is the owner
        if (existingProject.prof_id !== req.user.prof_id) {
            return res
                .status(403)
                .send(
                    new ApiResponse(
                        403,
                        null,
                        "You are not authorized to delete this project"
                    )
                );
        }

        const query = "DELETE FROM project WHERE project_id = $1 RETURNING *;";
        const values = [project_id];

        const queryResponse = await pool.query(query, values);
        return res
            .status(200)
            .send(new ApiResponse(200, null, "Project deleted successfully"));
    } catch (err) {
        return res
            .status(500)
            .send(new ApiResponse(500, err, "Error deleting project"));
    }
});
const getProjectsByProfId = asyncHandler(async (req, res) => {
    const { prof_id } = req.params;
    const { status } = req.query;

    let query = searchProjectByProfIdQuery;
    let values = [prof_id];

    if (status) {
        query += " AND status = $2;";
        values.push(status);
    }

    try {
        const queryResponse = await pool.query(query, values);
        if (queryResponse.rows.length === 0) {
            return res
                .status(404)
                .send(
                    new ApiResponse(
                        404,
                        null,
                        "No projects found for this professor with the given criteria"
                    )
                );
        }
        return res
            .status(200)
            .send(
                new ApiResponse(
                    200,
                    queryResponse.rows,
                    "Projects retrieved successfully"
                )
            );
    } catch (err) {
        return res
            .status(500)
            .send(
                new ApiResponse(
                    500,
                    err,
                    "Error retrieving projects by professor ID"
                )
            );
    }
});
const getAllProjects = asyncHandler(async (req, res) => {
    const query = "SELECT * FROM project;";

    try {
        const queryResponse = await pool.query(query);
        return res
            .status(200)
            .send(
                new ApiResponse(
                    200,
                    queryResponse.rows,
                    "Projects retrieved successfully"
                )
            );
    } catch (err) {
        return res
            .status(500)
            .send(new ApiResponse(500, err, "Error retrieving projects"));
    }
});

const getProjectById = asyncHandler(async (req, res) => {
    const { project_id } = req.params;
    const query = "SELECT * FROM project WHERE project_id = $1;";
    const values = [project_id];

    try {
        const queryResponse = await pool.query(query, values);
        if (queryResponse.rows.length === 0) {
            return res
                .status(404)
                .send(new ApiResponse(404, null, "Project not found"));
        }
        return res
            .status(200)
            .send(
                new ApiResponse(
                    200,
                    queryResponse.rows[0],
                    "Project retrieved successfully"
                )
            );
    } catch (err) {
        return res
            .status(500)
            .send(new ApiResponse(500, err, "Error retrieving project"));
    }
});

export {
    checkHealth,
    login,
    logout,
    createProject,
    getAllProjects,
    getProjectById,
    updateProjectById,
    deleteProjectById,
    getProjectsByProfId,
};
