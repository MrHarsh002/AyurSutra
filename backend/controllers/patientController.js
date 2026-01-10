// controllers/patientController.js
const mongoose = require('mongoose');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Treatment = require('../models/Treatment');
const { generatePatientId } = require('../utils/generatePatientId');
const asyncHandler = require('express-async-handler');

// Helper: Validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private
const getPatients = asyncHandler(async (req, res) => {
  let { page = 1, limit = 10, search, status } = req.query;
  
  page = Math.max(1, Number(page) || 1);
  limit = Math.max(1, Number(limit) || 10);
  const skip = (page - 1) * limit;

  const query = {};
  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { patientId: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  if (status) query.status = status;

  const patients = await Patient.find(query)
    .populate('createdBy', 'name email')
    .sort('-createdAt')
    .limit(limit)
    .skip(skip);

  const total = await Patient.countDocuments(query);

  res.json({
    success: true,
    count: patients.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    patients
  });
});

// @desc    Get single patient
// @route   GET /api/patients/:id
// @access  Private
const getPatient = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // ❗ Invalid ID format
  if (!id || !isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: '❌ Invalid patient ID',
    });
  }

  const patient = await Patient.findById(id);

  // ❗ Patient not found
  if (!patient) {
    return res.status(404).json({
      success: false,
      message: '❌ Patient not found',
    });
  }

  // 👍 Success
  return res.status(200).json({
    success: true,
    patient,
  });
});

// @desc    Get Medical Records
const getMedicalRecords = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: '⚠️ Patient ID is required',
    });
  }

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: '❌ Invalid Patient ID format',
    });
  }

  const patient = await Patient.findById(id);

  if (!patient) {
    return res.status(404).json({
      success: false,
      message: '❌ Patient not found',
    });
  }

  return res.status(200).json({
    success: true,
    count: patient.medicalRecords.length,
    records: patient.medicalRecords,
  });
});

// @desc    Create patient
// @route   POST /api/patients
// @access  Private
const createPatient = asyncHandler(async (req, res) => {
  const {
    firstName, lastName, gender, dateOfBirth, bloodGroup, phone,
    email, address, emergencyContact, medicalHistory,
    allergies, occupation, maritalStatus, referredBy
  } = req.body;

  // Validate required fields
  if (!firstName || !lastName || !gender || !dateOfBirth || !phone) {
    return res.status(400).json({
      success: false,
      message: 'Required fields missing: firstName, lastName, gender, dateOfBirth, phone'
    });
  }

  // Validate date
  const birthDate = new Date(dateOfBirth);
  if (isNaN(birthDate.getTime())) {
    return res.status(400).json({
      success: false,
      message: 'Invalid date of birth format'
    });
  }

  // Check if date is not in future
  if (birthDate > new Date()) {
    return res.status(400).json({
      success: false,
      message: 'Date of birth cannot be in the future'
    });
  }

  // Normalize gender and maritalStatus
  const normalizedGender = gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
  const normalizedMaritalStatus = maritalStatus 
    ? maritalStatus.charAt(0).toUpperCase() + maritalStatus.slice(1).toLowerCase()
    : undefined;

  // Calculate age
  const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  
  // Generate patient ID
  const patientId = await generatePatientId();
  const fullName = `${firstName} ${lastName}`;

  try {
    // Create patient
    const patient = await Patient.create({
      patientId,
      fullName,
      firstName,
      lastName,
      gender: normalizedGender,
      dateOfBirth: birthDate,
      age,
      bloodGroup: bloodGroup || 'Unknown',
      phone,
      email: email || '',
      address: address || {},
      emergencyContact: emergencyContact || {},
      medicalHistory: medicalHistory || [],
      allergies: allergies || [],
      occupation: occupation || '',
      maritalStatus: normalizedMaritalStatus,
      referredBy: referredBy || '',
      createdBy: req.user._id
    });

    // Populate createdBy
    await patient.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully',
      data: patient
    });
  } catch (error) {
    console.error('Error creating patient:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Patient with similar details already exists'
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating patient'
    });
  }
});

// @desc    Create Medical Record for a Patient
const createMedicalRecord = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  if (!isValidObjectId(id)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid patient ID' 
    });
  }

  const patient = await Patient.findById(id);

  if (!patient) {
    return res.status(404).json({ 
      success: false, 
      message: 'Patient not found' 
    });
  }

  if (!Array.isArray(patient.medicalRecords)) {
    patient.medicalRecords = [];
  }

  patient.medicalRecords.push(req.body);
  await patient.save();

  const newRecord = patient.medicalRecords.at(-1);

  res.status(201).json({
    success: true,
    message: 'Record added successfully',
    record: newRecord
  });
});

// @desc    Update patient
// @route   PUT /api/patients/:id
// @access  Private
const updatePatient = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  if (!isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid patient ID'
    });
  }

  let patient = await Patient.findById(id);
  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'Patient not found'
    });
  }

  // Prepare update data
  const updateData = { ...req.body };

  // Normalize gender and maritalStatus if provided
  if (updateData.gender) {
    updateData.gender = updateData.gender.charAt(0).toUpperCase() + updateData.gender.slice(1).toLowerCase();
  }
  
  if (updateData.maritalStatus) {
    updateData.maritalStatus = updateData.maritalStatus.charAt(0).toUpperCase() + updateData.maritalStatus.slice(1).toLowerCase();
  }

  // Update age if dateOfBirth is provided
  if (updateData.dateOfBirth) {
    const birthDate = new Date(updateData.dateOfBirth);
    if (isNaN(birthDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date of birth'
      });
    }
    updateData.age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  }

  // Update fullName if firstName or lastName changes
  if (updateData.firstName || updateData.lastName) {
    updateData.fullName = `${updateData.firstName || patient.firstName} ${updateData.lastName || patient.lastName}`;
  }

  // Update patient
  patient = await Patient.findByIdAndUpdate(
    id,
    updateData,
    { 
      new: true, 
      runValidators: true,
      context: 'query'
    }
  ).populate('createdBy', 'name email');

  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'Patient not found after update'
    });
  }

  res.json({
    success: true,
    message: 'Patient updated successfully',
    data: patient
  });
});

// @desc    Delete patient
const deletePatient = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  if (!isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid patient ID'
    });
  }

  const patient = await Patient.findById(id);
  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'Patient not found'
    });
  }

  // Check for existing appointments
  const appointments = await Appointment.find({ patient: patient._id });
  if (appointments.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete patient with existing appointments'
    });
  }

  // Check for existing treatments
  const treatments = await Treatment.find({ patient: patient._id });
  if (treatments.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete patient with existing treatments'
    });
  }

  await patient.deleteOne();

  res.json({
    success: true,
    message: 'Patient deleted successfully'
  });
});

// @desc    Search patients
const searchPatients = asyncHandler(async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json([]);
    }

    const patients = await Patient.find({
      $or: [
        { fullName: { $regex: q, $options: 'i' } },
        { patientId: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]
    })
    .populate('createdBy', 'name email')
    .limit(10);

    res.json(patients);
  } catch (error) {
    console.error('Patient search error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Search failed' 
    });
  }
});

// @desc    Bulk Patient Action
const bulkPatientAction = asyncHandler(async (req, res) => {
  const { patientIds, action } = req.body;

  // Validate
  if (!patientIds || !Array.isArray(patientIds) || patientIds.length === 0) {
    return res.status(400).json({ 
      success: false,
      message: 'No patient IDs provided' 
    });
  }

  if (!action) {
    return res.status(400).json({ 
      success: false,
      message: 'Action is required' 
    });
  }

  // Validate all IDs
  const invalidIds = patientIds.filter(id => !isValidObjectId(id));
  if (invalidIds.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Invalid patient IDs: ${invalidIds.join(', ')}`
    });
  }

  // Perform Actions
  switch (action) {
    case 'delete':
      await Patient.deleteMany({ _id: { $in: patientIds } });
      return res.status(200).json({
        success: true,
        message: `Deleted ${patientIds.length} patients successfully`
      });

    case 'deactivate':
      await Patient.updateMany(
        { _id: { $in: patientIds } },
        { $set: { status: 'inactive' } }
      );
      return res.status(200).json({
        success: true,
        message: `Deactivated ${patientIds.length} patients successfully`
      });

    case 'activate':
      await Patient.updateMany(
        { _id: { $in: patientIds } },
        { $set: { status: 'active' } }
      );
      return res.status(200).json({
        success: true,
        message: `Activated ${patientIds.length} patients successfully`
      });

    default:
      return res.status(400).json({
        success: false,
        message: 'Invalid action'
      });
  }
});

module.exports = {
  getPatients,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient,
  getMedicalRecords,
  createMedicalRecord,
  searchPatients,
  bulkPatientAction
};