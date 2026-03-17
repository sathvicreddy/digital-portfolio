const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');

// Models
const Project = require('../models/Project');
const Achievement = require('../models/Achievement');
const Certification = require('../models/Certification');
const Skill = require('../models/Skill');
const Training = require('../models/Training');
const Experience = require('../models/Experience');
const SocialPost = require('../models/SocialPost');
const Hero = require('../models/Hero');
const About = require('../models/About');
const models = {
  project: Project,
  achievement: Achievement,
  certification: Certification,
  skill: Skill,
  training: Training,
  experience: Experience,
  socialpost: SocialPost,
  hero: Hero,
  about: About
};

// Helper: validate MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Generic POST route for any model
// e.g. /api/admin/project
router.post('/:model', auth, async (req, res) => {
  try {
    const modelName = req.params.model.toLowerCase();
    const Model = models[modelName];

    if (!Model) return res.status(400).json({ msg: 'Invalid model type' });

    // Validate that request body is not empty
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ msg: 'Request body cannot be empty' });
    }

    const newRecord = new Model(req.body);
    const savedRecord = await newRecord.save();
    res.json(savedRecord);
  } catch (err) {
    console.error(`POST /${req.params.model} error:`, err.message);
    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ msg: 'Validation Error', errors: messages });
    }
    res.status(500).json({ msg: 'Server Error' });
  }
});

// Generic PUT route for any model
router.put('/:model/:id', auth, async (req, res) => {
  try {
    const modelName = req.params.model.toLowerCase();
    const Model = models[modelName];

    if (!Model) return res.status(400).json({ msg: 'Invalid model type' });

    // Validate ObjectId
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ msg: 'Invalid record ID format' });
    }

    const updatedRecord = await Model.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    if (!updatedRecord) {
      return res.status(404).json({ msg: `${modelName} not found` });
    }

    res.json(updatedRecord);
  } catch (err) {
    console.error(`PUT /${req.params.model}/${req.params.id} error:`, err.message);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ msg: 'Validation Error', errors: messages });
    }
    res.status(500).json({ msg: 'Server Error' });
  }
});

// Generic DELETE route for any model
router.delete('/:model/:id', auth, async (req, res) => {
  try {
    const modelName = req.params.model.toLowerCase();
    const Model = models[modelName];

    if (!Model) return res.status(400).json({ msg: 'Invalid model type' });

    // Validate ObjectId
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ msg: 'Invalid record ID format' });
    }

    const deletedRecord = await Model.findByIdAndDelete(req.params.id);

    if (!deletedRecord) {
      return res.status(404).json({ msg: `${modelName} not found` });
    }

    res.json({ msg: `${modelName} removed` });
  } catch (err) {
    console.error(`DELETE /${req.params.model}/${req.params.id} error:`, err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
