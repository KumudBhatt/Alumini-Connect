const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
const { formatResponse } = require('../utils');

const prisma = new PrismaClient();

// Zod schema for search query validation
const searchSchema = z.object({
    searchQuery: z.string().min(1, "Search query is required"),
});

// Zod schema for filter query validation
const filterSchema = z.object({
    graduationStartYearRangeStart: z.string().optional(),
    graduationStartYearRangeEnd: z.string().optional(),
    location: z.string().optional(),
    industry: z.string().optional(),
    fieldOfStudy: z.string().optional(),
    company: z.string().optional(),
});

// Search people by name
const searchPeople = async (req, res) => {
    const validationResult = searchSchema.safeParse(req.query);

    if (!validationResult.success) {
        return res.status(400).json(formatResponse(400, validationResult.error.errors));
    }

    const { searchQuery } = validationResult.data;

    try {
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { firstname: { contains: searchQuery, mode: 'insensitive' } },
                    { lastname: { contains: searchQuery, mode: 'insensitive' } },
                    { username: { contains: searchQuery, mode: 'insensitive' } }
                ]
            },
            select: {
                id: true,
                firstname: true,
                lastname: true,
                avatarUrl: true,
                bio: true,
                company: true // Include only necessary fields
            }
        });

        return res.status(200).json(formatResponse(200, "Users found.", users));
    } catch (error) {
        return res.status(500).json(formatResponse(500, "Error searching for users.", error.message));
    }
};

// Filter people by graduation year, location, industry, field of study, and company
const filterPeople = async (req, res) => {
    const validationResult = filterSchema.safeParse(req.query);

    if (!validationResult.success) {
        return res.status(400).json(formatResponse(400, validationResult.error.errors));
    }

    const { graduationStartYearRangeStart, graduationStartYearRangeEnd, location, industry, fieldOfStudy, company } = validationResult.data;

    try {
        const users = await prisma.user.findMany({
            where: {
                AND: [
                    graduationStartYearRangeStart && graduationStartYearRangeEnd
                        ? { graduationStartYear: { gte: Number(graduationStartYearRangeStart), lte: Number(graduationStartYearRangeEnd) } }
                        : {},
                    location ? { location: { contains: location, mode: 'insensitive' } } : {},
                    industry ? { industry: { contains: industry, mode: 'insensitive' } } : {},
                    fieldOfStudy ? { fieldOfStudy: { contains: fieldOfStudy, mode: 'insensitive' } } : {},
                    company ? { company: { contains: company, mode: 'insensitive' } } : {}
                ]
            },
            select: {
                id: true,
                firstname: true,
                lastname: true,
                avatarUrl: true,
                bio: true,
                company: true // Only return profile, bio, and company
            }
        });

        return res.status(200).json(formatResponse(200, "Users filtered successfully.", users));
    } catch (error) {
        return res.status(500).json(formatResponse(500, "Error filtering users.", error.message));
    }
};

module.exports = {
    searchPeople,
    filterPeople
};