import { pool } from '../db/index.js';
import { createApplicationInsertQuery, searchProjectByIdQuery, applicationUpdateQuery } from '../queries/application.queries.js';
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

    // Check if an application for the same project_id already exists
    const existingApplication = await pool.query(
        `SELECT * FROM application WHERE project_id = $1`,
        [project_id]
    );

    if (existingApplication.rowCount > 0) {
        return res.status(409).send(new ApiResponse(409, null, "Application for this project already exists"));
    }

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


const updateApplication = asyncHandler(async (req, res) => {
    const { application_id, prof_id, deadline, status } = req.body; // Extracting prof_id now

    try {
        // Verify that the application exists by application_id
        const applicationResponse = await pool.query('SELECT * FROM application WHERE application_id = $1', [application_id]);

        if (applicationResponse.rowCount === 0) {
            return res.status(404).send(new ApiResponse(404, null, "Application not found"));
        }

        // Optional: Verify that the prof_id matches with the existing application if needed
        // const existingApplication = applicationResponse.rows[0];
        // if (existingApplication.prof_id !== prof_id) {
        //     return res.status(403).send(new ApiResponse(403, null, "Unauthorized to update this application"));
        // }

        // Update the application deadline, status, and prof_id (if necessary)
        const values = [deadline, status, application_id];
        const updateResponse = await pool.query(applicationUpdateQuery, values);

        return res.status(200).send(new ApiResponse(200, updateResponse.rows[0], "Application updated successfully"));
    } catch (error) {
        console.error("Error updating application:", error);
        return res.status(500).send(new ApiResponse(500, error, "Internal server error"));
    }
});

export { createApplication, updateApplication };
