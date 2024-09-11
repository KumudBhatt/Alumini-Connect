const express = require('express');
const postRouter = express.Router();
const {
    createPost,
    deletePost,
    addComment,
    deleteComment,
    likePost,
    unlikePost,
} = require('../controllers/postController');
const authMiddleware = require('../middleware/authMiddleware');

// Post routes
postRouter.post("/create", authMiddleware, createPost);           // Create a post
postRouter.delete("/delete/:postId", authMiddleware, deletePost); // Delete a post

// Comment routes (now using postId as a path parameter)
postRouter.post("/:postId/comment", authMiddleware, addComment);          // Add a comment
postRouter.delete("/:postId/comment/:commentId", authMiddleware, deleteComment); // Delete a comment

// Like routes
postRouter.post("/like/:postId", authMiddleware, likePost);       // Like a post
postRouter.delete("/unlike/:postId", authMiddleware, unlikePost); // Unlike a post

module.exports = postRouter;
