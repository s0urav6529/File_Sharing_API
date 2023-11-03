const multer = require("multer");
const path = require("path");

const uploadFolder = `${__dirname}/../FOLDER/`;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder);
  },
  filename: (req, file, cb) => {
    const fileExtention = path.extname(file.originalname);

    const originalFileName = file.originalname;
    let fileName;
    if (originalFileName.startsWith("tmp")) {
      // for testing purpose of code
      fileName =
        originalFileName.replace(fileExtention, "").split(" ").join("-") +
        fileExtention;
    } else {
      // for actual code
      fileName =
        originalFileName.replace(fileExtention, "").split(" ").join("-") +
        "-" +
        Date.now() +
        fileExtention;
    }

    cb(null, fileName);
  },
});

module.exports = storage;
