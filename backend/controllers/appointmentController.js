// controllers/appointmentController.js
const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const User = require('../models/userModels');
const Doctor = require('../models/Doctor');
const asyncHandler = require('express-async-handler');
const { generateAppointmentId } = require('../utils/generatePatientId');

// Helper function to validate ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// @desc    Get all appointments for today
// @route   GET /api/appointments/today
// @access  Private
const getTodayAppointments = asyncHandler(async (req, res) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const appointments = await Appointment.find({
    date: { $gte: todayStart, $lte: todayEnd },
  })
    .populate("patient", "name age gender") // only selected patient fields
    .populate("doctor", "name specialty") // only selected doctor fields
    .sort({ date: 1, time: 1 }); // sort by time

  res.json({ success: true, data: appointments });
});


// ============================
// GET ALL APPOINTMENTS
// ============================
const getAppointments = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    date,
    status,
    doctorId,
    patientId,
    startDate,
    endDate,
  } = req.query;

  const query = {};

  // Date filtering
  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    query.date = {
      $gte: startOfDay,
      $lte: endOfDay
    };
  } else if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  // Status filtering
  if (status && status !== 'all') {
    query.status = status;
  }

  // Doctor filtering
  if (doctorId && isValidObjectId(doctorId)) {
    query.doctor = doctorId;
  }

  // Patient filtering
  if (patientId && isValidObjectId(patientId)) {
    query.patient = patientId;
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Get appointments with pagination
  const appointments = await Appointment.find(query)
    .populate('patient', 'firstName lastName fullName patientId phone email')
    .populate('doctor', 'name email phone')
    .populate('createdBy', 'name')
    .sort({ date: -1, time: 1 })
    .limit(limitNum)
    .skip(skip);

  const total = await Appointment.countDocuments(query);

  res.json({
    success: true,
    total,
    totalPages: Math.ceil(total / limitNum),
    currentPage: pageNum,
    appointments,
  });
});

// ============================
// CREATE APPOINTMENT
// ============================
const createAppointment = asyncHandler(async (req, res) => {
  const {
    patient,
    doctor,
    date,
    time,
    duration = 30,
    type = "consultation",
    purpose,
    therapy,
    therapyRoom,
    priority = "medium",
    notes,
  } = req.body;

  // 1️⃣ Required fields check
  if (!patient || !doctor || !date || !time) {
    return res.status(400).json({
      success: false,
      message: "Required fields: patient, doctor, date, time",
    });
  }

  // 2️⃣ ObjectId validation
  if (!isValidObjectId(patient) || !isValidObjectId(doctor)) {
    return res.status(400).json({
      success: false,
      message: "Invalid patient or doctor ID format",
    });
  }

  // 3️⃣ Patient exists
  const patientExists = await Patient.findById(patient);
  if (!patientExists) {
    return res.status(404).json({
      success: false,
      message: "Patient not found",
    });
  }

  // 4️⃣ Doctor exists (🔥 FIX HERE)
  const doctorProfile = await Doctor.findById(doctor).populate("user");

  if (!doctorProfile) {
    return res.status(404).json({
      success: false,
      message: "Doctor not found",
    });
  }

  // 5️⃣ Doctor availability
  if (doctorProfile.isAvailable === false) {
    return res.status(400).json({
      success: false,
      message: "Doctor is not available for appointments",
    });
  }

  // 6️⃣ Time conflict check
  const appointmentDate = new Date(date);
  const start = new Date(appointmentDate.setHours(0, 0, 0, 0));
  const end = new Date(appointmentDate.setHours(23, 59, 59, 999));

  const conflict = await Appointment.findOne({
    doctor,
    date: { $gte: start, $lte: end },
    time,
    status: { $in: ["scheduled", "confirmed", "checked-in"] },
  });

  if (conflict) {
    return res.status(400).json({
      success: false,
      message: "Doctor already has an appointment at this time",
    });
  }

  // 7️⃣ Daily limit
  const dailyCount = await Appointment.countDocuments({
    doctor,
    date: { $gte: start, $lte: end },
    status: { $in: ["scheduled", "confirmed"] },
  });

  const maxPatients = doctorProfile.maxPatientsPerDay || 20;
  if (dailyCount >= maxPatients) {
    return res.status(400).json({
      success: false,
      message: `Doctor has reached daily limit of ${maxPatients}`,
    });
  }

  // 8️⃣ Create appointment
  const appointment = await Appointment.create({
    appointmentId: await generateAppointmentId(),
    patient,
    doctor,
    date: new Date(date),
    time,
    duration: parseInt(duration),
    type,
    purpose,
    therapy,
    therapyRoom,
    priority,
    notes,
    status: "scheduled",
    createdBy: req.user._id,
  });

  const populatedAppointment = await Appointment.findById(appointment._id)
    .populate("patient", "fullName patientId phone")
    .populate({
      path: "doctor",
      populate: { path: "user", select: "name email phone" },
    });

  res.status(201).json({
    success: true,
    message: "Appointment created successfully",
    data: populatedAppointment,
  });
});


// ============================
// UPDATE APPOINTMENT STATUS
// ============================
const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { status, cancellationReason } = req.body;
  const { id } = req.params;

  // Validate ObjectId
  if (!isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid appointment ID'
    });
  }

  // Validate status
  const validStatus = ['scheduled', 'confirmed', 'checked-in', 'in-progress', 'completed', 'cancelled', 'no-show'];
  if (!validStatus.includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status value. Must be one of: ' + validStatus.join(', ')
    });
  }

  const appointment = await Appointment.findById(id);
  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found'
    });
  }

  // Update appointment
  appointment.status = status;
  
  if (status === 'cancelled') {
    appointment.cancellationReason = cancellationReason || '';
  } else {
    appointment.cancellationReason = '';
  }

  await appointment.save();

  // Get updated appointment with populated data
  const updatedAppointment = await Appointment.findById(id)
    .populate('patient', 'firstName lastName fullName patientId phone email')
    .populate('doctor', 'name email phone')
    .populate('createdBy', 'name');

  res.json({
    success: true,
    message: 'Appointment status updated successfully',
    data: updatedAppointment
  });
});

// ============================
// DASHBOARD STATS
// ============================
const getAppointmentStats = asyncHandler(async (req, res) => {
  const today = new Date();
  
  // Today's start and end
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);
  
  // 7 days ago
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  // 30 days ago
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  try {
    // Today's stats by status
    const todayStats = await Appointment.aggregate([
      {
        $match: {
          date: {
            $gte: startOfDay,
            $lte: endOfDay
          }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Weekly stats (last 7 days)
    const weeklyStats = await Appointment.aggregate([
      {
        $match: {
          date: {
            $gte: sevenDaysAgo,
            $lte: endOfDay
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$date'
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Doctor stats (last 30 days)
    const doctorStats = await Appointment.aggregate([
      {
        $match: {
          date: {
            $gte: thirtyDaysAgo,
            $lte: endOfDay
          }
        }
      },
      {
        $group: {
          _id: '$doctor',
          total: { $sum: 1 },
          completed: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
            }
          },
          cancelled: {
            $sum: {
              $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { total: -1 }
      },
      {
        $limit: 5
      }
    ]);

    // Get doctor names
    const doctorIds = doctorStats.map(stat => stat._id);
    const doctors = await User.find(
      { _id: { $in: doctorIds } },
      'name email'
    );

    // Format doctor stats
    const formattedDoctorStats = doctorStats.map(stat => {
      const doctor = doctors.find(doc => doc._id.equals(stat._id));
      return {
        doctorId: stat._id,
        doctorName: doctor?.name || 'Unknown Doctor',
        doctorEmail: doctor?.email || '',
        totalAppointments: stat.total || 0,
        completedAppointments: stat.completed || 0,
        cancelledAppointments: stat.cancelled || 0,
        completionRate: stat.total > 0 
          ? Math.round((stat.completed / stat.total) * 100) 
          : 0
      };
    });

    // Total counts
    const totalAppointments = await Appointment.countDocuments();
    const todayTotal = await Appointment.countDocuments({
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });
    const pendingAppointments = await Appointment.countDocuments({
      status: { $in: ['scheduled', 'confirmed'] }
    });

    res.json({
      success: true,
      stats: {
        summary: {
          total: totalAppointments,
          today: todayTotal,
          pending: pendingAppointments
        },
        today: todayStats,
        weekly: weeklyStats,
        topDoctors: formattedDoctorStats
      }
    });

  } catch (error) {
    console.error('Error fetching appointment stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching appointment statistics'
    });
  }
});

module.exports = {
  getAppointments,
  createAppointment,
  updateAppointmentStatus,
  getAppointmentStats,
  getTodayAppointments
};