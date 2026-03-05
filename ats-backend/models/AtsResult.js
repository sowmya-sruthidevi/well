const mongoose = require("mongoose");

const atsResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  // Store JD details
  jobTitle: String,
  jobCategory: String,   // e.g. Backend, Frontend, Data Science
  jobDescription: String,

  // Score breakdown
  overallScore: Number,
  skillScore: Number,
  experienceScore: Number,
  keywordScore: Number,

  matchedSkills: [String],
  missingSkills: [String],

  strengths: [String],
  improvementAreas: [String],

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("AtsResult", atsResultSchema);