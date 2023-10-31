//external module
const express = require("express");
const randomstring = require("randomstring");
const postRoute = express.Router();
const multer = require("multer");

//internal module
const storage = require("../utilities/fileuploader");
const upload = multer({ storage });

postRoute.route("/").post(upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  res.json({
    "public key": req.file.filename,
    "private key": req.file.filename,
  });
});

module.exports = postRoute;
