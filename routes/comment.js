// comment.js
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  text: String,
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  commenter: {
    username: String,
    avatar: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);
