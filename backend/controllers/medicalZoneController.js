// controllers/medicalZoneController.js
const Patient = require('../models/Patient');
const MedicalRecord = require('../models/MedicalRecord');
const Appointment = require('../models/Appointment');
const Treatment = require('../models/Treatment');
const moment = require('moment');
const { normalizeArrayObjects } = require('../utils/normalize');
const mongoose = require('mongoose');

exports.getMedicalZoneData = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { page = 1, limit = 10, search, dateFrom, dateTo } = req.query;

    // ---------------- Patient ----------------
    let patient;
    if (mongoose.Types.ObjectId.isValid(patientId)) {
      patient = await Patient.findById(patientId);
    } else {
      patient = await Patient.findOne({ patientId });
    }

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      });
    }

    // ---------------- Queries ----------------
    const medicalRecordQuery = { patient: patient._id };
    const treatmentQuery = { patient: patient._id };
    const appointmentQuery = { patient: patient._id };

    if (search) {
      const regex = new RegExp(search, "i");
      medicalRecordQuery.$or = [{ diagnosis: regex }, { notes: regex }];
      treatmentQuery.$or = [{ diagnosis: regex }, { notes: regex }];
      appointmentQuery.$or = [{ purpose: regex }, { notes: regex }];
    }

    if (dateFrom || dateTo) {
      const dateFilter = {};
      if (dateFrom) dateFilter.$gte = new Date(dateFrom);
      if (dateTo) dateFilter.$lte = new Date(dateTo);
      medicalRecordQuery.date = dateFilter;
      appointmentQuery.date = dateFilter;
    }

    // ---------------- FETCH DATA (FIX) ----------------
    const medicalRecords = await MedicalRecord.find(medicalRecordQuery)
      .populate("doctor", "name")
      .sort({ createdAt: -1 });

    const treatments = await Treatment.find(treatmentQuery)
      .populate("doctor", "name")
      .sort({ createdAt: -1 });

    const appointments = await Appointment.find(appointmentQuery)
      .populate("doctor", "name")
      .sort({ date: 1 });

    // ---------------- Transform ----------------
    const symptoms = [];
    const diagnoses = [];
    const notes = [];
    const prescriptions = [];
    const treatmentPlans = [];
    const followUps = [];

    medicalRecords.forEach(record => {
      if (record.symptoms?.length) {
        record.symptoms.forEach(s => {
          symptoms.push({
            ...s,
            date: record.date,
            doctor: record.doctor
          });
        });
      }

      if (record.diagnosis && record.diagnosis !== "Clinical Note") {
        diagnoses.push({
          id: record._id,
          name: record.diagnosis,
          notes: record.notes,
          doctor: record.doctor,
          date: record.date
        });
      }

      if (record.notes) {
        notes.push({
          id: record._id,
          content: record.notes,
          doctor: record.doctor,
          date: record.date
        });
      }
    });

    treatments.forEach(t => {
      if (t.type === "treatment") {
        treatmentPlans.push(t);
      }
      if (t.type === "prescription") {
        prescriptions.push(t);
      }
    });

    appointments.forEach(app => {
      if (["scheduled", "confirmed"].includes(app.status)) {
        followUps.push(app);
      }
    });

    // ---------------- Response ----------------
    res.json({
      success: true,
      patient,
      symptoms: symptoms.slice(0, 10),
      diagnoses: diagnoses.slice(0, 10),
      notes,
      prescriptions,
      treatmentPlans: treatmentPlans.slice(0, 10),
      followUps: followUps.slice(0, 10),
      appointments,
      treatments,

      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalItems: medicalRecords.length
      },

      stats: {
        totalSymptoms: symptoms.length,
        totalDiagnoses: diagnoses.length,
        totalNotes: notes.length,
        totalPrescriptions: prescriptions.length,
        totalTreatments: treatmentPlans.length,
        upcomingFollowUps: followUps.length
      }
    });

  } catch (error) {
    console.error("Error in getMedicalZoneData:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// Backend controller - Fix the issue with getting all symptoms
exports.addSymptom = async (req, res) => {
  try {
    const { patientId } = req.params;
    const symptomData = req.body;

    let patient;
    if (mongoose.Types.ObjectId.isValid(patientId)) {
      patient = await Patient.findById(patientId);
    } else {
      patient = await Patient.findOne({ patientId });
    }

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    let medicalRecord = await MedicalRecord.findOne({
      patient: patient._id,
      visitType: "symptom_record"
    }).sort({ date: -1 });

    if (!medicalRecord) {
      medicalRecord = new MedicalRecord({
        patient: patient._id,
        diagnosis: "Symptom recording",
        doctor: req.user?._id || req.body.doctorId,
        visitType: "symptom_record", // ✅ now valid
        symptoms: []
      });
    }

    const allowedStatuses = ["active", "resolved", "monitoring"];

    medicalRecord.symptoms.push({
      name: symptomData.name,
      severity: symptomData.severity || "moderate",
      duration: symptomData.duration,
      description: symptomData.description,
      onset: symptomData.onset,
      pattern: symptomData.pattern,
      triggers: symptomData.triggers,
      notes: symptomData.notes,
      status: allowedStatuses.includes(symptomData.status)
        ? symptomData.status
        : "active"
    });

    await medicalRecord.save();

    await medicalRecord.populate("patient", "fullName patientId");
    if (medicalRecord.doctor) {
      await medicalRecord.populate("doctor", "name email");
    }

    res.status(201).json({
      message: "Symptom added successfully",
      symptom: medicalRecord.symptoms.at(-1),
      record: medicalRecord
    });
  } catch (error) {
    console.error("Error adding symptom:", error);
    res.status(500).json({
      message: "Error adding symptom",
      error: error.message
    });
  }
};

exports.updateSymptom = async (req, res) => {
  try {
    const { patientId, symptomId } = req.params;

    const patientObjectId = mongoose.Types.ObjectId.isValid(patientId)
      ? new mongoose.Types.ObjectId(patientId)
      : null;

    if (!patientObjectId) {
      return res.status(400).json({ message: "Invalid patientId" });
    }

    const medicalRecord = await MedicalRecord.findOne({
      patient: patientObjectId,
      "symptoms._id": symptomId
    });

    if (!medicalRecord) {
      return res.status(404).json({ message: "Symptom not found" });
    }

    const symptom = medicalRecord.symptoms.id(symptomId);

    Object.keys(req.body).forEach((key) => {
      if (req.body[key] !== undefined) {
        symptom[key] = req.body[key];
      }
    });

    await medicalRecord.save();

    res.json({
      message: "Symptom updated successfully",
      symptom
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.deleteSymptom = async (req, res) => {
  try {
    const { patientId, symptomId } = req.params;

    const patientObjectId = new mongoose.Types.ObjectId(patientId);

    const medicalRecord = await MedicalRecord.findOne({
      patient: patientObjectId,
      "symptoms._id": symptomId
    });

    if (!medicalRecord) {
      return res.status(404).json({ message: "Symptom not found" });
    }

    medicalRecord.symptoms.pull({ _id: symptomId });
    await medicalRecord.save();

    res.json({ message: "Symptom deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllSymptoms = async (req, res) => {
  try {
    const { patientId } = req.params;

    const patientObjectId = new mongoose.Types.ObjectId(patientId);

    const records = await MedicalRecord.find({
      patient: patientObjectId,
      symptoms: { $exists: true, $not: { $size: 0 } }
    })
      .populate("patient", "fullName patientId")
      .populate("doctor", "name email")
      .sort({ createdAt: -1 });

    const symptoms = records.flatMap(record =>
      record.symptoms.map(symptom => ({
        ...symptom.toObject(),
        recordId: record._id,
        recordedDate: record.date,
        doctor: record.doctor
      }))
    );

    res.json({
      patient: records[0]?.patient || null,
      symptoms,
      count: symptoms.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// CRUD operations for diagnoses
exports.addDiagnosis = async (req, res) => {
  const { patientId } = req.params;
  const patient = await Patient.findById(patientId);
  if (!patient) return res.status(404).json({ message: "Patient not found" });

  const record = new MedicalRecord({
    patient: patient._id,
    diagnosis: req.body.name,
    notes: req.body.notes,
    confidence: req.body.confidence,
    visitType: req.body.type || "routine",
    doctor: req.user._id,
    date: new Date()
  });

  await record.save();
  res.status(201).json(record);
};

exports.updateDiagnosis = async (req, res) => {
  try {
    const { recordId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(recordId)) {
      return res.status(400).json({ message: "Invalid diagnosis record ID" });
    }

    const record = await MedicalRecord.findById(recordId);
    if (!record) {
      return res.status(404).json({ message: "Diagnosis record not found" });
    }

    // 🔁 MAP frontend labels → backend enum
    let visitType = req.body.type;

    const visitTypeMap = {
      Primary: "routine",
      "Follow-up": "follow-up",
      Emergency: "emergency",
      Other: "other"
    };

    if (visitTypeMap[visitType]) {
      visitType = visitTypeMap[visitType];
    }

    record.diagnosis = req.body.name;
    record.notes = req.body.notes;
    record.confidence = req.body.confidence;
    record.visitType = visitType || record.visitType;

    await record.save();

    res.json({ message: "Diagnosis updated successfully" });
  } catch (error) {
    console.error("Update Diagnosis Error:", error);
    res.status(500).json({
      message: "Update failed",
      error: error.message
    });
  }
};


exports.deleteDiagnosis = async (req, res) => {
  try {
    const { recordId } = req.params;

    if (!recordId || !mongoose.Types.ObjectId.isValid(recordId)) {
      return res.status(400).json({
        message: "Invalid diagnosis record ID"
      });
    }

    const record = await MedicalRecord.findById(recordId);
    if (!record) {
      return res.status(404).json({ message: "Diagnosis not found" });
    }

    await record.deleteOne();

    res.json({ message: "Diagnosis deleted successfully" });
  } catch (error) {
    console.error("Delete Diagnosis Error:", error);
    res.status(500).json({ message: "Delete failed" });
  }
};

exports.addTreatment = async (req, res) => {
  try {
    const { patientId } = req.params;
    const data = req.body;

    const treatment = await Treatment.create({
      treatmentId: `TRT-${Date.now()}`, // ✅ FIX

      patient: patientId,
      doctor: req.user._id,

      diagnosis: data.name || "General Treatment",

      symptoms: Array.isArray(data.symptoms) ? data.symptoms : [],

      prescribedTherapies: normalizeArrayObjects(data.therapies, "therapy"),
      medicines: normalizeArrayObjects(data.medicines, "medicine"),

      dietRecommendations: data.diet || [],
      lifestyleChanges: data.lifestyle || [],

      notes: data.notes,
      followUpDate: data.followUpDate || null,
      duration: data.duration || null,

      status: data.status || "ongoing"
    });

    res.status(201).json({
      message: "Treatment added successfully",
      treatment
    });

  } catch (error) {
    console.error("ADD TREATMENT ERROR:", error);
    res.status(500).json({
      message: "Error adding treatment",
      error: error.message
    });
  }
};


const normalizeTherapies = (therapies = []) => {
  if (!Array.isArray(therapies)) return [];

  return therapies
    .filter(t => t && t.therapy)
    .filter(t => mongoose.Types.ObjectId.isValid(t.therapy))
    .map(t => ({
      therapy: t.therapy,
      duration: t.duration || null,
      notes: t.notes || ""
    }));
};

const normalizeMedicines = (medicines = []) => {
  if (!Array.isArray(medicines)) return [];

  return medicines
    .filter(m => m && m.name)
    .map(m => ({
      name: m.name,
      dosage: m.dosage || "As directed",
      frequency: m.frequency || "Once a day",
      duration: m.duration || "7 days"
    }));
};

exports.updateTreatment = async (req, res) => {
  try {
    const { treatmentId } = req.params;
    const data = req.body;

    const treatment = await Treatment.findById(treatmentId);
    if (!treatment) {
      return res.status(404).json({ message: "Treatment not found" });
    }

    // Basic fields
    if (data.name !== undefined) treatment.diagnosis = data.name;
    if (Array.isArray(data.symptoms)) treatment.symptoms = data.symptoms;
    if (Array.isArray(data.diet)) treatment.dietRecommendations = data.diet;
    if (Array.isArray(data.lifestyle)) treatment.lifestyleChanges = data.lifestyle;
    if (data.notes !== undefined) treatment.notes = data.notes;
    if (data.followUpDate !== undefined) treatment.followUpDate = data.followUpDate;
    if (data.status !== undefined) treatment.status = data.status;

    // 🔐 SAFE arrays
    if ("therapies" in data) {
      treatment.prescribedTherapies = normalizeTherapies(data.therapies);
    }

    if ("medicines" in data) {
      treatment.medicines = normalizeMedicines(data.medicines);
    }

    await treatment.save();

    const populated = await Treatment.findById(treatment._id)
      .populate("doctor", "name email")
      .populate("prescribedTherapies.therapy", "name category");

    res.json({
      message: "Treatment updated successfully",
      treatment: populated
    });

  } catch (error) {
    console.error("UPDATE TREATMENT ERROR:", error);
    res.status(500).json({
      message: "Error updating treatment",
      error: error.message
    });
  }
};


// delete 

exports.deleteTreatment = async (req, res) => {
  try {
    const { treatmentId } = req.params;

    const treatment = await Treatment.findByIdAndDelete(treatmentId);
    if (!treatment) {
      return res.status(404).json({ message: "Treatment not found" });
    }

    res.json({
      message: "Treatment deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting treatment",
      error: error.message
    });
  }
};

// Add clinical note
exports.addClinicalNote = async (req, res) => {
  try {
    const { patientId } = req.params;
    const noteData = req.body;
    
    let patient;
    if (mongoose.Types.ObjectId.isValid(patientId)) {
      patient = await Patient.findById(patientId);
    } else {
      patient = await Patient.findOne({ patientId: patientId });
    }
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    const medicalRecord = new MedicalRecord({
      patient: patient._id,
      date: new Date(),
      diagnosis: 'Clinical Note',
      notes: noteData.content,
      doctor: req.user._id,
      visitType: 'other',
      status: 'confirmed'
    });
    
    await medicalRecord.save();
    
    await medicalRecord.populate('doctor', 'name email');
    
    res.status(201).json({
      message: 'Clinical note added successfully',
      record: medicalRecord
    });
  } catch (error) {
    console.error('Error adding note:', error);
    res.status(500).json({ 
      message: 'Error adding note', 
      error: error.message 
    });
  }
};

exports.getClinicalNotesByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { page = 1, limit = 10, search } = req.query;

    // ---------------- Find Patient ----------------
    let patient;
    if (mongoose.Types.ObjectId.isValid(patientId)) {
      patient = await Patient.findById(patientId);
    } else {
      patient = await Patient.findOne({ patientId });
    }

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      });
    }

    // ---------------- Query ----------------
    const query = {
      patient: patient._id,
      diagnosis: "Clinical Note"
    };

    if (search) {
      query.notes = { $regex: search, $options: "i" };
    }

    // ---------------- Fetch Notes ----------------
    const notes = await MedicalRecord.find(query)
      .populate("doctor", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await MedicalRecord.countDocuments(query);

    // ---------------- Response ----------------
    res.status(200).json({
      success: true,
      notes: notes.map(note => ({
        id: note._id,
        content: note.notes,
        date: note.date,
        doctor: note.doctor,
        visitType: note.visitType,
        status: note.status
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
        totalRecords: total
      }
    });

  } catch (error) {
    console.error("Error fetching clinical notes:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching clinical notes",
      error: error.message
    });
  }
};

// Add clinical note
exports.addClinicalNote = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { content } = req.body;

    let patient;
    if (mongoose.Types.ObjectId.isValid(patientId)) {
      patient = await Patient.findById(patientId);
    } else {
      patient = await Patient.findOne({ patientId });
    }

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      });
    }

    const medicalRecord = new MedicalRecord({
      patient: patient._id,
      date: new Date(),
      diagnosis: "Clinical Note",
      notes: content,
      doctor: req.user._id,
      visitType: "other",
      status: "confirmed"
    });

    await medicalRecord.save();
    await medicalRecord.populate("doctor", "name email");

    res.status(201).json({
      success: true,
      message: "Clinical note added successfully",
      note: {
        id: medicalRecord._id,
        content: medicalRecord.notes,
        date: medicalRecord.date,
        doctor: medicalRecord.doctor
      }
    });

  } catch (error) {
    console.error("Error adding note:", error);
    res.status(500).json({
      success: false,
      message: "Error adding note",
      error: error.message
    });
  }
};

exports.updateClinicalNote = async (req, res) => {
  try {
    const { noteId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      return res.status(400).json({ message: "Invalid note ID" });
    }

    const record = await MedicalRecord.findById(noteId);

    if (!record) {
      return res.status(404).json({ message: "Clinical note not found" });
    }

    record.notes = req.body.content;
    await record.save();

    res.json({ message: "Clinical note updated", record });
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};

exports.deleteClinicalNote = async (req, res) => {
  try {
    const { noteId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      return res.status(400).json({ message: "Invalid note ID" });
    }

    const record = await MedicalRecord.findByIdAndDelete(noteId);

    if (!record) {
      return res.status(404).json({ message: "Clinical note not found" });
    }

    res.json({ message: "Clinical note deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
};


exports.getPrescriptionsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const statusFilter = req.query.status;
    const search = req.query.search;

    // console.log('Fetching prescriptions for patientId:', patientId);
    // console.log('Query params:', { page, limit, statusFilter, search });

    // Find patient by ID or patientId
    let patient;
    if (mongoose.Types.ObjectId.isValid(patientId)) {
      patient = await Patient.findById(patientId);
    } else {
      patient = await Patient.findOne({ patientId });
    }

    if (!patient) {
      console.log('Patient not found with ID:', patientId);
      return res.status(404).json({ 
        message: "Patient not found",
        patientId 
      });
    }

    // console.log('Found patient:', patient._id);
    
    // Build query - REMOVE type filter if not used
    let query = { patient: patient._id };
    
    // Add type filter only if you're using it
    // query.type = "prescription";
    
    if (statusFilter && statusFilter !== "all") {
      query.status = statusFilter;
    }
    
    // Add search functionality
    if (search) {
      query.$or = [
        { diagnosis: { $regex: search, $options: 'i' } },
        { 'medicines.name': { $regex: search, $options: 'i' } },
        { treatmentId: { $regex: search, $options: 'i' } }
      ];
    }

    // console.log('Final query:', JSON.stringify(query));

    const totalItems = await Treatment.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);

    const prescriptions = await Treatment.find(query)
      .populate("doctor", "name email specialty")
      .populate("patient", "fullName patientId age gender")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    // console.log('Found prescriptions:', prescriptions.length);

    // Get status counts
    const statusCounts = {
      ongoing: await Treatment.countDocuments({ patient: patient._id, status: "ongoing" }),
      active: await Treatment.countDocuments({ patient: patient._id, status: "active" }),
      completed: await Treatment.countDocuments({ patient: patient._id, status: "completed" }),
      expired: await Treatment.countDocuments({ patient: patient._id, status: "expired" }),
      cancelled: await Treatment.countDocuments({ patient: patient._id, status: "cancelled" }),
      printed: await Treatment.countDocuments({ patient: patient._id, isPrinted: true })
    };

    res.status(200).json({
      prescriptions,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems
      },
      statusCounts
    });
  } catch (error) {
    console.error("Error fetching prescriptions:", error);
    res.status(500).json({ 
      message: "Error fetching prescriptions", 
      error: error.message 
    });
  }
};

// Add prescription
exports.addPrescription = async (req, res) => {
  try {
    const { patientId } = req.params;
    const prescriptionData = req.body;
    
    // console.log('Adding prescription for patient:', patientId);
    // console.log('Prescription data:', prescriptionData);

    // Find patient
    let patient;
    if (mongoose.Types.ObjectId.isValid(patientId)) {
      patient = await Patient.findById(patientId);
    } else {
      patient = await Patient.findOne({ patientId });
    }

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Get doctor from request (assuming doctor info is in req.user from auth middleware)
    const doctorId = req.user._id;

    // Create prescription
    const prescription = new Treatment({
      ...prescriptionData,
      patient: patient._id,
      doctor: doctorId,
      type: 'prescription', // Make sure this matches your schema
      status: prescriptionData.status || 'ongoing'
    });

    // Calculate validUntil if durationDays is provided
    if (prescriptionData.durationDays) {
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + prescriptionData.durationDays);
      prescription.validUntil = validUntil;
    }

    await prescription.save();

    // Populate references
    await prescription.populate('doctor', 'name email specialty');
    await prescription.populate('patient', 'fullName patientId age gender');

    res.status(201).json({
      message: 'Prescription created successfully',
      prescription
    });

  } catch (error) {
    console.error('Error creating prescription:', error);
    res.status(500).json({ 
      message: 'Error creating prescription', 
      error: error.message 
    });
  }
};

// Update prescription - FIXED
exports.updatePrescription = async (req, res) => {
  try {
    const { prescriptionId } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(prescriptionId)) {
      return res.status(400).json({ message: "Invalid prescription ID" });
    }

    const prescription = await Treatment.findById(prescriptionId);
    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    // ✅ Allowed Treatment statuses ONLY
    const allowedStatuses = ["ongoing", "completed", "cancelled", "printed"];

    Object.keys(updateData).forEach(key => {
      if (
        key === "status" &&
        !allowedStatuses.includes(updateData.status)
      ) {
        // ❌ Skip invalid status like "active"
        return;
      }

      if (!["_id", "__v", "treatmentId"].includes(key)) {
        prescription[key] = updateData[key];
      }
    });

    // ✅ Recalculate validUntil safely
    if (updateData.durationDays) {
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + Number(updateData.durationDays));
      prescription.validUntil = validUntil;
    }

    await prescription.save();

    await prescription.populate("doctor", "name email specialty");
    await prescription.populate("patient", "fullName patientId age gender");

    res.json({
      message: "Prescription updated successfully",
      prescription
    });

  } catch (error) {
    console.error("Error updating prescription:", error);
    res.status(500).json({
      message: "Error updating prescription",
      error: error.message
    });
  }
};


// Delete prescription
exports.deletePrescription = async (req, res) => {
  try {
    const { prescriptionId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(prescriptionId)) {
      return res.status(400).json({ message: 'Invalid prescription ID' });
    }
    
    const result = await Treatment.findByIdAndDelete(prescriptionId);
    
    if (!result) {
      return res.status(404).json({ message: 'Prescription not found' });
    }
    
    res.json({
      message: 'Prescription deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting prescription:', error);
    res.status(500).json({ 
      message: 'Error deleting prescription', 
      error: error.message 
    });
  }
};

// Mark as printed
exports.markAsPrinted = async (req, res) => {
  try {
    const { prescriptionId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(prescriptionId)) {
      return res.status(400).json({ message: 'Invalid prescription ID' });
    }
    
    const prescription = await Treatment.findById(prescriptionId);
    
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }
    
    prescription.isPrinted = true;
    prescription.printedAt = new Date();
    await prescription.save();
    
    res.json({
      message: 'Prescription marked as printed',
      prescription
    });
    
  } catch (error) {
    console.error('Error marking as printed:', error);
    res.status(500).json({ 
      message: 'Error marking as printed', 
      error: error.message 
    });
  }
};


// Schedule follow-up
exports.scheduleFollowUp = async (req, res) => {
  try {
    const { patientId } = req.params;
    const followUpData = req.body;
    
    let patient;
    if (mongoose.Types.ObjectId.isValid(patientId)) {
      patient = await Patient.findById(patientId);
    } else {
      patient = await Patient.findOne({ patientId: patientId });
    }
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    const appointment = new Appointment({
      patient: patient._id,
      doctor: req.user._id,
      date: followUpData.date,
      time: followUpData.time,
      type: 'follow-up',
      purpose: followUpData.purpose,
      status: 'scheduled',
      priority: followUpData.priority || 'medium',
      notes: followUpData.notes
    });
    
    await appointment.save();
    
    await appointment.populate('doctor', 'name email');
    
    res.status(201).json({
      message: 'Follow-up scheduled successfully',
      appointment: appointment
    });
  } catch (error) {
    console.error('Error scheduling follow-up:', error);
    res.status(500).json({ 
      message: 'Error scheduling follow-up', 
      error: error.message 
    });
  }
};

exports.scheduleFollowUp = async (req, res) => {
  try {
    const { patientId } = req.params;
    const followUpData = req.body;

    let patient;
    if (mongoose.Types.ObjectId.isValid(patientId)) {
      patient = await Patient.findById(patientId);
    } else {
      patient = await Patient.findOne({ patientId });
    }

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const appointment = new Appointment({
      patient: patient._id,
      doctor: req.user._id,
      date: followUpData.date,
      time: followUpData.time,
      type: 'follow-up',
      purpose: followUpData.purpose,
      status: 'scheduled',
      priority: followUpData.priority || 'medium',
      notes: followUpData.notes,
      duration: followUpData.duration || 30,
      location: followUpData.location || 'Clinic',
      reminder: followUpData.reminder ?? true,
      reminderTime: followUpData.reminderTime || '1 day before'
    });

    await appointment.save();
    await appointment.populate('doctor', 'name email specialty');
    await appointment.populate('patient', 'name patientId dob gender');

    res.status(201).json({
      success: true,
      message: 'Follow-up scheduled successfully',
      appointment
    });
  } catch (error) {
    console.error('Error scheduling follow-up:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error scheduling follow-up'
    });
  }
};


// Get all follow-ups for a patient
exports.getFollowUps = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      status, 
      priority,
      dateFrom,
      dateTo,
      search 
    } = req.query;
    
    let patient;
    if (mongoose.Types.ObjectId.isValid(patientId)) {
      patient = await Patient.findById(patientId);
    } else {
      patient = await Patient.findOne({ patientId: patientId });
    }
    
    if (!patient) {
      return res.status(404).json({ 
        success: false,
        message: 'Patient not found' 
      });
    }
    
    // Build query
    let query = {
      patient: patient._id,
      type: 'follow-up'
    };
    
    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Filter by priority
    if (priority && priority !== 'all') {
      query.priority = priority;
    }
    
    // Date range filter
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
    }
    
    // Search in purpose and notes
    if (search) {
      query.$or = [
        { purpose: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (page - 1) * limit;
    
    const [followUps, total] = await Promise.all([
      Appointment.find(query)
        .sort({ date: 1, time: 1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('doctor', 'name email specialty')
        .populate('patient', 'name patientId dob gender'),
      Appointment.countDocuments(query)
    ]);
    
    // Get upcoming and overdue counts
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcomingCount = await Appointment.countDocuments({
      ...query,
      date: { $gte: today },
      status: { $in: ['scheduled', 'confirmed'] }
    });
    
    const overdueCount = await Appointment.countDocuments({
      ...query,
      date: { $lt: today },
      status: { $in: ['scheduled', 'confirmed'] }
    });
    
    res.status(200).json({
      success: true,
      count: followUps.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      upcomingCount,
      overdueCount,
      followUps
    });
  } catch (error) {
    console.error('Error fetching follow-ups:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching follow-ups', 
      error: error.message 
    });
  }
};

// Get recent follow-ups (for 4-card display)
exports.getRecentFollowUps = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { limit = 4 } = req.query;
    
    let patient;
    if (mongoose.Types.ObjectId.isValid(patientId)) {
      patient = await Patient.findById(patientId);
    } else {
      patient = await Patient.findOne({ patientId: patientId });
    }
    
    if (!patient) {
      return res.status(404).json({ 
        success: false,
        message: 'Patient not found' 
      });
    }
    
    const followUps = await Appointment.find({
      patient: patient._id,
      type: 'follow-up',
      status: { $in: ['scheduled', 'confirmed'] }
    })
    .sort({ date: 1 })
    .limit(parseInt(limit))
    .populate('doctor', 'name email specialty')
    .populate('patient', 'name patientId dob gender')
    .lean();
    
    // Add time remaining info
    const enrichedFollowUps = followUps.map(followUp => {
      const now = moment();
      const followUpDate = moment(followUp.date);
      const daysUntil = followUpDate.diff(now, 'days');
      
      return {
        ...followUp,
        daysUntil,
        isToday: daysUntil === 0,
        isTomorrow: daysUntil === 1,
        isOverdue: daysUntil < 0,
        timeSlot: `${followUp.time} (${followUp.duration || 30} mins)`
      };
    });
    
    res.status(200).json({
      success: true,
      count: enrichedFollowUps.length,
      followUps: enrichedFollowUps
    });
  } catch (error) {
    console.error('Error fetching recent follow-ups:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching recent follow-ups', 
      error: error.message 
    });
  }
};

// Get single follow-up
exports.getFollowUpById = async (req, res) => {
  try {
    const { followUpId } = req.params;
    
    const followUp = await Appointment.findOne({
      _id: followUpId,
      type: 'follow-up'
    })
    .populate('doctor', 'name email specialty phone')
    .populate('patient', 'name patientId dob gender phone email address');
    
    if (!followUp) {
      return res.status(404).json({ 
        success: false,
        message: 'Follow-up not found' 
      });
    }
    
    // Calculate time info
    const now = moment();
    const followUpDate = moment(followUp.date);
    const daysUntil = followUpDate.diff(now, 'days');
    
    const enrichedFollowUp = {
      ...followUp.toObject(),
      daysUntil,
      isToday: daysUntil === 0,
      isTomorrow: daysUntil === 1,
      isOverdue: daysUntil < 0,
      timeSlot: `${followUp.time} (${followUp.duration || 30} mins)`,
      dateFormatted: followUpDate.format('dddd, MMMM Do YYYY')
    };
    
    res.status(200).json({
      success: true,
      followUp: enrichedFollowUp
    });
  } catch (error) {
    console.error('Error fetching follow-up:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching follow-up', 
      error: error.message 
    });
  }
};

// Update follow-up
exports.updateFollowUp = async (req, res) => {
  try {
    const { followUpId } = req.params;
    const updateData = req.body;
    
    const followUp = await Appointment.findOne({
      _id: followUpId,
      type: 'follow-up'
    });
    
    if (!followUp) {
      return res.status(404).json({ 
        success: false,
        message: 'Follow-up not found' 
      });
    }
    
    // Check if user is authorized
    if (followUp.doctor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to update this follow-up' 
      });
    }
    
    // Update allowed fields
    const allowedUpdates = ['date', 'time', 'purpose', 'priority', 'notes', 'status', 'duration', 'location'];
    allowedUpdates.forEach(field => {
      if (updateData[field] !== undefined) {
        followUp[field] = updateData[field];
      }
    });
    
    followUp.updatedAt = new Date();
    
    await followUp.save();
    
    await followUp.populate('doctor', 'name email specialty');
    await followUp.populate('patient', 'name patientId dob gender');
    
    res.status(200).json({
      success: true,
      message: 'Follow-up updated successfully',
      followUp
    });
  } catch (error) {
    console.error('Error updating follow-up:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating follow-up', 
      error: error.message 
    });
  }
};

// Delete follow-up
exports.deleteFollowUp = async (req, res) => {
  try {
    const { followUpId } = req.params;
    
    const followUp = await Appointment.findOne({
      _id: followUpId,
      type: 'follow-up'
    });
    
    if (!followUp) {
      return res.status(404).json({ 
        success: false,
        message: 'Follow-up not found' 
      });
    }
    
    // Check if user is authorized
    if (followUp.doctor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to delete this follow-up' 
      });
    }
    
    await followUp.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Follow-up deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting follow-up:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error deleting follow-up', 
      error: error.message 
    });
  }
};

// Mark follow-up as complete
exports.markFollowUpComplete = async (req, res) => {
  try {
    const { followUpId } = req.params;
    const { outcomeNotes } = req.body;
    
    const followUp = await Appointment.findOne({
      _id: followUpId,
      type: 'follow-up'
    });
    
    if (!followUp) {
      return res.status(404).json({ 
        success: false,
        message: 'Follow-up not found' 
      });
    }
    
    followUp.status = 'completed';
    followUp.outcomeNotes = outcomeNotes || followUp.outcomeNotes;
    followUp.completedAt = new Date();
    followUp.updatedAt = new Date();
    
    await followUp.save();
    
    res.status(200).json({
      success: true,
      message: 'Follow-up marked as complete',
      followUp
    });
  } catch (error) {
    console.error('Error marking follow-up complete:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error marking follow-up complete', 
      error: error.message 
    });
  }
};

// Reschedule follow-up
exports.rescheduleFollowUp = async (req, res) => {
  try {
    const { followUpId } = req.params;
    const { newDate, newTime, reason } = req.body;
    
    const followUp = await Appointment.findOne({
      _id: followUpId,
      type: 'follow-up'
    });
    
    if (!followUp) {
      return res.status(404).json({ 
        success: false,
        message: 'Follow-up not found' 
      });
    }
    
    // Store reschedule history
    if (!followUp.rescheduleHistory) {
      followUp.rescheduleHistory = [];
    }
    
    followUp.rescheduleHistory.push({
      originalDate: followUp.date,
      originalTime: followUp.time,
      newDate: newDate,
      newTime: newTime,
      reason: reason,
      rescheduledBy: req.user._id,
      rescheduledAt: new Date()
    });
    
    // Update date and time
    followUp.date = newDate;
    followUp.time = newTime;
    followUp.status = 'rescheduled';
    followUp.updatedAt = new Date();
    
    await followUp.save();
    
    res.status(200).json({
      success: true,
      message: 'Follow-up rescheduled successfully',
      followUp
    });
  } catch (error) {
    console.error('Error rescheduling follow-up:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error rescheduling follow-up', 
      error: error.message 
    });
  }
};

// Delete medical record
exports.deleteRecord = async (req, res) => {
  try {
    const { recordId } = req.params;
    
    const record = await MedicalRecord.findByIdAndDelete(recordId);
    
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }
    
    res.json({ 
      message: 'Record deleted successfully',
      recordId: recordId
    });
  } catch (error) {
    console.error('Error deleting record:', error);
    res.status(500).json({ 
      message: 'Error deleting record', 
      error: error.message 
    });
  }
};