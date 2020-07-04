const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  user: String,
  title: String,
  text: String,
  timestamp: { type: Date, default: Date.now},
  updated: {type: Date, default: Date.now}
});

module.exports = mongoose.model("post", PostSchema);