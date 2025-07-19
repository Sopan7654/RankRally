const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  points: { type: Number, default: 0 },
  img: { type: String, required: true },
  // REMOVED: The lastClaimedAt field is no longer needed.
});

const User = mongoose.model('User', userSchema);
module.exports = User;