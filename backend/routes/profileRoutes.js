const express = require("express");
const router = express.Router();

const profileController = require("../controllers/profileControllers");
const { protect } = require("../middleware/authMiddleware"); // ✅ FIX

const { uploadUserImage } = require("../controllers/uploadControllers");
const upload = require("../middleware/upload");

// Upload Image
router.post(
  "/upload-image",
  protect,
  upload.single("photo"),
  uploadUserImage
);

router.post("/me", protect, profileController.createMyProfile);
router.get("/me", protect, profileController.getMyProfile);
router.put("/me", protect, profileController.updateMyProfile);
router.delete("/me", protect, profileController.deleteMyProfile);

module.exports = router;
