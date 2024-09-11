const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
const { formatResponse } = require('../utils');

const prisma = new PrismaClient();

// Zod schema for donation validation
const donationSchema = z.object({
    amount: z.number().positive(),
    currency: z.string().min(1),
    donorId: z.number(),
});

// Get all donations
const getDonations = async (req, res) => {
    try {
        const donations = await prisma.donation.findMany({
            include: { donor: true },
        });
        return res.status(200).json(formatResponse(200, "Donations retrieved successfully.", donations));
    } catch (error) {
        return res.status(500).json(formatResponse(500, "Error retrieving donations.", error.message));
    }
};

// Create a new donation
const createDonation = async (req, res) => {
    const validationResult = donationSchema.safeParse(req.body);

    if (!validationResult.success) {
        return res.status(400).json(formatResponse(400, "Validation failed", validationResult.error.errors));
    }

    const { amount, currency, donorId } = validationResult.data;

    try {
        const newDonation = await prisma.donation.create({
            data: { amount, currency, donorId },
        });
        return res.status(201).json(formatResponse(201, "Donation created successfully.", newDonation));
    } catch (error) {
        return res.status(500).json(formatResponse(500, "Error creating donation.", error.message));
    }
};

// Get donation leaderboard
const getDonationLeaderboard = async (req, res) => {
    try {
        const leaderboard = await prisma.donation.groupBy({
            by: ['donorId'],
            _sum: { amount: true },
            orderBy: { _sum: { amount: 'desc' } },
            take: 10,
        });

        const leaderboardWithDonorDetails = await Promise.all(
            leaderboard.map(async (entry) => {
                const donor = await prisma.user.findUnique({
                    where: { id: entry.donorId },
                    select: { id: true, firstname: true, lastname: true, avatarUrl: true },
                });
                return { donor, totalAmount: entry._sum.amount };
            })
        );

        return res.status(200).json(formatResponse(200, "Leaderboard retrieved successfully.", leaderboardWithDonorDetails));
    } catch (error) {
        return res.status(500).json(formatResponse(500, "Error retrieving leaderboard.", error.message));
    }
};

module.exports = {
    getDonations,
    createDonation,
    getDonationLeaderboard,
};