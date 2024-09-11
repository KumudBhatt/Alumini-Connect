const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all success stories
const getSuccessStories = async (req, res) => {
  try {
    const successStories = await prisma.successStory.findMany({
      where: {
        published: true, // Only get published stories
      },
      include: {
        author: true, // Include author details
      },
    });
    res.status(200).json({ success: true, data: successStories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a new success story
const createSuccessStory = async (req, res) => {
  const { title, description, authorId } = req.body;
  
  try {
    const newSuccessStory = await prisma.successStory.create({
      data: {
        title,
        description,
        authorId,
      },
    });
    res.status(201).json({ success: true, data: newSuccessStory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Publish or unpublish a success story (Only Admins)
const publishSuccessStory = async (req, res) => {
  const { storyId } = req.params;
  const { published } = req.body;
  const { userId } = req; // Assume userId is set in the request by authentication middleware

  try {
    // Check if the user is an admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Only admins can publish or unpublish success stories.' });
    }

    // Proceed with publishing/unpublishing
    const updatedStory = await prisma.successStory.update({
      where: { id: parseInt(storyId) },
      data: { published },
    });

    res.status(200).json({ success: true, data: updatedStory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getSuccessStories,
  createSuccessStory,
  publishSuccessStory,
};
