const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
const { formatResponse } = require('../utils');

const prisma = new PrismaClient();

// Zod schema for connection request validation
const connectionRequestSchema = z.object({
    followingId: z.number(),
});

// Send a connection request
const sendConnectionRequest = async (req, res) => {
    const followerId = req.userId;
    const validationResult = connectionRequestSchema.safeParse(req.body);

    if (!validationResult.success) {
        return res.status(400).json(formatResponse(400, "Validation failed", validationResult.error.errors));
    }

    const { followingId } = validationResult.data;

    if (followerId === followingId) {
        return res.status(400).json(formatResponse(400, "You cannot follow yourself."));
    }

    try {
        const existingConnection = await prisma.connection.findFirst({
            where: { followerId, followingId },
        });

        if (existingConnection) {
            return res.status(400).json(formatResponse(400, "Connection request already exists."));
        }

        const connection = await prisma.connection.create({
            data: { followerId, followingId, status: 'PENDING' },
        });

        return res.status(201).json(formatResponse(201, "Connection request sent.", connection));
    } catch (error) {
        return res.status(500).json(formatResponse(500, "Error sending connection request.", error.message));
    }
};

// Accept a connection request
const acceptConnectionRequest = async (req, res) => {
    const userId = req.userId;
    const { connectionId } = req.body;

    try {
        const connection = await prisma.connection.findUnique({ where: { id: connectionId } });

        if (!connection || connection.followingId !== userId || connection.status !== 'PENDING') {
            return res.status(400).json(formatResponse(400, "Invalid connection request."));
        }

        const updatedConnection = await prisma.connection.update({
            where: { id: connectionId },
            data: { status: 'ACCEPTED' },
        });

        return res.status(200).json(formatResponse(200, "Connection request accepted.", updatedConnection));
    } catch (error) {
        return res.status(500).json(formatResponse(500, "Error accepting connection request.", error.message));
    }
};

// Reject a connection request
const rejectConnectionRequest = async (req, res) => {
    const userId = req.userId;
    const { connectionId } = req.body;

    try {
        const connection = await prisma.connection.findUnique({ where: { id: connectionId } });

        if (!connection || connection.followingId !== userId || connection.status !== 'PENDING') {
            return res.status(400).json(formatResponse(400, "Invalid connection request."));
        }

        const updatedConnection = await prisma.connection.update({
            where: { id: connectionId },
            data: { status: 'REJECTED' },
        });

        return res.status(200).json(formatResponse(200, "Connection request rejected.", updatedConnection));
    } catch (error) {
        return res.status(500).json(formatResponse(500, "Error rejecting connection request.", error.message));
    }
};

// View connections (followers and followings)
const viewConnections = async (req, res) => {
    const userId = req.userId;

    try {
        const followers = await prisma.connection.findMany({
            where: { followingId: userId, status: 'ACCEPTED' },
            include: { follower: true },
        });

        const followings = await prisma.connection.findMany({
            where: { followerId: userId, status: 'ACCEPTED' },
            include: { following: true },
        });

        return res.status(200).json(formatResponse(200, "Connections retrieved successfully.", { followers, followings }));
    } catch (error) {
        return res.status(500).json(formatResponse(500, "Error retrieving connections.", error.message));
    }
};

module.exports = {
    sendConnectionRequest,
    acceptConnectionRequest,
    rejectConnectionRequest,
    viewConnections,
};