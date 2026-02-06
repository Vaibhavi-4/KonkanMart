const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  name: String,
  price: Number,
  quantity: Number
});

const orderSchema = new mongoose.Schema({
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  deliveryAddress: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentProof:{type: String,
},
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed','Pending Verification'],
    default: 'pending'
  },
  paymentMode: {
  type: String,
  enum: ['ONLINE', 'COD'], // Online or Cash on Delivery
  default: 'ONLINE'
},

  estimatedShipDate: {
  type: Date,
  default: null
},
    courierAgency: {
    type: String,
    default: null
  },
  partnerNumber: {
    type: String,
    default: null
  },
  trackingId: {
    type: String,
    default: null
  }

}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
