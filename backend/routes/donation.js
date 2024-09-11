const express = require('express');
const { createDonation, getDonations, getDonationLeaderboard } = require('../controllers/donationController');
const authMiddleware = require('../middlewares/authMiddleware');

const donationRouter = express.Router();

// Route to create a new donation (requires authentication)
donationRouter.post('/create', authMiddleware, createDonation);

// Route to get all donations
donationRouter.get('/', getDonations);

// Route to get the donation leaderboard
donationRouter.get('/leaderboard', getDonationLeaderboard);

module.exports = donationRouter;
