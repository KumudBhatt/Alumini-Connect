// controllers/EventController.js

const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
const { formatResponse } = require('../utils');
const prisma = new PrismaClient();

// Validation schema for creating event
const createEventSchema = z.object({
    title: z.string().min(1, "Event title is required").max(100),
    content: z.string().min(1, "Event content is required"),
    images: z.array(z.string().url()).optional(), // Optional list of image URLs
    link: z.string().url().optional(), // Optional link for event
    date: z.date(), // Date when the event is scheduled
});

// Create event
const createEvent = async (req, res) => {
    const userId = req.userId; // Authenticated user's ID
    const data = req.body;

    // Validate incoming data using Zod
    const validationResult = createEventSchema.safeParse(data);
    if (!validationResult.success) {
        return res.status(400).json(formatResponse(400, validationResult.error.errors));
    }

    const { title, content, images, link, date } = validationResult.data;

    try {
        // Create event in database
        const event = await prisma.event.create({
            data: {
                title,
                content,
                images: images || null,
                link: link || null,
                date, // Set event date
                userId, // Reference to the authenticated user
            },
        });

        return res.status(201).json(formatResponse(201, "Event created successfully.", event));
    } catch (error) {
        return res.status(500).json(formatResponse(500, "Error creating event.", error.message));
    }
};

// Get upcoming events (events scheduled after today)
const getUpcomingEvents = async (req, res) => {
    try {
        const currentDate = new Date();

        const upcomingEvents = await prisma.event.findMany({
            where: {
                date: {
                    gt: currentDate, // Get events whose date is greater than current date
                },
            },
            orderBy: {
                date: 'asc', // Order by date in ascending order
            },
        });

        return res.status(200).json(formatResponse(200, "Upcoming events retrieved successfully.", upcomingEvents));
    } catch (error) {
        return res.status(500).json(formatResponse(500, "Error fetching upcoming events.", error.message));
    }
};

// Get past events (events scheduled before today)
const getPastEvents = async (req, res) => {
    try {
        const currentDate = new Date();

        const pastEvents = await prisma.event.findMany({
            where: {
                date: {
                    lt: currentDate, // Get events whose date is less than current date
                },
            },
            orderBy: {
                date: 'desc', // Order by date in descending order (most recent first)
            },
        });

        return res.status(200).json(formatResponse(200, "Past events retrieved successfully.", pastEvents));
    } catch (error) {
        return res.status(500).json(formatResponse(500, "Error fetching past events.", error.message));
    }
};

// Delete event (remains unchanged)
const deleteEvent = async (req, res) => {
    const eventId = parseInt(req.params.eventId, 10); // Get eventId from URL path
    const userId = req.userId;

    try {
        const event = await prisma.event.findUnique({
            where: { id: eventId },
        });

        if (!event) {
            return res.status(404).json(formatResponse(404, "Event not found."));
        }

        if (event.userId !== userId) {
            return res.status(403).json(formatResponse(403, "You are not authorized to delete this event."));
        }

        await prisma.event.delete({
            where: { id: eventId },
        });

        return res.status(200).json(formatResponse(200, "Event deleted successfully."));
    } catch (error) {
        return res.status(500).json(formatResponse(500, "Error deleting event.", error.message));
    }
};

module.exports = {
    createEvent,
    getUpcomingEvents,
    getPastEvents,
    deleteEvent,
};

