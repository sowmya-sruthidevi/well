const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true,
    unique: true
  },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "medium"
  },
  duration: {
    type: Number,
    default: 5 // in minutes
  },
  context: String,
  suggestedKeyPoints: [String],
  category: {
    type: String,
    default: "general"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("GDTopic", topicSchema);