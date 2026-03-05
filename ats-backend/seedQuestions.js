require("dotenv").config();
const mongoose = require("mongoose");
const Question = require("./models/Questions");
const questions = require("./data/full_50_questions.json");

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Mongo Connected");

    await Question.deleteMany({});
    console.log("Old questions deleted");

    await Question.insertMany(questions);
    console.log("50 Questions inserted successfully");

    process.exit();
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

seed();