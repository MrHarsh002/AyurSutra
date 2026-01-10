const cloudinary = require("../config/cloudinary");
const fs = require("fs");
const path = require("path");
const User = require("../models/userModels");

exports.uploadUserImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image required" });
    }

    // 🔹 Local file path (multer already saved it)
    const localPath = `/uploads/profile/${req.file.filename}`;

    // 🔹 Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "uploads/profile",
    });

    // 🔥 SAVE CLOUDINARY URL IN DATABASE
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        photo: result.secure_url,   // for frontend display
        photoLocal: localPath,      // optional: local backup
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      cloudinaryUrl: result.secure_url,
      localPath,
      public_id: result.public_id,
      user,
    });

  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Upload failed" });
  }
};
