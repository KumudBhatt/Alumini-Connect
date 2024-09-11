const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
const { formatResponse } = require('../utils');

const prisma = new PrismaClient();

// Validation schema for creating posts
const createPostSchema = z.object({
    content: z.string().min(1, "Post content is required").max(1000),
    mediaUrls: z.array(z.string().url()).optional(),
});

// Validation schema for comments
const createCommentSchema = z.object({
    content: z.string().min(1, "Comment content is required").max(500),
});

// Create a post
const createPost = async (req, res) => {
    const userId = req.userId; // Authenticated user's ID
    const data = req.body;

    const validationResult = createPostSchema.safeParse(data);
    if (!validationResult.success) {
        return res.status(400).json(formatResponse(400, validationResult.error.errors));
    }

    const { content, mediaUrls } = validationResult.data;

    try {
        const post = await prisma.post.create({
            data: {
                content,
                mediaUrls: mediaUrls || [],
                authorId: userId,
            },
        });

        return res.status(201).json(formatResponse(201, "Post created successfully.", post));
    } catch (error) {
        return res.status(500).json(formatResponse(500, "Error creating post.", error.message));
    }
};

// Delete a post
const deletePost = async (req, res) => {
    const postId = parseInt(req.params.postId, 10); // Get postId from URL path
    const userId = req.userId;

    try {
        const post = await prisma.post.findUnique({
            where: { id: postId },
        });

        if (!post) {
            return res.status(404).json(formatResponse(404, "Post not found."));
        }

        if (post.authorId !== userId) {
            return res.status(403).json(formatResponse(403, "You are not authorized to delete this post."));
        }

        await prisma.post.delete({
            where: { id: postId },
        });

        return res.status(200).json(formatResponse(200, "Post deleted successfully."));
    } catch (error) {
        return res.status(500).json(formatResponse(500, "Error deleting post.", error.message));
    }
};

// Add a comment to a post
const addComment = async (req, res) => {
    const userId = req.userId;
    const postId = parseInt(req.params.postId, 10); // Get postId from URL path
    const data = req.body;

    const validationResult = createCommentSchema.safeParse(data);
    if (!validationResult.success) {
        return res.status(400).json(formatResponse(400, validationResult.error.errors));
    }

    const { content } = validationResult.data;

    try {
        const post = await prisma.post.findUnique({ where: { id: postId } });

        if (!post) {
            return res.status(404).json(formatResponse(404, "Post not found."));
        }

        const comment = await prisma.comment.create({
            data: {
                content,
                postId,
                authorId: userId,
            },
        });

        return res.status(201).json(formatResponse(201, "Comment added successfully.", comment));
    } catch (error) {
        return res.status(500).json(formatResponse(500, "Error adding comment.", error.message));
    }
};

// Delete a comment
const deleteComment = async (req, res) => {
    const userId = req.userId;
    const postId = parseInt(req.params.postId, 10); // Get postId from URL path
    const commentId = parseInt(req.params.commentId, 10); // Get commentId from URL path

    try {
        const existingComment = await prisma.comment.findFirst({
            where: { id: commentId, postId }, // Ensure the comment belongs to the correct post
        });

        if (!existingComment) {
            return res.status(404).json(formatResponse(404, "Comment not found."));
        }

        if (existingComment.authorId !== userId) {
            return res.status(403).json(formatResponse(403, "You are not authorized to delete this comment."));
        }

        await prisma.comment.delete({ where: { id: commentId } });

        return res.status(200).json(formatResponse(200, "Comment deleted successfully."));
    } catch (error) {
        return res.status(500).json(formatResponse(500, "Error deleting comment.", error.message));
    }
};

// Like a post
const likePost = async (req, res) => {
    const userId = req.userId;
    const postId = parseInt(req.params.postId, 10); // Get postId from URL path

    try {
        const post = await prisma.post.findUnique({ where: { id: postId } });

        if (!post) {
            return res.status(404).json(formatResponse(404, "Post not found."));
        }

        const existingLike = await prisma.like.findFirst({
            where: { postId, userId },
        });

        if (existingLike) {
            return res.status(400).json(formatResponse(400, "You have already liked this post."));
        }

        const like = await prisma.like.create({
            data: {
                postId,
                userId,
            },
        });

        return res.status(201).json(formatResponse(201, "Post liked successfully.", like));
    } catch (error) {
        return res.status(500).json(formatResponse(500, "Error liking post.", error.message));
    }
};

// Unlike a post
const unlikePost = async (req, res) => {
    const userId = req.userId;
    const postId = parseInt(req.params.postId, 10); // Get postId from URL path

    try {
        const post = await prisma.post.findUnique({ where: { id: postId } });

        if (!post) {
            return res.status(404).json(formatResponse(404, "Post not found."));
        }

        const existingLike = await prisma.like.findFirst({
            where: { postId, userId },
        });

        if (!existingLike) {
            return res.status(400).json(formatResponse(400, "You haven't liked this post yet."));
        }

        await prisma.like.delete({
            where: { id: existingLike.id },
        });

        return res.status(200).json(formatResponse(200, "Post unliked successfully."));
    } catch (error) {
        return res.status(500).json(formatResponse(500, "Error unliking post.", error.message));
    }
};

module.exports = {
    createPost,
    deletePost,
    addComment,
    deleteComment,
    likePost,
    unlikePost,
};
