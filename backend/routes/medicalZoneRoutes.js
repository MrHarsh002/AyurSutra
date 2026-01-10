// const express = require("express");
// const router = express.Router();

// const {
//   getMedicalZoneData,
//   addSymptom,
//   updateSymptom,
//   addDiagnosis,
//   addTreatment,
//   addClinicalNote,
//   addPrescription,
//   scheduleFollowUp,
//   deleteRecord
// } = require("../controllers/medicalZoneController");

// const { protect } = require("../middleware/authMiddleware");
// const { validateObjectId } = require("../middleware/validateObjectId");

// /**
//  * ============================
//  *  MEDICAL ZONE ROUTES
//  * ============================
//  */

// // 🔹 Get complete medical zone data
// router.get(
//   "/:patientId",
//   protect,
//   validateObjectId("patientId"),
//   getMedicalZoneData
// );

// // 🔹 Symptoms
// router.post(
//   "/:patientId/symptoms",
//   protect,
//   validateObjectId("patientId"),
//   addSymptom
// );

// router.put(
//   "/:patientId/symptoms/:recordId/:symptomIndex",
//   protect,
//   validateObjectId("patientId"),
//   validateObjectId("recordId"),
//   updateSymptom
// );

// // 🔹 Diagnosis
// router.post(
//   "/:patientId/diagnosis",
//   protect,
//   validateObjectId("patientId"),
//   addDiagnosis
// );

// // 🔹 Treatments
// router.post(
//   "/:patientId/treatments",
//   protect,
//   validateObjectId("patientId"),
//   addTreatment
// );

// // 🔹 Clinical Notes
// router.post(
//   "/:patientId/notes",
//   protect,
//   validateObjectId("patientId"),
//   addClinicalNote
// );

// // 🔹 Prescriptions
// router.post(
//   "/:patientId/prescriptions",
//   protect,
//   validateObjectId("patientId"),
//   addPrescription
// );

// // 🔹 Follow-ups
// router.post(
//   "/:patientId/follow-ups",
//   protect,
//   validateObjectId("patientId"),
//   scheduleFollowUp
// );

// // 🔹 Delete any medical record
// router.delete(
//   "/records/:recordId",
//   protect,
//   validateObjectId("recordId"),
//   deleteRecord
// );

// module.exports = router;


// routes/medicalZoneRoutes.js
const express = require('express');
const router = express.Router();
const {
  getMedicalZoneData,

  getAllSymptoms,
  addSymptom,
  updateSymptom,
  deleteSymptom,

  addDiagnosis,
  updateDiagnosis,
  deleteDiagnosis,

  addTreatment,
  updateTreatment,
  deleteTreatment,

  addClinicalNote,
  updateClinicalNote,
  deleteClinicalNote,
  getClinicalNotesByPatient,

  getPrescriptionsByPatient,
  addPrescription,
  updatePrescription,
  deletePrescription,
  markAsPrinted,

  scheduleFollowUp,
  getFollowUps,
  getFollowUpById,
  updateFollowUp,
  deleteFollowUp,
  getRecentFollowUps,
  markFollowUpComplete,
  rescheduleFollowUp,


  deleteRecord
} = require('../controllers/medicalZoneController');
const { protect } = require('../middleware/authMiddleware');

// Get all medical zone data for a patient
router.get('/:patientId', protect, getMedicalZoneData);

// Symptoms
router.post('/:patientId/symptoms', protect, addSymptom);
router.put('/:patientId/symptoms/:symptomId',protect,updateSymptom);
router.delete('/:patientId/symptoms/:symptomId',protect,deleteSymptom);
router.get('/:patientId/symptoms', protect, getAllSymptoms );

// Diagnosis
router.post('/:patientId/diagnosis', protect, addDiagnosis);
router.put('/:patientId/diagnosis/:recordId', protect, updateDiagnosis);
router.delete('/:patientId/diagnosis/:recordId', protect, deleteDiagnosis);

// routes/treatment.routes.js
router.post("/:patientId/treatments", protect, addTreatment);
router.put("/treatments/:treatmentId", protect, updateTreatment);
router.delete("/treatments/:treatmentId", protect, deleteTreatment);

// Clinical Notes
router.get('/:patientId/notes', protect, getClinicalNotesByPatient);
router.post('/:patientId/notes', protect, addClinicalNote);
router.put('/notes/:noteId', protect, updateClinicalNote);
router.delete('/notes/:noteId', protect, deleteClinicalNote);



// Prescriptions
router.get('/:patientId/prescriptions', protect, getPrescriptionsByPatient);
router.post('/:patientId/prescriptions', protect, addPrescription);
router.put('/prescriptions/:prescriptionId', protect, updatePrescription);
router.delete('/prescriptions/:prescriptionId', protect, deletePrescription);
router.put('/prescriptions/:prescriptionId/print', protect, markAsPrinted);

// Follow-ups
router.post('/:patientId/follow-ups', protect, scheduleFollowUp);
router.get('/:patientId/follow-ups/recent', protect, getRecentFollowUps);
router.get('/:patientId/follow-ups', protect, getFollowUps);

router.get('/follow-ups/:followUpId', protect, getFollowUpById);
router.put('/follow-ups/:followUpId', protect, updateFollowUp);
router.delete('/follow-ups/:followUpId', protect, deleteFollowUp);
router.patch('/follow-ups/:followUpId/complete', protect, markFollowUpComplete);
router.patch('/follow-ups/:followUpId/reschedule', protect, rescheduleFollowUp);


// Delete record
router.delete('/records/:recordId', protect, deleteRecord);

module.exports = router;