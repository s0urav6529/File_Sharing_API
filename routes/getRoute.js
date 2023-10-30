const express = require("express");
const getRoute = express.Router();

getRoute.route("/gt").get(async (req, res) => {
  res.send("Hello get");
});

module.exports = getRoute;
