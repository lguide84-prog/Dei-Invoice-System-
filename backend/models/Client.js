const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  businessName: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true
  },
  contactPerson: {
    type: String,
    trim: true
  },
  phoneMobile: {
    type: String,
    required: [true, 'Phone number is required']
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  orderNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  orderDate: {
    type: Date
  },
  salesManagerName: {
    type: String,
    trim: true
  },
  subscriptionService: {
    type: String,
    trim: true
  },
  // NEW FIELD: Total Amount (original order amount)
  totalAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalDue: {
    type: Number,
    default: 0,
    min: 0
  },
  totalPaid: {
    type: Number,
    default: 0
  },
  lastPaymentDate: {
    type: Date
  },
  lastPaymentAmount: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['Paid', 'Pending', 'Overdue', 'Partial'],
    default: 'Pending'
  },
  notes: {
    type: String
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  }
}, {
  timestamps: true
});

// Pre-save middleware to auto-update payment status
clientSchema.pre('save', function(next) {
  // Auto-update status based on due amount
  if (this.totalDue <= 0) {
    this.paymentStatus = 'Paid';
  } else if (this.totalDue < this.totalAmount) {
    this.paymentStatus = 'Partial';
  } else if (this.totalDue >= this.totalAmount && this.totalAmount > 0) {
    this.paymentStatus = 'Pending';
  }
  
  // Check for overdue (you can customize this logic)
  if (this.totalDue > 0 && this.orderDate) {
    const daysSinceOrder = Math.floor((Date.now() - this.orderDate) / (1000 * 60 * 60 * 24));
    if (daysSinceOrder > 30) { // 30 days overdue
      this.paymentStatus = 'Overdue';
    }
  }
  
  next();
});

// Create indexes for better search performance
clientSchema.index({ businessName: 'text', contactPerson: 'text', phoneMobile: 'text', orderNumber: 'text' });
clientSchema.index({ paymentStatus: 1 });
clientSchema.index({ totalDue: -1 });

module.exports = mongoose.model('Client', clientSchema);