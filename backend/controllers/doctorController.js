// controllers/doctorController.js

const asyncHandler = require('express-async-handler');
const User = require('../models/userModels');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const bcrypt = require('bcryptjs');
const {generateDoctorId} = require('../utils/generatePatientId');

// @desc    Get all doctors with filters
// @route   GET /api/doctors
// @access  Private
const getDoctors = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, department, available } = req.query;

  const query = {};
  
  // Search filter
  if (search) {
    query.$or = [
      { 'user.name': { $regex: search, $options: 'i' } },
      { specialization: { $regex: search, $options: 'i' } },
      { department: { $regex: search, $options: 'i' } },
      { 'user.email': { $regex: search, $options: 'i' } }
    ];
  }
  
  // Department filter
  if (department) {
    query.department = department;
  }
  
  // Availability filter
  if (available !== undefined) {
    query.isAvailable = available === 'true';
  }

  const doctors = await Doctor.find(query)
    .populate('user', 'name email phone avatar')
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit))
    .sort('-createdAt');

  const total = await Doctor.countDocuments(query);

  res.json({
    success: true,
    doctors,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page)
  });
});



// @desc    Get doctor statistics
// @route   GET /api/doctors/stats
// @access  Private
const getDoctorStats = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const totalDoctors = await Doctor.countDocuments();
  const availableToday = await Doctor.countDocuments({ isAvailable: true });

  const stats = await Doctor.aggregate([
    { $group: { _id: null, avgRating: { $avg: '$rating' } } }
  ]);

  const appointmentsToday = await Appointment.countDocuments({
    date: { $gte: today, $lt: tomorrow }
  });

  res.json({
    success: true,
    data: {
      totalDoctors,
      availableToday,
      averageRating: stats[0]?.avgRating || 0,
      appointmentsToday
    }
  });
});

// @desc    Create doctor
// @route   POST /api/doctors
// @access  Private/Admin
const createDoctor = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    phone,
    specialization,
    department,
    consultationFee,
    experience,
    qualifications,
    education,
    licenseNumber,
    maxPatientsPerDay
  } = req.body;

  // Validate required fields
  if (!name || !email || !password || !department || !consultationFee) {
    return res.status(400).json({ 
      success: false, 
      message: 'Required fields missing' 
    });
  }

  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ 
      success: false, 
      message: 'Email already exists' 
    });
  }


  // Create user
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    phone,
    role: 'doctor',
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=667eea&color=fff&size=256`
  });

  // Create doctor profile
  const doctorId=await generateDoctorId();
  const doctor = await Doctor.create({
    doctorId,
    user: user._id,
    specialization,
    department,
    consultationFee: parseFloat(consultationFee),
    experience: experience ? parseInt(experience) : 0,
    qualifications,
    education,
    licenseNumber,
    maxPatientsPerDay: maxPatientsPerDay ? parseInt(maxPatientsPerDay) : 20,
    isAvailable: true,
    rating: 0,
    totalRatings: 0
  });

  const populatedDoctor = await Doctor.findById(doctor._id).populate('user', 'name email phone avatar');

  res.status(201).json({
    success: true,
    message: 'Doctor created successfully',
    doctor: populatedDoctor
  });
});

// @desc    Update doctor
// @route   PUT /api/doctors/:id
// @access  Private/Admin
const updateDoctor = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    phone,
    photo,
    specialization,
    department,
    consultationFee,
    experience,
    qualifications,
    education,
    licenseNumber,
    maxPatientsPerDay
  } = req.body;

  const doctor = await Doctor.findById(req.params.id).populate('user');
  if (!doctor) {
    return res.status(404).json({ 
      success: false, 
      message: 'Doctor not found' 
    });
  }

  // Update user data
  if (doctor.user) {
    const userUpdates = {};
    if (name) userUpdates.name = name;
    if (email) userUpdates.email = email;
    if (phone) userUpdates.phone = phone;
    if (photo) userUpdates.photo = photo;
    
    if (Object.keys(userUpdates).length > 0) {
      await User.findByIdAndUpdate(doctor.user._id, userUpdates, { new: true });
    }
  }

  // Update doctor data
  const doctorUpdates = {};
  if (specialization) doctorUpdates.specialization = specialization;
  if (department) doctorUpdates.department = department;
  if (consultationFee) doctorUpdates.consultationFee = parseFloat(consultationFee);
  if (experience) doctorUpdates.experience = parseInt(experience);
  if (qualifications) doctorUpdates.qualifications = qualifications;
  if (education) doctorUpdates.education = education;
  if (licenseNumber) doctorUpdates.licenseNumber = licenseNumber;
  if (maxPatientsPerDay) doctorUpdates.maxPatientsPerDay = parseInt(maxPatientsPerDay);

  const updatedDoctor = await Doctor.findByIdAndUpdate(
    req.params.id,
    doctorUpdates,
    { new: true, runValidators: true }
  ).populate('user', 'name email phone photo');

  res.json({ 
    success: true, 
    message: 'Doctor updated successfully',
    doctor: updatedDoctor 
  });
});

// @desc    Delete doctor
// @route   DELETE /api/doctors/:id
// @access  Private/Admin
const deleteDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) {
    return res.status(404).json({ 
      success: false, 
      message: 'Doctor not found' 
    });
  }

  // Delete associated user
  await User.findByIdAndDelete(doctor.user);
  
  // Delete doctor
  await Doctor.findByIdAndDelete(req.params.id);

  res.json({ 
    success: true, 
    message: 'Doctor deleted successfully' 
  });
});

// @desc    Update doctor availability
// @route   PUT /api/doctors/:id/availability
// @access  Private/Admin, Doctor
const updateAvailability = asyncHandler(async (req, res) => {
  const { isAvailable } = req.body;

  const doctor = await Doctor.findByIdAndUpdate(
    req.params.id,
    { isAvailable },
    { new: true, runValidators: true }
  ).populate('user', 'name email phone avatar');

  if (!doctor) {
    return res.status(404).json({ 
      success: false, 
      message: 'Doctor not found' 
    });
  }

  res.json({
    success: true,
    message: 'Availability updated successfully',
    doctor
  });
});

// controllers/doctorController.js - Add this endpoint
const getDoctorByUserId = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  if (!isValidObjectId(userId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid user ID'
    });
  }
  
  try {
    // Find user first
    const user = await User.findById(userId);
    if (!user || user.role !== 'doctor') {
      return res.status(404).json({
        success: false,
        message: 'Doctor user not found'
      });
    }
    
    // Find doctor profile
  const doctorProfile = await Doctor.findOne({ user: userId })
      .populate('user', 'name email phone,photo');
    
    if (!doctorProfile) {
      // Return basic doctor info even if no profile exists
      return res.json({
        success: true,
        data: {
          _id: null,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            photo:user.photo,
            role: user.role
          },
          department: 'General',
          isAvailable: true
        }
      });
    }
    
    res.json({
      success: true,
      data: doctorProfile
    });
  } catch (error) {
    console.error('Error fetching doctor by user ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching doctor information'
    });
  }
});

module.exports = {
  getDoctors,
  getDoctorStats,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  updateAvailability,
  getDoctorByUserId
};