//external module
const express = require("express");
const randomstring = require("randomstring");
const postRoute = express.Router();
const multer = require("multer");

//internal module
const storage = require("../utilities/fileuploader");
const upload = multer({ storage });

postRoute.route("/").post(upload.single("file"), async (req, res) => {
  const publicKey = randomstring.generate();
  const privateKey = randomstring.generate();
  res.json({ "public key": publicKey, "private key": privateKey });
});

module.exports = postRoute;
