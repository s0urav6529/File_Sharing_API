const express = require("express");
const deleteRoute = express.Router();

deleteRoute.route("/del").delete(async (req, res) => {
  res.send("Hello delete");
});

module.exports = deleteRoute;
