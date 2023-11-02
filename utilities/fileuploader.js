const multer = require("multer");
const path = require("path");

const uploadFolder = `${__dirname}/../FOLDER/`;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder);
  },
  filename: (req, file, cb) => {
    const fileExtention = path.extname(file.originalname);

    const fileName =
      file.originalname.replace(fileExtention, "").split(" ").join("-") +
      fileExtention;
    cb(null, fileName);
  },
});

module.exports = storage;
