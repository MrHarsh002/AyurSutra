const User = require("../models/userModels");
/* ======================================================
   CREATE / COMPLETE MY PROFILE (Optional fields)
====================================================== */
exports.createMyProfile = async (req, res) => {
  try {
    const { number, bio, photo } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Add extra profile info
    if (number) user.number = number;
    if (bio) user.bio = bio;
    if (photo) user.photo = photo;

    await user.save();

    res.status(201).json({
      success: true,
      message: "Profile created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        number: user.number,
        bio: user.bio,
        photo: user.photo,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ======================================================
   READ MY PROFILE
====================================================== */
exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ======================================================
   UPDATE MY PROFILE (PARTIAL UPDATE)
====================================================== */
exports.updateMyProfile = async (req, res) => {
  try {
    const { name, number, bio, photo } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Update only sent fields
    if (name) user.name = name;
    if (number) user.number = number;
    if (bio) user.bio = bio;
    if (photo) user.photo = photo;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        number: user.number,
        bio: user.bio,
        photo: user.photo,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ======================================================
   DELETE MY PROFILE (ACCOUNT DELETE)
====================================================== */
exports.deleteMyProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Account deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
