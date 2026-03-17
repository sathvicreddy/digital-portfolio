const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String },
  tech: [{ type: String }],
  image: { type: String },
  liveLink: { type: String },
  githubLink: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);
