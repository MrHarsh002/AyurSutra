const express = require('express');
const router = express.Router();
const {
  getInvoices,
  getInvoice,
  createInvoice,
  updatePayment,
  deleteInvoice,
  generateInvoicePDF,
  getFinancialStats
} = require('../controllers/billingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getInvoices)
  .post(protect, createInvoice);

router.route('/stats/financial')
  .get(protect, getFinancialStats);

router.route('/:id')
  .get(protect, getInvoice)
  .delete(protect, authorize('admin'), deleteInvoice);

router.route('/:id/payment')
  .put(protect, updatePayment);

router.route('/:id/pdf')
  .get(protect, generateInvoicePDF);

module.exports = router;