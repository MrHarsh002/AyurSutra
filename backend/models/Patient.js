// models/Patient.js
const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      unique: true,
      sparse: true,
    },

    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true
    },

    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true
    },

    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required']
    },
    
    age: Number,

    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: {
        values: ['Male', 'Female', 'Other', 'male', 'female', 'other'],
        message: 'Gender must be Male, Female, or Other'
      }
    },

    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },

    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown', 'unknown'],
      default: 'Unknown'
    },

    allergies: {
      type: [String],
      default: []
    },
    
    medicalHistory: {
      type: [String],
      default: []
    },
    
    currentMedications: {
      type: [String],
      default: []
    },

    emergencyContact: {
      name: String,
      relationship: String,
      phone: String
    },

    status: {
      type: String,
      enum: ['active', 'inactive', 'deceased'],
      default: 'active'
    },

    profilePhoto: String,

    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },

    occupation: String,

    maritalStatus: {
      type: String,
      enum: ['Single', 'Married', 'Divorced', 'Widowed', 'single', 'married', 'divorced', 'widowed']
    },

    registeredDate: {
      type: Date,
      default: Date.now
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    medicalRecords: [
      {
        type: Object
      }
    ]
  },
  {
    timestamps: true,
    toJSON: { 
      virtuals: true,
      transform: function(doc, ret) {
        // Capitalize gender and maritalStatus when sending to frontend
        if (ret.gender) {
          ret.gender = ret.gender.charAt(0).toUpperCase() + ret.gender.slice(1).toLowerCase();
        }
        if (ret.maritalStatus) {
          ret.maritalStatus = ret.maritalStatus.charAt(0).toUpperCase() + ret.maritalStatus.slice(1).toLowerCase();
        }
        return ret;
      }
    },
    toObject: { 
      virtuals: true,
      transform: function(doc, ret) {
        if (ret.gender) {
          ret.gender = ret.gender.charAt(0).toUpperCase() + ret.gender.slice(1).toLowerCase();
        }
        if (ret.maritalStatus) {
          ret.maritalStatus = ret.maritalStatus.charAt(0).toUpperCase() + ret.maritalStatus.slice(1).toLowerCase();
        }
        return ret;
      }
    }
  }
);

// ✅ Virtual full name
patientSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// ✅ Auto calculate age and normalize enums
patientSchema.pre('save', async function () {
  if (this.gender) {
    this.gender = this.gender.charAt(0).toUpperCase() + this.gender.slice(1).toLowerCase();
  }
  if (this.maritalStatus) {
    this.maritalStatus = this.maritalStatus.charAt(0).toUpperCase() + this.maritalStatus.slice(1).toLowerCase();
  }
  if (this.dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    this.age = age;
  }
});


module.exports = mongoose.model('Patient', patientSchema);