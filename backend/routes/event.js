// routes/eventRoutes.js

const express = require('express');
const { createEvent, getUpcomingEvents, getPastEvents, deleteEvent } = require('../controllers/eventController');
const authMiddleware = require('../middleware/authMiddleware');

const eventRouter = express.Router();

// Route to create a new event (requires authentication)
eventRouter.post('/create', authMiddleware, createEvent);


// Route to get all upcoming events
eventRouter.get('/upcoming', getUpcomingEvents);

// Route to get all past events
eventRouter.get('/past', getPastEvents);

// Route to delete an event by its ID (requires authentication)
eventRouter.delete('/:eventId', authMiddleware, deleteEvent);

module.exports = eventRouter;
