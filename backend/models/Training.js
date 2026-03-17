const mongoose = require('mongoose');

const TrainingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  organization: { type: String, required: true },
  description: { type: String },
  date: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Training', TrainingSchema);
