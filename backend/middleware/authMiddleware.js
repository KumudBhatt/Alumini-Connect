const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');
const { formatResponse } = require('../utils'); // Added import

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token || !token.startsWith('Bearer ')) {
        return res.status(401).json(formatResponse(401, 'Access Denied'));
    }
    const tokenValue = token.split('Bearer ')[1];
    try {
        const decoded = jwt.verify(tokenValue, jwtSecret);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json(formatResponse(401, 'Invalid Token'));
    }
};

module.exports = authMiddleware;