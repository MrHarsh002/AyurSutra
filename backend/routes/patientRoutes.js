const express = require('express');
const router = express.Router();
const {
  createPatient,
  getPatients,
  getPatient,
  updatePatient,
  deletePatient,
  getMedicalRecords,
  createMedicalRecord,
  searchPatients,
  bulkPatientAction 
} = require('../controllers/patientController');
const { protect } = require('../middleware/authMiddleware');

// 🔍 Search 
router.get("/search", protect, searchPatients);

// 👥 Create + List
router.route("/")
  .post(protect, createPatient)
  .get(protect, getPatients);

// ⭐ Medical Records - ID 
router.get("/:id/medical-records", protect, getMedicalRecords);
router.post("/:id/medical-records", protect, createMedicalRecord); 

// ✏️ Update & ❌ Delete
router.put("/:id", protect, updatePatient);
router.delete("/:id", protect, deletePatient);

// 🧍 Single Patient Info
router.get("/:id", protect, getPatient);

// 🧱 Bulk Actions
router.patch("/bulk", protect, bulkPatientAction);

module.exports = router;
