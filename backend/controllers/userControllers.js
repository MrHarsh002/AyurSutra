const User = require("../models/userModels");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


/* 🧑‍💼 GET ALL USERS */
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


/* 👤 GET SINGLE USER */
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch {
    res.status(500).json({ message: "Invalid user ID" });
  }
};


/* ✏️ UPDATE USER */
exports.updateUser = async (req, res) => {
  try {
    const { name, email, number, bio, photo, role } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, number, bio, photo, role },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "Updated successfully", user });

  } catch (error) {
    res.status(500).json({ message: "Update failed", error });
  }
};


/* 🗑 DELETE USER */
exports.deleteUser = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User deleted" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};
