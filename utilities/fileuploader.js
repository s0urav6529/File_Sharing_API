const multer = require("multer");
const path = require("path");

const uploadFolder = `${__dirname}/../FOLDER/`;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder);
  },
  filename: (req, file, cb) => {
    const fileName = Date.now() + "-" + file.originalname;
    cb(null, fileName);
  },
});

module.exports = storage;
