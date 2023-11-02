const uploadResponse = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  res.json({
    "public key": req.file.filename,
    "private key": req.file.filename,
  });
};

module.exports = uploadResponse;
