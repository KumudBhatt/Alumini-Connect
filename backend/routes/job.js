const express = require('express');
const jobRouter = express.Router();
const {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
} = require('../controllers/jobController');
const authMiddleware = require('../middleware/authMiddleware');

// Job routes
jobRouter.post("/create", authMiddleware, createJob);       // Create a job
jobRouter.get("/", getJobs);                               // Get all jobs (with filters)
jobRouter.get("/:jobId", getJobById);                      // Get a job by ID
jobRouter.put("/update/:jobId", authMiddleware, updateJob); // Update a job
jobRouter.delete("/delete/:jobId", authMiddleware, deleteJob); // Delete a job

module.exports = jobRouter;
