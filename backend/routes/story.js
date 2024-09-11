const express = require('express');
const { createSuccessStory, getSuccessStories, updateSuccessStory } = require('../controllers/storyController');
const authMiddleware = require('../middlewares/authMiddleware');

const storyRouter = express.Router();

// Route to get all success stories (public access)
storyRouter.get('/', getSuccessStories);

// Route to create a new success story (requires authentication)
storyRouter.post('/create', authMiddleware, createSuccessStory);

// Route to publish/unpublish a success story (requires admin authentication)
storyRouter.put('/:storyId', authMiddleware, updateSuccessStory);

module.exports = storyRouter;
