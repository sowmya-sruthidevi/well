const mongoose = require("mongoose");

const technicalProblemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "medium"
  },
  category: {
    type: String,
    required: true
  },
  starterCode: {
    type: Map,
    of: String, // { javascript: "function solve()...", python: "def solve()..." }
    required: true
  },
  testCases: [
    {
      input: String,
      expectedOutput: String,
      isHidden: { type: Boolean, default: false }
    }
  ],
  constraints: [String],
  hints: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("TechnicalProblem", technicalProblemSchema);
