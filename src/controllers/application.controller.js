import { pool } from '../db/index.js';
import { createApplicationInsertQuery, searchProjectByIdQuery, applicationUpdateQuery, checkProjectExistsQuery } from '../queries/application.queries.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiErrorRes.js';

// Create Application
const createApplication = asyncHandler(async (req, res) => {
    const { project_id, deadline, status } = req.body;

    const projectResult = await pool.query(searchProjectByIdQuery, [project_id]);

    if (projectResult.rowCount === 0) {
        return res.status(404).send(new ApiResponse(404, null, "Project not found"));
    }

    const { title: project_title, prof_id } = projectResult.rows[0];

    const existingApplication = await pool.query(
        `SELECT * FROM application WHERE project_id = $1`,
        [project_id]
    );

    if (existingApplication.rowCount > 0) {
        return res.status(409).send(new ApiResponse(409, null, "Application for this project already exists"));
    }

    const insertQuery = createApplicationInsertQuery({ 
        project_title, 
        project_id, 
        prof_id, 
        deadline, 
        status 
    });

    try {
        await pool.query(insertQuery);
        return res.status(201).send(new ApiResponse(201, { project_title, project_id, prof_id }, "Application created successfully"));
    } catch (error) {
        console.error("Error creating application:", error);
        return res.status(500).send(new ApiResponse(500, error, "Internal server error while creating application"));
    }
});

// Update Application
const updateApplication = asyncHandler(async (req, res) => {
    const { application_id, deadline, status } = req.body;

    try {
        const applicationResponse = await pool.query('SELECT * FROM application WHERE application_id = $1', [application_id]);

        if (applicationResponse.rowCount === 0) {
            return res.status(404).send(new ApiResponse(404, null, "Application not found"));
        }

        const values = [deadline, status, application_id];
        const updateResponse = await pool.query(applicationUpdateQuery, values);

        return res.status(200).send(new ApiResponse(200, updateResponse.rows[0], "Application updated successfully"));
    } catch (error) {
        console.error("Error updating application:", error);
        return res.status(500).send(new ApiResponse(500, error, "Internal server error"));
    }
});
const getApplications = asyncHandler(async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM application');
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching applications:', error);
      res.status(500).send(new ApiResponse(500, null, 'Internal server error'));
    }
  });
  
  export { createApplication, updateApplication, getApplications };
