//external module
const bodyParser = require("body-parser");
const express = require("express");
const dotenv = require("dotenv").config();
const http = require("http");

// internal modules
const postRoute = require("./routes/postRoute");
const getRoute = require("./routes/getRoute");
const deleteRoute = require("./routes/deleteRoute");

// use express
const app = express();

// create server of http
const server = http.createServer(app);

// use route
app.use("/files", postRoute);
app.use("/files", getRoute);
app.use("/files", deleteRoute);

// json body parser
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// running the http server
server.listen(process.env.PORT, () => {
  console.log(`Listening to the post ${process.env.PORT}`);
});
