const express = require('express');
const { sendConnectionRequest, acceptConnectionRequest, rejectConnectionRequest, viewConnections } = require('../controllers/connectionController');
const authMiddleware = require('../middlewares/authMiddleware');

const connectionRouter = express.Router();

// Send a connection request
connectionRouter.post('/connections', authMiddleware, sendConnectionRequest);

// Accept a connection request
connectionRouter.patch('/connections/accept', authMiddleware, acceptConnectionRequest);

// Reject a connection request
connectionRouter.patch('/connections/reject', authMiddleware, rejectConnectionRequest);

// View followers and followings
connectionRouter.get('/connections', authMiddleware, viewConnections);

module.exports = connectionRouter;
