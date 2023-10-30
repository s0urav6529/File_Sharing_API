const express = require("express");
const getRoute = express.Router();

getRoute.route("/:publicKey").get(async (req, res) => {
  const publicKey = req.params.publicKey;
  const file = `FOLDER/${publicKey}`;
  console.log(file);
  res.download(file);
});

module.exports = getRoute;
