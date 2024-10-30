const mongoose = require('mongoose');

const tempUserSchema = new mongoose.Schema({
  userName: String,
  email: { type: String, required: true, unique: true },
  password: String,
  otp: String,
  otpExpiresAt: Date,
});

const TempUser = mongoose.model('TempUser', tempUserSchema);

module.exports = TempUser;