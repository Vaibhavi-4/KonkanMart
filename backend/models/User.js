const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['buyer', 'seller', 'admin'],
    required: true
  },
  status: {
  type: String,
  enum: ["pending", "approved", "rejected"],
  default: function () {
    return this.role === "seller" ? "pending" : "approved";
  }
},
  name: {
    type: String,
    required: true
  },
  businessName: {
    type: String,
    default: null
  },
  contactInfo: {
    type: String,
    default: null
  },
  paymentInfo: {
    type: String,
    default: null
  },
  resetToken: {type: String,
    default:null}
   ,
resetTokenExpiry: {type: Date,
  default: null},

  profilePhoto: {           // <-- add this
    type: String,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
