//external module
const express = require("express");
const randomstring = require("randomstring");
const postRoute = express.Router();
const multer = require("multer");

//internal module
const storage = require("../middleware/fileuploader");
const { uploadLimiter } = require("../middleware/networkLimit");
const uploadResponse = require("../controllers/postController");
const upload = multer({ storage });

// make uploaderLimit as a middleware
postRoute.route("/").post(uploadLimiter, upload.single("file"), uploadResponse);

module.exports = postRoute;
