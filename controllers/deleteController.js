//external module
const fs = require("fs");
const path = require("path");

//controllers
const deleteResponse = async (req, res) => {
  // make the file path
  const filePath = path.join("FOLDER", req.params.privateKey);

  try {
    await fs.access(filePath, fs.constants.F_OK, (error) => {
      if (error) {
        res
          .status(404)
          .json({ error: `The file ${req.params.privateKey} does not exist` });
      } else {
        fs.unlink(filePath, (error) => {
          if (error) {
            res.status(500).json({ error: "Failed during file deletation" });
          } else {
            res.status(200).json({ error: "File deleted successfully" });
          }
        });
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//export
module.exports = deleteResponse;
