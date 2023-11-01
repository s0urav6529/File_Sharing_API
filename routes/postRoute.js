//external module
const express = require("express");
const randomstring = require("randomstring");
const postRoute = express.Router();
const multer = require("multer");

//internal module
const storage = require("../utilities/fileuploader");
const { uploadLimiter } = require("../middleware/networkLimit");
const upload = multer({ storage });

// make uploaderLimit as a middleware
postRoute
  .route("/")
  .post(uploadLimiter, upload.single("file"), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    res.json({
      "public key": req.file.filename,
      "private key": req.file.filename,
    });
  });

module.exports = postRoute;
