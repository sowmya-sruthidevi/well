const mongoose = require("mongoose");

const BotInterviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  sessionId: {
    type: String,
    unique: true
  },
  
  // Interview structure
  questions: [
    {
      questionId: mongoose.Schema.Types.ObjectId,
      question: String,
      userAnswer: String,
      answerQuality: {
        type: Number,
        min: 0,
        max: 10
      },
      feedback: String
    }
  ],
  
  // Evaluation metrics
  scores: {
    communicationSkills: {
      type: Number,
      min: 0,
      max: 10
    },
    problemSolving: {
      type: Number,
      min: 0,
      max: 10
    },
    leadershipPotential: {
      type: Number,
      min: 0,
      max: 10
    },
    cultureFit: {
      type: Number,
      min: 0,
      max: 10
    },
    technicalKnowledge: {
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
  strengths: [String],
  improvements: [String],
  aiAnalysis: String,
  recommendation: String, // "Strong Fit", "Good Fit", "Average", "Needs Improvement"
  
  // Interview metadata
  duration: Number, // in seconds
  totalQuestions: Number,
  answeredQuestions: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("BotInterview", BotInterviewSchema);
