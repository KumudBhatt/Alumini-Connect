const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
const { formatResponse } = require('../utils');

const prisma = new PrismaClient();

// Validation schema for creating job
const createJobSchema = z.object({
    title: z.string().min(1).max(255),
    company: z.string().min(1).max(255),
    experience: z.string().min(1).max(255),
    location: z.string().min(1).max(255),
    jobType: z.string().min(1).max(255),
    industry: z.string().min(1).max(255),
    jobFunction: z.string().min(1).max(255),
    remote: z.string().min(1).max(255),
});

// Get all jobs with optional filters
const getJobs = async (req, res) => {
    const { title, company, experience, location, jobType, industry, jobFunction, remote } = req.query;

    try {
        const jobs = await prisma.job.findMany({
            where: {
                title: title ? { contains: title, mode: 'insensitive' } : undefined,
                company: company ? { contains: company, mode: 'insensitive' } : undefined,
                experience: experience ? { equals: experience } : undefined,
                location: location ? { contains: location, mode: 'insensitive' } : undefined,
                jobType: jobType ? { equals: jobType } : undefined,
                industry: industry ? { contains: industry, mode: 'insensitive' } : undefined,
                jobFunction: jobFunction ? { contains: jobFunction, mode: 'insensitive' } : undefined,
                remote: remote ? { equals: remote } : undefined,
            },
        });

        return res.status(200).json(formatResponse(200, "Jobs fetched successfully.", jobs));
    } catch (error) {
        return res.status(500).json(formatResponse(500, "Error fetching jobs.", error.message));
    }
};

// Create a new job
const createJob = async (req, res) => {
    const validationResult = createJobSchema.safeParse(req.body);

    if (!validationResult.success) {
        return res.status(400).json(formatResponse(400, "Validation failed", validationResult.error.errors));
    }

    const { title, company, experience, location, jobType, industry, jobFunction, remote } = validationResult.data;

    try {
        const newJob = await prisma.job.create({
            data: { title, company, experience, location, jobType, industry, jobFunction, remote },
        });

        return res.status(201).json(formatResponse(201, "Job created successfully.", newJob));
    } catch (error) {
        return res.status(500).json(formatResponse(500, "Error creating job.", error.message));
    }
};

// Get a single job by ID
const getJobById = async (req, res) => {
    const { jobId } = req.params;

    try {
        const job = await prisma.job.findUnique({ where: { id: parseInt(jobId) } });

        if (!job) {
            return res.status(404).json(formatResponse(404, "Job not found."));
        }

        return res.status(200).json(formatResponse(200, "Job fetched successfully.", job));
    } catch (error) {
        return res.status(500).json(formatResponse(500, "Error fetching job.", error.message));
    }
};

// Update a job
const updateJob = async (req, res) => {
    const { jobId } = req.params;
    const validationResult = createJobSchema.safeParse(req.body);

    if (!validationResult.success) {
        return res.status(400).json(formatResponse(400, "Validation failed", validationResult.error.errors));
    }

    const { title, company, experience, location, jobType, industry, jobFunction, remote } = validationResult.data;

    try {
        const updatedJob = await prisma.job.update({
            where: { id: parseInt(jobId) },
            data: { title, company, experience, location, jobType, industry, jobFunction, remote },
        });

        return res.status(200).json(formatResponse(200, "Job updated successfully.", updatedJob));
    } catch (error) {
        return res.status(500).json(formatResponse(500, "Error updating job.", error.message));
    }
};

// Delete a job
const deleteJob = async (req, res) => {
    const { jobId } = req.params;

    try {
        await prisma.job.delete({ where: { id: parseInt(jobId) } });

        return res.status(200).json(formatResponse(200, "Job deleted successfully."));
    } catch (error) {
        return res.status(500).json(formatResponse(500, "Error deleting job.", error.message));
    }
};

module.exports = {
    getJobs,
    createJob,
    getJobById,
    updateJob,
    deleteJob,
};