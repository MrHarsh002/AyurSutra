// routes/metaRoutes.js
const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');

// ✅ Departments (MATCHES doctor specialization options)
const departments = [ 
  'general', 'panchakarma', 'kayachikitsa','shalya', 
  'shalakya', 'prasuti', 'kaumarabhritya', 'swasthavritta'
 ];

const daysOfWeek = [ 'monday', 'tuesday', 'wednesday', 'thursday',
   'friday', 'saturday', 'sunday' 
  ];

// ✅ Therapy categories (MATCHES schema enum)
const therapyCategories = [ 'panchakarma', 'swedana', 'basti', 'nasya',
   'virechana', 'rakta-mokshana', 'others' 
  ];

// GET /api/appointment/meta
const appointmentStatus =['scheduled', 'confirmed', 'checked-in', 'in-progress',
   'completed', 'cancelled', 'no-show'
  ];

//Billing module meta
const paymentStatus = ['pending', 'partial', 'paid', 'overdue', 'cancelled'];
const paymentMethods = ['cash', 'card', 'upi', 'cheque', 'insurance', 'online'];

//Inventory module meta can be added similarly
const inventoryCategories = ['medicine', 'herb', 'oil', 'equipment', 'other'];
const inventoryUnits = ['kg', 'g', 'mg', 'l', 'ml', 'pieces', 'packets', 'boxes'];

//Get/api/ medical/meta

const symptomStatus=['active', 'resolved', 'monitoring'];
const symptomseverity=['low', 'moderate', 'high'];

//Get/api/Patient/meta
const maritalStatusOptions = ['single', 'married', 'divorced', 'widowed'];
const patientStatusOptions = ['active', 'inactive', 'deceased'];

// GET /api/Report/meta
const reportTypes = ['financial', 'patient', 'doctor', 'therapy', 'inventory', 'appointment', 'custom'];
const reportFrequencies = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'];
const chartTypes = ['bar', 'line', 'pie', 'table'];
const typeStatus= ['generated', 'processing', 'failed', 'sent'];

// GET /api/Treatment/meta
const prakritiTypes = ['vata', 'pitta', 'kapha', 'vata-pitta', 'vata-kapha', 'pitta-kapha', 'sama'];
const treatmentStatus = ['ongoing', 'completed', 'cancelled', 'follow-up'];
const treatmentFrequency = ['once daily', 'twice daily', 'thrice daily', 'as needed'];
const treatmentDurations = ['1 week', '2 weeks', '1 month', '3 months', '6 months', 'custom'];  
const treatmentDosages = ['250mg', '500mg', '1g', '5ml', '10ml'];
const treatmentInstructions = [ 'before meals', 'after meals', 'with warm water', 'with milk', 'at bedtime' ];


// GET /api/meta/USER/ ROle

const roleTypes=['admin', 'doctor', 'therapist', 'patient'];
router.get('/meta',
  asyncHandler(async (req, res) => {
    res.json({
      success: true,
      roleTypes,

      appointmentStatus,

      symptomStatus,
      symptomseverity,
      
      paymentStatus,
      paymentMethods,

      departments,
      daysOfWeek,


      maritalStatusOptions,
      patientStatusOptions,

      reportTypes,  
      reportFrequencies,
      chartTypes,
      typeStatus,

    //Treatments....
      prakritiTypes,
      treatmentStatus,
      treatmentFrequency,
      treatmentDosages,
      treatmentDurations,
      treatmentInstructions,

    //Inventory...
      inventoryCategories,
      inventoryUnits,
      therapyCategories,
    });
  })
);

module.exports = router;
