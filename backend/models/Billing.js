  const mongoose = require('mongoose');

  const billingSchema = new mongoose.Schema({
    invoiceId: {
      type: String,
      required: true,
      unique: true
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment'
    },
    billDate: {
      type: Date,
      default: Date.now
    },
    dueDate: {
      type: Date,
      required: true
    },
    items: [{
      description: String,
      quantity: Number,
      unitPrice: Number,
      amount: Number
    }],
    subtotal: {
      type: Number,
      required: true
    },
    tax: {
      type: Number,
      default: 0
    },
    discount: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true
    },
    paidAmount: {
      type: Number,
      default: 0
    },
    balanceAmount: {
      type: Number,
      required: true
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'upi', 'cheque', 'insurance', 'online'],
      default: 'cash'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'overdue', 'cancelled'],
      default: 'pending'
    },
    paymentTransactions: [{
      date: Date,
      amount: Number,
      method: String,
      reference: String,
      notes: String
    }],
    insurance: {
      provider: String,
      policyNumber: String,
      coveredAmount: Number,
      claimStatus: String
    },
    notes: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }, {
    timestamps: true
  });

  // Generate invoice ID
  billingSchema.pre('save', async function() {
    // Generate invoiceId if not present
    if (!this.invoiceId) {
      const year = new Date().getFullYear();
      const month = String(new Date().getMonth() + 1).padStart(2, '0');

      const count = await mongoose.model('Billing').countDocuments({
        billDate: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
        }
      });

      this.invoiceId = `INV${year}${month}${String(count + 1).padStart(4, '0')}`;
    }

    // Calculate balance
    this.balanceAmount = this.totalAmount - this.paidAmount;

    // No next() needed for async function
  });


  module.exports = mongoose.model('Billing', billingSchema);