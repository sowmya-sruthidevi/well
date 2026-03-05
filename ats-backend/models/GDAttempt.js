const mongoose = require("mongoose");

const GDAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  sessionId: {
    type: String,
    required: true
  },
  topic: String,
  difficulty: String,
  
  // Speaking and Participation Metrics
  speakingTime: Number, // in seconds
  messageCount: Number,
  
  // Evaluation Scores
  scores: {
    communication: {
      type: Number,
      min: 0,
      max: 10
    },
    confidence: {
      type: Number,
      min: 0,
      max: 10
    },
    relevance: {
      type: Number,
      min: 0,
      max: 10
    },
    participation: {
      type: Number,
      min: 0,
      max: 10
    },
    criticalThinking: {
      type: Number,
      min: 0,
      max: 10
    }
  },
  
  overallScore: {
    type: Number,
    min: 0,
    max: 10
  },
  
  // Feedback
  improvements: [String],
  strengths: [String],
  aiAnalysis: String, // Detailed AI feedback
  
  // Session metadata
  duration: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("GDAttempt", GDAttemptSchema);