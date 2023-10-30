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
  const publicKey = req.file.filename;
  const privateKey = req.file.path;
  res.json({ "public key": publicKey, "private key": privateKey });
});

module.exports = postRoute;
