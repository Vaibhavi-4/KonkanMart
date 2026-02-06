const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
   image: { type: String, default: null }
}, {
  timestamps: true
});

// Prevent same seller from adding same product twice
productSchema.index({ sellerId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Product', productSchema);
