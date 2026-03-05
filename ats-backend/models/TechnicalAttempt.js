const mongoose = require("mongoose");

const technicalAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TechnicalProblem",
    required: true
  },
  problemTitle: String,
  language: String,
  finalCode: String,
  score: Number,
  testsPassed: Number,
  totalTests: Number,
  executionTime: Number,
  feedback: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("TechnicalAttempt", technicalAttemptSchema);
