const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: { type: [String], required: true },
  correctAnswer: { type: String, required: true },
  category: { type: String, required: true },
  difficulty: { type: String, required: true },
  topic: { type: String, required: true },
  explanation: { type: String, required: true }
});

module.exports = mongoose.model("Question", questionSchema);