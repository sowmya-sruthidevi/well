const mongoose = require("mongoose");

const technicalSessionSchema = new mongoose.Schema({
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
  language: {
    type: String,
    enum: ["javascript", "python", "java", "cpp"],
    default: "javascript"
  },
  code: {
    type: String,
    default: ""
  },
  submissions: [
    {
      code: String,
      language: String,
      timestamp: { type: Date, default: Date.now },
      testResults: [
        {
          passed: Boolean,
          input: String,
          expectedOutput: String,
          actualOutput: String,
          executionTime: Number,
          error: String
        }
      ],
      score: Number
    }
  ],
  startedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  finalScore: Number
});

module.exports = mongoose.model("TechnicalSession", technicalSessionSchema);
