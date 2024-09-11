const express = require('express');
const userRouter = require('./user');
const postRouter = require('./post');
const jobRouter = require('./job');
const storyRouter = require('./story');
const donationRouter = require('./donation');
const eventRouter = require('./event');
const feedbackRouter = require('./feedback');
const connectionRouter = require('./connection');
const networkRouter = require('./network');

const mainRouter = express.Router();

mainRouter.use("/user", userRouter);
mainRouter.use("/post", postRouter);
mainRouter.use("/job", jobRouter);
mainRouter.use("/story", storyRouter);
mainRouter.use("/donation", donationRouter);
mainRouter.use("/event", eventRouter);
mainRouter.use("/feedback", feedbackRouter);
mainRouter.use("/connection", connectionRouter); // Corrected path
mainRouter.use("/network", networkRouter);

module.exports = mainRouter;