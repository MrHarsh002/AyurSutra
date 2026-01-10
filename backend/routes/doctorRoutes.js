
// routes/doctorRoutes.js
const express = require('express');
const router = express.Router();
const {
  getDoctors,
  getDoctorStats,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  updateAvailability,
  getDoctorByUserId
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadUserImage } = require("../controllers/uploadControllers");
const upload = require("../middleware/upload");

// Upload Image
router.post( "/upload-image",
  protect,
  upload.single("photo"),
  uploadUserImage
);
// Protected routes
router.route('/')
  .get(protect, getDoctors)
  .post(protect, authorize('admin'), createDoctor);

router.route('/stats')
  .get(protect, authorize('admin', 'doctor'), getDoctorStats);

router.route('/:id')
  .put(protect, authorize('admin'), updateDoctor)
  .delete(protect, authorize('admin'), deleteDoctor);

router.route('/:id/availability')
  .put(protect, authorize('admin', 'doctor'), updateAvailability);

router.get('/user/:userId', protect, getDoctorByUserId);
module.exports = router;
