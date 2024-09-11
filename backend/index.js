const express = require('express');
const {PORT} = require('./config');
const mainRouter = require('./routes/main');
const app = express();

app.use(express.json());
app.use("/api/v1",mainRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})