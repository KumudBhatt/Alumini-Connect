const express = require('express');
const networkRouter = express.Router();
const { searchPeople, filterPeople } = require('../controllers/networkController');

// Route to search people by name
networkRouter.get('/search', searchPeople);

// Route to filter people by specific criteria
networkRouter.get('/filter', filterPeople);

module.exports = networkRouter;
