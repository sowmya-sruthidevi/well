const mongoose = require("mongoose");

const InterviewQuestionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    enum: ["behavioral", "technical", "problem-solving", "leadership", "culture"],
    default: "behavioral"
  },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "medium"
  },
  evaluationCriteria: [String],
  suggestedAnswerKeyPoints: [String],
  followUpPrompt: String, // Optional follow-up question
  timeLimit: {
    type: Number,
    default: 120 // seconds
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("InterviewQuestion", InterviewQuestionSchema);
