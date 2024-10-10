import express from 'express';
import { createApplication, updateApplication, getApplications } from '../controllers/application.controller.js';

const router = express.Router();

// Route for creating an application (POST)
router.post('/applications', createApplication);

// Route for updating an application (PUT)
router.put('/applications/:id', updateApplication);

// Route for fetching all applications (GET)
router.get('/applications', getApplications);

export default router;
