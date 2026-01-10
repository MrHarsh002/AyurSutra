const express = require('express');
const router = express.Router();

const {
  getAppointments,
  createAppointment,
  updateAppointmentStatus,
  getAppointmentStats,
  getTodayAppointments
} = require('../controllers/appointmentController');

const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getAppointments)
  .post(protect, createAppointment);

router.put('/:id/status', protect, updateAppointmentStatus);

router.get('/stats/dashboard', protect, getAppointmentStats);
router.get("/today", protect, getTodayAppointments);

module.exports = router;
