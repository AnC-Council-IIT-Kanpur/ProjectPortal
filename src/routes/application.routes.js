// application.routes.js
import express from 'express';
import { createApplication, updateApplication } from '../controllers/application.controller.js';

const router = express.Router();

// Route for creating an application
router.post('/applications', createApplication);

// Route for updating an application
router.put('/applications', updateApplication); // New route for updating applications

export default router;
