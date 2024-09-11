const express = require('express');
const userRouter = express.Router();
const { signup, signin, updateUser, deleteUser } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Routes
userRouter.post("/signup", signup); // Route for signup
userRouter.post("/signin", signin); // Route for signin
userRouter.put("/update", authMiddleware, updateUser); // Route for updating user profile
userRouter.delete("/delete", authMiddleware, deleteUser); // Route for deleting user

module.exports = userRouter;