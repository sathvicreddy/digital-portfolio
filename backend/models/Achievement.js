const mongoose = require('mongoose');

const AchievementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, default: 'Achievement' },
  date: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Achievement', AchievementSchema);
