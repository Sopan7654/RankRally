const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String, required: true },
  pointsGained: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

const History = mongoose.model('History', historySchema);
module.exports = History;
