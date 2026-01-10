const Billing = require('../models/Billing');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const asyncHandler = require('express-async-handler');
const PDFDocument = require('pdfkit');
const moment = require('moment');
const {generateBillingId} = require('../utils/generatePatientId');

// @desc    Get all invoices
// @route   GET /api/billing
// @access  Private
const getInvoices = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search,
    paymentStatus,
    startDate,
    endDate,
    patientId
  } = req.query;

  const query = {};

  if (search) {
    query.$or = [
      { invoiceId: { $regex: search, $options: 'i' } },
      { 'patient.name': { $regex: search, $options: 'i' } }
    ];
  }

  if (paymentStatus) query.paymentStatus = paymentStatus;
  if (patientId) query.patient = patientId;

  if (startDate && endDate) {
    query.billDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const invoices = await Billing.find(query)
    .populate('patient', 'fullName patientId phone')
    .populate('appointment', 'date time')
    .populate('createdBy', 'name')
    .sort('-billDate')
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Billing.countDocuments(query);

  res.json({
    success: true,
    count: invoices.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    invoices
  });
});

// @desc    Get single invoice
// @route   GET /api/billing/:id
// @access  Private
const getInvoice = asyncHandler(async (req, res) => {
  const invoice = await Billing.findById(req.params.id)
    .populate('patient', 'fullName patientId phone email address')
    .populate('appointment', 'date time type')
    .populate('createdBy', 'name');

  if (!invoice) {
    res.status(404);
    throw new Error('Invoice not found');
  }

  res.json({
    success: true,
    invoice
  });
});

// @desc    Create invoice
// @route   POST /api/billing
// @access  Private
const createInvoice = asyncHandler(async (req, res) => {
  const {
    patient,
    appointment,
    items,
    subtotal,
    tax,
    discount,
    totalAmount,
    paymentMethod,
    insurance,
    notes,
    dueDate
  } = req.body;

  // Validate patient
  const patientExists = await Patient.findById(patient);
  if (!patientExists) {
    res.status(404);
    throw new Error('Patient not found');
  }

  // Validate appointment if provided
  if (appointment) {
    const appointmentExists = await Appointment.findById(appointment);
    if (!appointmentExists) {
      res.status(404);
      throw new Error('Appointment not found');
    }
  }

  // Calculate totals if not provided
  const calculatedSubtotal = subtotal || items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const calculatedTax = tax || calculatedSubtotal * 0.18; // 18% GST
  const calculatedTotal = totalAmount || calculatedSubtotal + calculatedTax - (discount || 0);

  const invoiceId = await  generateBillingId();
  const invoice = await Billing.create({
    invoiceId,
    patient,
    appointment,
    items,
    subtotal: calculatedSubtotal,
    tax: calculatedTax,
    discount: discount || 0,
    totalAmount: calculatedTotal,
    paidAmount: 0,
    balanceAmount: calculatedTotal,
    paymentMethod: paymentMethod || 'cash',
    paymentStatus: 'pending',
    insurance,
    notes,
    dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days default
    createdBy: req.user._id
  });

  // Update patient's billing history
  await Patient.findByIdAndUpdate(patient, {
    $push: {
      billingHistory: {
        invoice: invoice._id,
        amount: calculatedTotal,
        date: new Date()
      }
    }
  });

  res.status(201).json({
    success: true,
    message: 'Invoice created successfully',
    invoice
  });
});

// @desc    Update payment
// @route   PUT /api/billing/:id/payment
// @access  Private
const updatePayment = asyncHandler(async (req, res) => {
  const { amount, method, reference, notes } = req.body;

  const invoice = await Billing.findById(req.params.id);
  if (!invoice) {
    res.status(404);
    throw new Error('Invoice not found');
  }

  // Add payment transaction
  const paymentTransaction = {
    date: new Date(),
    amount: parseFloat(amount),
    method: method || 'cash',
    reference,
    notes
  };

  invoice.paymentTransactions.push(paymentTransaction);
  invoice.paidAmount += parseFloat(amount);
  invoice.balanceAmount = invoice.totalAmount - invoice.paidAmount;

  // Update payment status
  if (invoice.balanceAmount <= 0) {
    invoice.paymentStatus = 'paid';
  } else if (invoice.paidAmount > 0) {
    invoice.paymentStatus = 'partial';
  }

  if (new Date() > invoice.dueDate && invoice.balanceAmount > 0) {
    invoice.paymentStatus = 'overdue';
  }

  await invoice.save();

  res.json({
    success: true,
    message: 'Payment updated successfully',
    invoice
  });
});

// @desc    Delete invoice
// @route   DELETE /api/billing/:id
// @access  Private/Admin
const deleteInvoice = asyncHandler(async (req, res) => {
  const invoice = await Billing.findById(req.params.id);

  if (!invoice) {
    res.status(404);
    throw new Error('Invoice not found');
  }

  // Only allow deletion if no payments made
  if (invoice.paidAmount > 0) {
    res.status(400);
    throw new Error('Cannot delete invoice with payments');
  }

  await invoice.deleteOne();

  res.json({
    success: true,
    message: 'Invoice deleted successfully'
  });
});

// @desc    Generate invoice PDF
// @route   GET /api/billing/:id/pdf
// @access  Private
const generateInvoicePDF = asyncHandler(async (req, res) => {
  const invoice = await Billing.findById(req.params.id)
    .populate('patient', 'fullName patientId phone address')
    .populate('createdBy', 'name');

  if (!invoice) {
    res.status(404);
    throw new Error('Invoice not found');
  }

  const doc = new PDFDocument({ margin: 50 });
  
  // Set response headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceId}.pdf`);

  doc.pipe(res);

  // Header
  doc.fontSize(20).text('AyurSutra Ayurvedic Clinic', { align: 'center' });
  doc.fontSize(12).text('Invoice', { align: 'center' });
  doc.moveDown();

  // Clinic Info
  doc.fontSize(10)
    .text('Address: 123 Ayurveda Street, Healing City, HC 123456')
    .text('Phone: +91-9876543210 | Email: info@ayursutra.com')
    .text('GSTIN: 27ABCDE1234F1Z5')
    .moveDown();

  // Invoice Details
  doc.fontSize(12)
    .text(`Invoice ID: ${invoice.invoiceId}`)
    .text(`Date: ${moment(invoice.billDate).format('DD/MM/YYYY')}`)
    .text(`Due Date: ${moment(invoice.dueDate).format('DD/MM/YYYY')}`)
    .moveDown();

  // Patient Details
  doc.fontSize(12).text('Bill To:', { underline: true });
  doc.fontSize(10)
    .text(`Name: ${invoice.patient.fullName}`)
    .text(`Patient ID: ${invoice.patient.patientId}`)
    .text(`Phone: ${invoice.patient.phone}`)
    .text(`Address: ${invoice.patient.address || 'N/A'}`)
    .moveDown();

  // Items Table
  const tableTop = doc.y;
  const itemCodeX = 50;
  const descriptionX = 150;
  const quantityX = 350;
  const priceX = 400;
  const amountX = 500;

  // Table Header
  doc.fontSize(10)
    .text('Item', itemCodeX, tableTop)
    .text('Description', descriptionX, tableTop)
    .text('Qty', quantityX, tableTop)
    .text('Price', priceX, tableTop)
    .text('Amount', amountX, tableTop);

  doc.moveTo(50, tableTop + 15)
    .lineTo(550, tableTop + 15)
    .stroke();

  // Table Rows
  let y = tableTop + 25;
  invoice.items.forEach((item, index) => {
    doc.fontSize(9)
      .text(`ITEM${index + 1}`, itemCodeX, y)
      .text(item.description || 'Service', descriptionX, y)
      .text(item.quantity.toString(), quantityX, y)
      .text(`₹${item.unitPrice.toFixed(2)}`, priceX, y)
      .text(`₹${item.amount.toFixed(2)}`, amountX, y);
    y += 20;
  });

  // Summary
  doc.moveDown(2);
  doc.fontSize(10)
    .text(`Subtotal: ₹${invoice.subtotal.toFixed(2)}`, { align: 'right' })
    .text(`Tax (18%): ₹${invoice.tax.toFixed(2)}`, { align: 'right' })
    .text(`Discount: ₹${invoice.discount.toFixed(2)}`, { align: 'right' })
    .text(`Total: ₹${invoice.totalAmount.toFixed(2)}`, { align: 'right', underline: true })
    .text(`Paid: ₹${invoice.paidAmount.toFixed(2)}`, { align: 'right' })
    .text(`Balance: ₹${invoice.balanceAmount.toFixed(2)}`, { align: 'right' });

  // Payment Status
  doc.moveDown();
  doc.fontSize(12).text(`Payment Status: ${invoice.paymentStatus.toUpperCase()}`, { align: 'right' });

  // Footer
  doc.moveDown(3);
  doc.fontSize(8)
    .text('Thank you for choosing AyurSutra Ayurvedic Clinic', { align: 'center' })
    .text('This is a computer generated invoice, no signature required.', { align: 'center' });

  doc.end();
});

// @desc    Get billing statistics
// @route   GET /api/billing/stats/financial
// @access  Private
const getFinancialStats = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  const dateFilter = {};
  if (startDate && endDate) {
    dateFilter.billDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  } else {
    // Default to current month
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
    dateFilter.billDate = { $gte: startOfMonth, $lte: endOfMonth };
  }

  // Total revenue
  const totalRevenue = await Billing.aggregate([
    { $match: dateFilter },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ]);

  // Collected revenue
  const collectedRevenue = await Billing.aggregate([
    { $match: { ...dateFilter, paymentStatus: 'paid' } },
    { $group: { _id: null, total: { $sum: '$paidAmount' } } }
  ]);

  // Pending payments
  const pendingPayments = await Billing.aggregate([
    { $match: { ...dateFilter, paymentStatus: { $in: ['pending', 'partial'] } } },
    { $group: { _id: null, total: { $sum: '$balanceAmount' } } }
  ]);

  // Monthly trend
  const monthlyTrend = await Billing.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$billDate" } },
        revenue: { $sum: '$totalAmount' },
        collected: { $sum: '$paidAmount' }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Payment method distribution
  const paymentMethods = await Billing.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: '$paymentMethod',
        count: { $sum: 1 },
        amount: { $sum: '$paidAmount' }
      }
    }
  ]);

  // Top patients by spending
  const topPatients = await Billing.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: '$patient',
        totalSpent: { $sum: '$totalAmount' },
        invoices: { $sum: 1 }
      }
    },
    { $sort: { totalSpent: -1 } },
    { $limit: 10 }
  ]);

  // Populate patient names
  const patientIds = topPatients.map(p => p._id);
  const patients = await Patient.find({ _id: { $in: patientIds } }, 'fullName patientId');

  const formattedTopPatients = topPatients.map(stat => {
    const patient = patients.find(p => p._id.toString() === stat._id.toString());
    return {
      patient: patient ? patient.fullName : 'Unknown',
      patientId: patient ? patient.patientId : 'N/A',
      totalSpent: stat.totalSpent,
      invoices: stat.invoices
    };
  });

  res.json({
    success: true,
    stats: {
      totalRevenue: totalRevenue[0]?.total || 0,
      collectedRevenue: collectedRevenue[0]?.total || 0,
      pendingPayments: pendingPayments[0]?.total || 0,
      monthlyTrend,
      paymentMethods,
      topPatients: formattedTopPatients
    }
  });
});

module.exports = {
  getInvoices,
  getInvoice,
  createInvoice,
  updatePayment,
  deleteInvoice,
  generateInvoicePDF,
  getFinancialStats
};