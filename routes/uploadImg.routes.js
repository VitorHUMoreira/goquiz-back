const express = require("express");
const router = express.Router();

const storage = require("../configs/cloudinary.config");

router.post("/upload-image", storage.single("picture"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Upload failed" });
  }
  return res.status(200).json({ url: req.file.path });
});

module.exports = router;
