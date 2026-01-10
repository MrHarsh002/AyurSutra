// routes/chatbotRoutes.js
const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const { protect } = require('../middleware/authMiddleware');

router.post('/analyze-symptoms', protect, chatbotController.getSymptomAnalysis);
router.get('/medicine/:medicineId', protect, chatbotController.getMedicineDetails);
router.get('/quick-questions', protect, chatbotController.getQuickQuestions);

module.exports = router;