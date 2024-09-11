// controllers/FeedbackController.js

const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
const { formatResponse } = require('../utils');

const prisma = new PrismaClient();

// Validation schema for creating feedback
const createFeedbackSchema = z.object({
    content: z.string().min(1, "Feedback content is required").max(500),
    attachedFile: z.string().url().optional(), // File URL is optional and validated as a URL
});

// Create feedback
const createFeedback = async (req, res) => {
    const userId = req.userId; // Authenticated user's ID
    const data = req.body;

    // Validate incoming data using Zod
    const validationResult = createFeedbackSchema.safeParse(data);
    if (!validationResult.success) {
        return res.status(400).json(formatResponse(400, validationResult.error.errors));
    }

    const { content, attachedFile } = validationResult.data;

    try {
        // Create feedback in database
        const feedback = await prisma.feedback.create({
            data: {
                content,
                attachedFile: attachedFile || null,
                userId, // Reference to the authenticated user
            },
        });

        return res.status(201).json(formatResponse(201, "Feedback created successfully.", feedback));
    } catch (error) {
        return res.status(500).json(formatResponse(500, "Error creating feedback.", error.message));
    }
};

// Get all feedbacks (Admin access)
const getAllFeedbacks = async (req, res) => {
    try {
        const feedbacks = await prisma.feedback.findMany();
        return res.status(200).json(formatResponse(200, "Feedbacks retrieved successfully.", feedbacks));
    } catch (error) {
        return res.status(500).json(formatResponse(500, "Error fetching feedbacks.", error.message));
    }
};

// Delete feedback
const deleteFeedback = async (req, res) => {
    const feedbackId = parseInt(req.params.feedbackId, 10); // Get feedbackId from URL path
    const userId = req.userId;

    try {
        const feedback = await prisma.feedback.findUnique({
            where: { id: feedbackId },
        });

        if (!feedback) {
            return res.status(404).json(formatResponse(404, "Feedback not found."));
        }

        if (feedback.userId !== userId) {
            return res.status(403).json(formatResponse(403, "You are not authorized to delete this feedback."));
        }

        await prisma.feedback.delete({
            where: { id: feedbackId },
        });

        return res.status(200).json(formatResponse(200, "Feedback deleted successfully."));
    } catch (error) {
        return res.status(500).json(formatResponse(500, "Error deleting feedback.", error.message));
    }
};

module.exports = {
    createFeedback,
    getAllFeedbacks,
    deleteFeedback,
};
