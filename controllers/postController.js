const filesModel = require("../models/filesModel");

const uploadResponse = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const fileName = req.file.filename;

  //for testing code neednot use mongoatlas
  if (!fileName.startsWith("testfile")) {
    await filesModel.create({
      name: req.file.filename,
    });
  }
  res.json({
    "public key": fileName,
    "private key": fileName,
  });
};

module.exports = uploadResponse;
