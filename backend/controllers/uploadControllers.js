const cloudinary = require("../config/cloudinary");
const User = require("../models/userModels");

exports.uploadUserImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image required" });
    }

    // Upload the in-memory buffer directly to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "uploads/profile",
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve(result);
        }
      );

      uploadStream.end(req.file.buffer);
    });

    // Save Cloudinary URL in database
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        photo: result.secure_url,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      cloudinaryUrl: result.secure_url,
      public_id: result.public_id,
      user,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Upload failed" });
  }
};
