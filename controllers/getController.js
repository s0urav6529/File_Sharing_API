//external modules
const path = require("path");
const fs = require("fs");
const mime = require("mime");

//controllers
const getResponse = async (req, res) => {
  // Make the file path
  const filePath = path.join("FOLDER", req.params.publicKey);

  try {
    await fs.access(filePath, fs.constants.F_OK, (error) => {
      if (error) {
        res
          .status(404)
          .json({ error: `The file ${req.params.publicKey} does not exist` });
      } else {
        //get the mime type for the current file
        const fileExtension = path.extname(filePath).slice(1);

        // Determine the MIME type based on the file extension
        const mimeType = mime.getType(fileExtension);

        // Set the response headers
        res.setHeader("Content-Type", mimeType);

        // Create a readable stream and pipe it to the response
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = getResponse;
