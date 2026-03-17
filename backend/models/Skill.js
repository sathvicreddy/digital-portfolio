const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String }, // e.g., 'Frontend', 'Backend', 'Tools'
  level: { type: Number }, // optional: percentage or 1-5 level
  icon: { type: String } // optional: FontAwesome class or image path
}, { timestamps: true });

module.exports = mongoose.model('Skill', SkillSchema);
