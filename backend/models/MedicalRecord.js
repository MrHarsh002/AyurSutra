// // models/MedicalRecord.js
// const mongoose = require('mongoose');

// const MedicalRecordSchema = new mongoose.Schema({
//   // 🔗 LINK TO PATIENT
//   patient: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Patient',
//     required: true,
//     index: true
//   },

//   doctor: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },

//   visitType: {
//     type: String,
//     enum: ['routine', 'emergency', 'follow-up', 'other'],
//     default: 'routine'
//   },

//   date: { type: Date, required: true },
//   time: String,

//   diagnosis: { type: String, required: true },

//   symptoms: [{
//     name: String,
//     severity: { type: String, enum: ['low', 'moderate', 'high'] },
//     duration: String,
//     notes: String,
//     status: { type: String, default: 'active' }
//   }],

//   treatment: String,
//   prescription: String,
//   notes: String,

//   vitalSigns: {
//     temperature: String,
//     bloodPressure: String,
//     heartRate: String,
//     respiratoryRate: String,
//     oxygenSaturation: String
//   },

//   tests: { type: [String], default: [] },
//   followUpDate: Date,
//   attachments: [String],

//   status: {
//     type: String,
//     enum: ['pending', 'completed', 'cancelled'],
//     default: 'completed'
//   }

// }, { timestamps: true });

// module.exports = mongoose.model('MedicalRecord', MedicalRecordSchema);


// // const mongoose = require('mongoose');

// // const symptomSchema = new mongoose.Schema({
// //   patient: {
// //   type: mongoose.Schema.Types.ObjectId,
// //   ref: 'Patient',
// //   required: true
// // },
// //   name: {
// //     type: String,
// //     required: true
// //   },
// //   severity: {
// //     type: String,
// //     enum: ['low', 'moderate', 'high'],
// //     default: 'moderate'
// //   },
// //   duration: String,
// //   description: String,
// //   onset: String,
// //   pattern: String,
// //   triggers: String,
// //   notes: String,
// //   status: {
// //     type: String,
// //     enum: ['active', 'resolved', 'monitoring'],
// //     default: 'active'
// //   },
// //   recordedAt: {
// //     type: Date,
// //     default: Date.now
// //   }
// // });

// // const medicalRecordSchema = new mongoose.Schema({
// //   patient: {
// //     type: mongoose.Schema.Types.ObjectId,
// //     ref: 'Patient',
// //     required: true
// //   },
// //   date: {
// //     type: Date,
// //     default: Date.now
// //   },
// //   diagnosis: {
// //     type: String,
// //     required: true
// //   },
// //   symptoms: [symptomSchema],
// //   notes: String,
// //   doctor: {
// //     type: mongoose.Schema.Types.ObjectId,
// //     ref: 'User'
// //   },
// //   visitType: {
// //     type: String,
// //     enum: ['routine', 'follow-up', 'emergency', 'other'],
// //     default: 'routine'
// //   },
// //   status: {
// //     type: String,
// //     enum: ['confirmed', 'suspected', 'ruled-out'],
// //     default: 'confirmed'
// //   },
// //   confidence: {
// //     type: String,
// //     enum: ['Low', 'Medium', 'High'],
// //     default: 'High'
// //   },
// //   code: String,
// //   evidence: [String],
// //   vitalSigns: {
// //     bloodPressure: String,
// //     heartRate: Number,
// //     temperature: Number,
// //     respiratoryRate: Number,
// //     oxygenSaturation: Number
// //   }
// // }, {
// //   timestamps: true
// // });

// // module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);


const mongoose = require('mongoose');

/* =========================
   Symptom Sub Schema
   ========================= */
const symptomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  severity: {
    type: String,
    enum: ['low', 'moderate', 'high'],
    default: 'moderate'
  },

  duration: String,
  description: String,
  onset: String,
  pattern: String,
  triggers: String,
  notes: String,

  status: {
    type: String,
    enum: ['active', 'resolved', 'monitoring'],
    default: 'active'
  },

  recordedAt: {
    type: Date,
    default: Date.now
  }
});

/* =========================
   Medical Record Schema
   ========================= */
const medicalRecordSchema = new mongoose.Schema(
  {
    // 🔗 Patient reference (ONLY here)
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
    },

    // 👨‍⚕️ Doctor reference
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    date: {
      type: Date,
      default: Date.now
    },

    diagnosis: {
      type: String,
      required: true,
      trim: true
    },

    symptoms: [symptomSchema],

    notes: {
      type: String
    },

    visitType: {
        type: String,
        enum: ['routine', 'emergency', 'symptom_record', 'follow-up', 'other'],
        set: v => v?.toLowerCase()
    },
    status: {
      type: String,
      enum: ['confirmed', 'suspected', 'ruled-out'],
      default: 'confirmed'
    },

    confidence: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'High'
    },

    code: {
      type: String
    },

    evidence: {
      type: [String],
      default: []
    },

    vitalSigns: {
      bloodPressure: String,
      heartRate: Number,
      temperature: Number,
      respiratoryRate: Number,
      oxygenSaturation: Number
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
