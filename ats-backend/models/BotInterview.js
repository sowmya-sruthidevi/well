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
  
  // Round information
  currentRound: {
    type: Number,
    default: 1,
    enum: [1, 2]
  },
  roundStatus: {
    type: Map,
    of: new mongoose.Schema({
      completed: {
        type: Boolean,
        default: false
      },
      startedAt: Date,
      completedAt: Date
    }, { _id: false }),
    default: new Map([
      ['round1', { completed: false }],
      ['round2', { completed: false }]
    ])
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
      feedback: String,
      category: String // 'general', 'technical-stack', 'technical-problem'
    }
  ],
  
  // Evaluation metrics per round
  scores: {
    round1: {
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
      },
      overall: {
        type: Number,
        min: 0,
        max: 10
      }
    },
    round2: {
      technicalDepth: {
        type: Number,
        min: 0,
        max: 10
      },
      stackKnowledge: {
        type: Number,
        min: 0,
        max: 10
      },
      architectureUnderstanding: {
        type: Number,
        min: 0,
        max: 10
      },
      bestPractices: {
        type: Number,
        min: 0,
        max: 10
      },
      problemSolving: {
        type: Number,
        min: 0,
        max: 10
      },
      overall: {
        type: Number,
        min: 0,
        max: 10
      }
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
