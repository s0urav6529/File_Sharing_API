//external module
const bodyParser = require("body-parser");
const express = require("express");
const dotenv = require("dotenv").config();
const http = require("http");
const cron = require("node-cron");

// internal modules
const postRoute = require("./routes/postRoute");
const getRoute = require("./routes/getRoute");
const deleteRoute = require("./routes/deleteRoute");
const fileCleanupCheck = require("./utilities/fileCleanupCheck");

// use express
const app = express();

// create server of http
const server = http.createServer(app);

// json body parser
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// use route
app.use("/files", postRoute);
app.use("/files", getRoute);
app.use("/files", deleteRoute);

//cron scheduler
cron.schedule("0 0 * * *", () => {
  const cleanupPeriod = 7 * 24 * 60 * 60 * 1000; // for 7 days of inactivity
  fileCleanupCheck(cleanupPeriod);
});

// running the http server
server.listen(process.env.PORT, () => {
  console.log(`Listening to the post ${process.env.PORT}`);
});

module.exports = app;
