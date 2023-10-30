const express = require("express");
const deleteRoute = express.Router();
const fs = require("fs");

deleteRoute.route("/:privateKey").delete(async (req, res) => {
  const privateKey = `FOLDER/${req.params.privateKey}`;
  console.log(privateKey);
  fs.unlink(privateKey, (err) => {
    if (err) {
      res.status(500).json({ error: "File removal failed." });
    } else {
      res.json({ message: "File removed successfully." });
    }
  });
});

module.exports = deleteRoute;
