import express from 'express';
import { createApplication, updateApplication } from '../controllers/application.controller.js';

const router = express.Router();

// Route for creating an application
router.post('/applications', createApplication);

// Route for updating an application by application_id
router.put('/applications', updateApplication);

export default router;
