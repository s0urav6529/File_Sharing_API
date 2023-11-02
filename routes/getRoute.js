// external module
const express = require("express");
const getRoute = express.Router();

//internal module
const { downloadLimiter } = require("../middleware/networkLimit");
const getResponse = require("../controllers/getController");

//route to use
getRoute.route("/:publicKey").get(downloadLimiter, getResponse);

//export
module.exports = getRoute;
