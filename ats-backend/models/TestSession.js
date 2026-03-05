const mongoose = require("mongoose");

const testSessionSchema = new mongoose.Schema({
  userId: String,
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
  answers: [
    {
      questionId: mongoose.Schema.Types.ObjectId,
      selectedAnswer: String
    }
  ],
  score: Number,
  startedAt: { type: Date, default: Date.now },
  expiresAt: Date,
  completed: { type: Boolean, default: false }
});

module.exports = mongoose.model("TestSession", testSessionSchema);