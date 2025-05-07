const mongoose = require('mongoose');
const { Schema } = mongoose;

const customerSchema = new Schema({
  name: { type: String, required: true, unique: true },
  joinDate: { type: String, required: true },
  progress: String,
  account: String,
  deposits: [{ date: String, amount: Number }],
  withdraws: [{ date: String, amount: Number }],
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true }, 
}, {
  timestamps: true
});

module.exports = mongoose.model('Customer', customerSchema);
