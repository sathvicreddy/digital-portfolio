const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const SocialPostSchema = new mongoose.Schema({
  authorName: { type: String, required: true },
  authorHeadline: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String }, // optional image path/URL
  likes: { type: Number, default: 0 },
  comments: [CommentSchema]
}, { timestamps: true });

module.exports = mongoose.model('SocialPost', SocialPostSchema);
