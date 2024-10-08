// application.controller.js
import { pool } from '../db/index.js';
import { createApplicationInsertQuery, searchProjectByIdQuery, applicationUpdateQuery, checkProjectExistsQuery } from '../queries/application.queries.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiErrorRes.js';

const createApplication = asyncHandler(async (req, res) => {
    const { project_id, deadline, status } = req.body;

    // Validate that the project exists and fetch the title
    const projectResult = await pool.query(searchProjectByIdQuery, [project_id]);

    if (projectResult.rowCount === 0) {
        return res.status(404).send(new ApiResponse(404, null, "Project not found"));
    }

    const project_title = projectResult.rows[0].title;

    // Create the application with the title fetched from the project
    const insertQuery = createApplicationInsertQuery({ 
        project_title, 
        project_id, 
        deadline, 
        status 
    });

    try {
        await pool.query(insertQuery);
        return res.status(201).send(new ApiResponse(201, { project_title, project_id }, "Application created successfully"));
    } catch (error) {
        return res.status(500).send(new ApiResponse(500, error, "Error creating application"));
    }
});

// Function to update the application deadline and status
const updateApplication = asyncHandler(async (req, res) => {
    const { project_id, deadline, status } = req.body; // Extract data from the request body

    try {
        // Verify that the project_id exists in the project table
        const projectResponse = await pool.query(checkProjectExistsQuery, [project_id]);

        // Check if the project exists
        if (projectResponse.rows.length === 0) {
            return res.status(404).send(new ApiResponse(404, null, "Project not found"));
        }

        // Update the application deadline and status in the application table
        const values = [deadline, status, project_id];
        const updateResponse = await pool.query(applicationUpdateQuery, values);

        // Check if the application was updated successfully
        if (updateResponse.rowCount === 0) {
            return res.status(404).send(new ApiResponse(404, null, "Application not found"));
        }

        return res.status(200).send(new ApiResponse(200, updateResponse.rows[0], "Application updated successfully"));
    } catch (error) {
        console.error("Error updating application:", error);
        return res.status(500).send(new ApiResponse(500, error, "Internal server error"));
    }
});

export { createApplication, updateApplication };
