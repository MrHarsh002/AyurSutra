// controllers/chatbotController.js
const asyncHandler = require("express-async-handler");
const Patient = require('../models/Patient');
const MedicalRecord = require('../models/MedicalRecord');
const Treatment = require('../models/Treatment');
const Doctor = require('../models/Doctor');
const Medicine = require('../models/Medicine'); // You might need to create this model
const mongoose = require('mongoose');
const natural = require('natural'); // For NLP - install: npm install natural

// Get symptom-based recommendations
exports.getSymptomAnalysis = asyncHandler(async (req, res) => {
  try {
    const { symptoms, language = 'English', patientId } = req.body;
    
    if (!symptoms || !symptoms.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Symptoms are required'
      });
    }

    // Convert symptoms to lowercase for matching
    const symptomsLower = symptoms.toLowerCase();
    
    // Extract patient history if patientId is provided
    let patientHistory = [];
    if (patientId) {
      const records = await MedicalRecord.find({ patient: patientId })
        .select('symptoms diagnosis date')
        .sort({ date: -1 })
        .limit(10);
      
      patientHistory = records.map(record => ({
        symptoms: record.symptoms?.map(s => s.name) || [],
        diagnosis: record.diagnosis,
        date: record.date
      }));
    }

    // Analyze symptoms using NLP (simple keyword matching)
    const symptomKeywords = {
      fever: ['fever', 'temperature', 'hot', 'burning'],
      headache: ['headache', 'migraine', 'head pain', 'cephalalgia'],
      cough: ['cough', 'coughing', 'cold', 'sneeze'],
      vomiting: ['vomit', 'nausea', 'sick', 'throw up'],
      allergy: ['allergy', 'itchy', 'rash', 'sneeze', 'watery eyes']
    };

    let detectedSymptoms = [];
    for (const [symptom, keywords] of Object.entries(symptomKeywords)) {
      if (keywords.some(keyword => symptomsLower.includes(keyword))) {
        detectedSymptoms.push(symptom);
      }
    }

    // Get medicines from database (create Medicine model if needed)
    const medicines = await Medicine.find({
      $or: detectedSymptoms.map(symptom => ({
        relatedSymptoms: symptom
      }))
    }).limit(5);

    // Get relevant doctors based on symptoms
    let doctorSpecializations = [];
    if (detectedSymptoms.includes('fever')) doctorSpecializations.push('general');
    if (detectedSymptoms.includes('headache')) doctorSpecializations.push('neurology');
    if (detectedSymptoms.includes('cough')) doctorSpecializations.push('pulmonology');
    if (detectedSymptoms.includes('vomiting')) doctorSpecializations.push('gastroenterology');
    if (detectedSymptoms.includes('allergy')) doctorSpecializations.push('allergy');

    const doctors = await Doctor.find({
      specialization: { $in: doctorSpecializations },
      isAvailable: true
    })
    .populate('user', 'name email phone avatar')
    .limit(3);

    // Prepare response based on language
    const responses = {
      English: {
        analysis: `Based on your symptoms "${symptoms}", I've detected: ${detectedSymptoms.join(', ')}`,
        advice: "Here are some recommendations:",
        disclaimer: "This is AI-powered advice. Please consult a doctor for proper diagnosis."
      },
      Hindi: {
        analysis: `आपके लक्षण "${symptoms}" के आधार पर, मैंने पाया: ${detectedSymptoms.join(', ')}`,
        advice: "यहां कुछ सुझाव हैं:",
        disclaimer: "यह एआई-संचालित सलाह है। उचित निदान के लिए कृपया डॉक्टर से परामर्श लें।"
      },
      Punjabi: {
        analysis: `ਤੁਹਾਡੇ ਲੱਛਣ "${symptoms}" ਦੇ ਆਧਾਰ 'ਤੇ, ਮੈਂ ਲੱਭਿਆ: ${detectedSymptoms.join(', ')}`,
        advice: "ਇੱਥੇ ਕੁਝ ਸੁਝਾਅ ਹਨ:",
        disclaimer: "ਇਹ ਏਆਈ-ਸੰਚਾਲਿਤ ਸਲਾਹ ਹੈ। ਠੀਕ ਨਿਦਾਨ ਲਈ ਕਿਰਪਾ ਕਰਕੇ ਡਾਕਟਰ ਨਾਲ ਸਲਾਹ ਕਰੋ।"
      }
    };

    res.json({
      success: true,
      language,
      detectedSymptoms,
      medicines: medicines.map(med => ({
        id: med._id,
        name: med.name,
        description: med.description,
        dosage: med.dosage,
        precautions: med.precautions,
        image: med.image || '💊',
        relatedSymptom: med.relatedSymptoms?.[0] || 'general'
      })),
      doctors: doctors.map(doc => ({
        id: doc._id,
        name: doc.user.name,
        specialization: doc.specialization.join(', '),
        department: doc.department,
        consultationFee: doc.consultationFee,
        availability: `${doc.workingHours?.start || '9AM'} - ${doc.workingHours?.end || '6PM'}`,
        isAvailable: doc.isAvailable
      })),
      response: responses[language] || responses.English,
      patientHistory: patientHistory.slice(0, 3)
    });

  } catch (error) {
    console.error('Chatbot analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Error analyzing symptoms'
    });
  }
});

// Get medicine details
exports.getMedicineDetails = asyncHandler(async (req, res) => {
  try {
    const { medicineId } = req.params;
    const { language = 'English' } = req.query;

    const medicine = await Medicine.findById(medicineId);
    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }

    // Get related doctors
    const doctors = await Doctor.find({
      specialization: { $in: medicine.recommendedForSpecialties || ['general'] },
      isAvailable: true
    })
    .populate('user', 'name email phone avatar')
    .limit(2);

    // Translate based on language
    const translations = {
      English: {
        activeIngredient: medicine.activeIngredient,
        dosage: medicine.dosage,
        precautions: medicine.precautions,
        sideEffects: medicine.sideEffects,
        storage: medicine.storageInstructions
      },
      Hindi: {
        activeIngredient: medicine.hindi?.activeIngredient || medicine.activeIngredient,
        dosage: medicine.hindi?.dosage || medicine.dosage,
        precautions: medicine.hindi?.precautions || medicine.precautions,
        sideEffects: medicine.hindi?.sideEffects || medicine.sideEffects,
        storage: medicine.hindi?.storage || medicine.storageInstructions
      },
      Punjabi: {
        activeIngredient: medicine.punjabi?.activeIngredient || medicine.activeIngredient,
        dosage: medicine.punjabi?.dosage || medicine.dosage,
        precautions: medicine.punjabi?.precautions || medicine.precautions,
        sideEffects: medicine.punjabi?.sideEffects || medicine.sideEffects,
        storage: medicine.punjabi?.storage || medicine.storageInstructions
      }
    };

    res.json({
      success: true,
      medicine: {
        id: medicine._id,
        name: medicine.name,
        description: medicine.description,
        image: medicine.image || '💊',
        ...translations[language] || translations.English,
        relatedSymptom: medicine.relatedSymptoms?.[0] || 'general'
      },
      doctors: doctors.map(doc => ({
        id: doc._id,
        name: doc.user.name,
        specialization: doc.specialization.join(', '),
        contact: doc.user.phone,
        fee: doc.consultationFee,
        availability: `${doc.workingHours?.start || '9AM'} - ${doc.workingHours?.end || '6PM'}`
      }))
    });

  } catch (error) {
    console.error('Medicine details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching medicine details'
    });
  }
});

// Get quick questions based on patient history
exports.getQuickQuestions = asyncHandler(async (req, res) => {
  try {
    const { patientId, language = 'English' } = req.query;

    let commonQuestions = {
      English: [
        "Mk chuahan",
        "Nausea and vomiting", 
        "Persistent cough",
        "Migraine pain",
        "High temperature",
        "Body ache and fatigue",
        "Sore throat",
        "Difficulty breathing",
        "Stomach pain",
        "Skin rash"
      ],
      Hindi: [
        "बुखार के साथ सिरदर्द",
        "मतली और उल्टी",
        "लगातार खांसी",
        "माइग्रेन दर्द",
        "तेज बुखार",
        "शरीर में दर्द और थकान",
        "गला खराब",
        "सांस लेने में तकलीफ",
        "पेट दर्द",
        "त्वचा पर चकत्ते"
      ],
      Punjabi: [
        "ਬੁਖਾਰ ਦੇ ਨਾਲ ਸਿਰਦਰਦ",
        "ਮਤਲੀ ਅਤੇ ਉਲਟੀ",
        "ਲਗਾਤਾਰ ਖਾਂਸੀ",
        "ਮਾਈਗ੍ਰੇਨ ਦਰਦ",
        "ਤੇਜ਼ ਬੁਖਾਰ",
        "ਸਰੀਰ ਦਰਦ ਅਤੇ ਥਕਾਵਟ",
        "ਗਲਾ ਖਰਾਬ",
        "ਸਾਹ ਲੈਣ ਵਿੱਚ ਤਕਲੀਫ",
        "ਪੇਟ ਦਰਦ",
        "ਚਮੜੀ 'ਤੇ ਧੱਬੇ"
      ]
    };

    // If patient has history, add personalized questions
    let personalizedQuestions = [];
    if (patientId) {
      const recentRecords = await MedicalRecord.find({ patient: patientId })
        .sort({ date: -1 })
        .limit(3);
      
      if (recentRecords.length > 0) {
        const lastDiagnosis = recentRecords[0].diagnosis;
        personalizedQuestions = [
          `Follow-up for ${lastDiagnosis}`,
          `Complications from ${lastDiagnosis}`,
          `Side effects of treatment for ${lastDiagnosis}`
        ];
      }
    }

    const questions = [
      ...(personalizedQuestions.length > 0 ? personalizedQuestions : []),
      ...commonQuestions[language] || commonQuestions.English
    ].slice(0, 10); // Limit to 10 questions

    res.json({
      success: true,
      questions,
      language,
      hasHistory: personalizedQuestions.length > 0
    });

  } catch (error) {
    console.error('Quick questions error:', error);
    res.status(500).json({
      success: false,
      questions: [],
      language: 'English'
    });
  }
});