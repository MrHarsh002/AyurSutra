const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/userModels");

/* ======================================================
   CREATE DEFAULT ADMIN (Auto run once)
====================================================== */
async function createDefaultAdmin() {
  try {
    const exists = await User.findOne({ email: "admin@cse.com" });
    if (exists) return;

    await User.create({
      name: "Administrator",
      email: "admin@cse.com",
      password: "Admin@123",
      role: "admin"
    });

    console.log("✅ Default admin created");
  } catch (error) {
    console.error("Admin creation failed:", error.message);
  }
}
createDefaultAdmin();

/* ======================================================
   REGISTER USER
====================================================== */
exports.register = async (req, res) => {
  try {
    const { name, email, password, role = "patient" } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required"
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }

    const user = await User.create({ name, email, password, role });

    // ✅ JWT TOKEN
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
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
   LOGIN USER
====================================================== */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // ✅ JWT TOKEN (MOST IMPORTANT FIX)
    const token = jwt.sign(
      { id: user._id },          // 🔥 MUST BE id
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
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
   LOGOUT
====================================================== */
exports.logout = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
};


/* ======================================================
   RESET PASSWORD
====================================================== */
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, message: "Password is required" });
    }

    if (!token) {
      return res.status(400).json({ success: false, message: "Reset token is required" });
    }

    // Hash token
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user with token & still valid
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset link"
      });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password has been reset successfully"
    });

  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// Add to authController.js
exports.verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required"
      });
    }

    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token"
      });
    }

    res.status(200).json({
      success: true,
      message: "Token is valid"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
