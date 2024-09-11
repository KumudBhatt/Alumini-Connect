const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const { PrismaClient } = require('@prisma/client');
const { formatResponse } = require('../utils');
const { JWT_SECRET } = require('../config');

const prisma = new PrismaClient();

// Validation schema for signup
const signupSchema = z.object({
    username: z.string().min(3).max(255),
    firstname: z.string().min(1).max(255),
    lastname: z.string().min(1).max(255),
    email: z.string().email(),
    password: z.string().min(8).max(255),
});

// Validation schema for signin
const signinSchema = z.object({
    username: z.string().min(3).max(255),
    password: z.string().min(8).max(255),
});

// Validation schema for updating user profile
const updateUserSchema = z.object({
    firstname: z.string().min(1).max(255).optional(),
    lastname: z.string().min(1).max(255).optional(),
    email: z.string().email().optional(),
    password: z.string().min(8).max(255).optional(),
    bio: z.string().max(500).optional(),
    company: z.string().optional(),
    companyLocation: z.string().optional(),
    fieldOfStudy: z.string().optional(),
    graduationYearStart: z.number().optional(),
    graduationYearEnd: z.number().optional(),
    location: z.string().optional(),
});


// Signup controller function
const signup = async (req, res) => {
    const data = req.body;
    const validationResult = signupSchema.safeParse(data);
    if (!validationResult.success) {
        return res.status(400).json(formatResponse(400, validationResult.error.errors));
    }

    const { username, firstname, lastname, email, password } = validationResult.data;

    try {
        const existingUser = await prisma.user.findFirst({
            where: { username },
        });

        if (existingUser) {
            return res.status(400).json(formatResponse(400, "Username already exists."));
        }

        const existingEmail = await prisma.user.findFirst({
            where: { email },
        });

        if (existingEmail) {
            return res.status(400).json(formatResponse(400, "Email already exists."));
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                username,
                firstname,
                lastname,
                email,
                password: hashedPassword,
            },
        });

        // Generate JWT token
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

        return res.status(201).json(formatResponse(201, "User created successfully.", { token }));
    } catch (error) {
        return res.status(500).json(formatResponse(500, "Error creating user.", error.message));
    }
};

// Signin controller function
const signin = async (req, res) => {
    const data = req.body;
    const validationResult = signinSchema.safeParse(data);

    if (!validationResult.success) {
        return res.status(400).json(formatResponse(400, validationResult.error.errors));
    }

    const { username, password } = validationResult.data;

    try {
        const user = await prisma.user.findFirst({
            where: { username },
        });

        if (!user) {
            return res.status(404).json(formatResponse(404, "Username or password incorrect."));
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(404).json(formatResponse(404, "Username or password incorrect."));
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1d' });

        return res.status(200).json(formatResponse(200, "Signin successful.", { token }));
    } catch (error) {
        return res.status(500).json(formatResponse(500, "Error during signin.", error.message));
    }
};


// Update user controller function
const updateUser = async (req, res) => {
    const userId = req.userId; 
    const data = req.body;

    const validationResult = updateUserSchema.safeParse(data);

    if (!validationResult.success) {
        return res.status(400).json(formatResponse(400, validationResult.error.errors));
    }

    const { firstname, lastname, password, avatarUrl, bio, company, companyLocation, fieldOfStudy, graduationStartYear, graduationEndYear, location } = validationResult.data;

    try {
        const existingUser = await prisma.user.findUnique({ where: { id: userId } });

        if (!existingUser) {
            return res.status(404).json(formatResponse(404, "User not found."));
        }

        // Do not allow email or username update
        if (data.email || data.username) {
            return res.status(400).json(formatResponse(400, "Username and email cannot be changed."));
        }

        // Hash new password if updated
        let hashedPassword;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                firstname,
                lastname,
                password: hashedPassword,
                avatarUrl,
                bio,
                company,
                companyLocation,
                fieldOfStudy,
                graduationStartYear,
                graduationEndYear,
                location,
            },
        });

        return res.status(200).json(formatResponse(200, "User updated successfully.", updatedUser));
    } catch (error) {
        return res.status(500).json(formatResponse(500, "Error updating user.", error.message));
    }
};


// Delete user controller function
const deleteUser = async (req, res) => {
    const userId = req.userId; 

    try {
        const existingUser = await prisma.user.findUnique({ where: { id: userId } });

        if (!existingUser) {
            return res.status(404).json(formatResponse(404, "User not found."));
        }

        await prisma.user.delete({
            where: { id: userId },
        });

        return res.status(200).json(formatResponse(200, "User deleted successfully."));
    } catch (error) {
        return res.status(500).json(formatResponse(500, "Error deleting user.", error.message));
    }
};

module.exports = {
    signup,
    signin,
    updateUser,
    deleteUser,
};
