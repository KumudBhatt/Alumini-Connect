const express = require('express');
const { createFeedback, getAllFeedbacks, deleteFeedback } = require('../controllers/feedbackController');
const authMiddleware = require('../middleware/authMiddleware');

const feedbackRouter = express.Router();

// Route to create feedback
feedbackRouter.post('/feedback', authMiddleware, createFeedback);

// Route to get all feedbacks (Admin access)
feedbackRouter.get('/feedbacks', authMiddleware, getAllFeedbacks);

// Route to delete feedback
feedbackRouter.delete('/feedback/:feedbackId', authMiddleware, deleteFeedback);

module.exports = feedbackRouter;
