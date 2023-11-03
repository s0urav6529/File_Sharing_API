//external module
const fs = require("fs");
const path = require("path");
const filesModel = require("../models/filesModel");

//controllers
const deleteResponse = async (req, res) => {
  // make the file path
  const filePath = path.join("FOLDER", req.params.privateKey);

  try {
    //Restrict cloud database during testing
    if (
      !req.params.privateKey.startsWith("nonexistentfile.txt") &&
      !req.params.privateKey.startsWith("testfile")
    ) {
      await filesModel.deleteOne({ name: req.params.privateKey });
    }

    fs.access(filePath, fs.constants.F_OK, (error) => {
      if (error) {
        res
          .status(404)
          .json({ error: `The file ${req.params.privateKey} does not exist` });
      } else {
        fs.unlink(filePath, (error) => {
          if (error) {
            res.status(404).json({
              error: `The file ${req.params.privateKey} does not exist`,
            });
          } else {
            res.status(200).json({ error: "File deleted successfully" });
          }
        });
      }
    });
  } catch (error) {
    res
      .status(404)
      .json({ error: `The file ${req.params.privateKey} does not exist` });
  }
};

//export
module.exports = deleteResponse;
