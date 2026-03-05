const express = require("express");
const router = express.Router();
const Question = require("../models/Questions");
const TestSession = require("../models/TestSession");
const authMiddleware = require("../middleware/auth");
const Attempt = require("../models/Attempt");

// ==============================
// GET RANDOM QUESTIONS
// ==============================
router.get("/random", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const questions = await Question.aggregate([
      { $sample: { size: limit } },
      { $project: { correctAnswer: 0, explanation: 0 } }
    ]);

    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==============================
// START TEST
// ==============================
router.post("/start-test", authMiddleware, async (req, res) => {
  try {
    const durationMinutes = 10;

    const medium = await Question.aggregate([
      { $match: { difficulty: "medium" } },
      { $sample: { size: 6 } }
    ]);

    const hard = await Question.aggregate([
      { $match: { difficulty: "hard" } },
      { $sample: { size: 4 } }
    ]);

    const questions = [...medium, ...hard].sort(
      () => Math.random() - 0.5
    );

    if (questions.length < 10) {
      return res.status(400).json({ error: "Not enough questions in DB" });
    }

    const session = await TestSession.create({
      userId: req.user.id,
      questions: questions.map(q => q._id),
      expiresAt: new Date(Date.now() + durationMinutes * 60000)
    });

    const filteredQuestions = questions.map(q => ({
      _id: q._id,
      question: q.question,
      options: q.options
    }));

    res.json({
      sessionId: session._id,
      duration: durationMinutes * 60,
      questions: filteredQuestions
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==============================
// SUBMIT TEST
// ==============================
router.post("/submit-test", authMiddleware, async (req, res) => {
  try {
    console.log("📥 Submit test request received");
    console.log("   User:", req.user);
    console.log("   Body:", req.body);
    
    const { sessionId, answers } = req.body;

    if (!sessionId || !answers) {
      console.log("❌ Missing required fields");
      return res.status(400).json({ error: "Missing sessionId or answers" });
    }

    console.log("🔍 Finding session:", sessionId);
    const session = await TestSession
      .findById(sessionId)
      .populate("questions");

    if (!session) {
      console.log("❌ Session not found");
      return res.status(404).json({ error: "Session not found" });
    }

    console.log("✅ Session found:", session._id);

    if (session.completed) {
      console.log("⚠️ Test already submitted");
      return res.status(400).json({ error: "Test already submitted" });
    }

    if (new Date() > session.expiresAt) {
      console.log("⏰ Time expired");
      return res.status(400).json({ error: "Time expired" });
    }

    let score = 0;
    let detailedResults = [];

    console.log("📊 Processing answers...");
    answers.forEach(ans => {
      const question = session.questions.find(
        q => q._id.toString() === ans.questionId
      );

      if (question) {
        const isCorrect =
          question.correctAnswer === ans.selectedAnswer;

        if (isCorrect) score++;

        detailedResults.push({
          questionId: question._id,
          question: question.question,
          selectedAnswer: ans.selectedAnswer,
          correctAnswer: question.correctAnswer,
          isCorrect
        });
      }
    });

    console.log("📈 Score calculated:", score, "/", session.questions.length);

    session.score = score;
    session.completed = true;
    session.answers = answers;

    await session.save();
    console.log("✅ Session saved");

    const attemptUserId = req.user?.id || session.userId;

    console.log("💾 Saving Aptitude Attempt - userId:", attemptUserId, "score:", score);

    await Attempt.create({
      userId: attemptUserId,
      roundType: "aptitude",
      score,
      evaluation: {
        totalQuestions: session.questions.length,
        accuracy: (score / session.questions.length) * 100,
        detailedResults: detailedResults
      }
    });

    console.log("✅ Aptitude Result saved - userId:", attemptUserId);

    let feedback = "";

    if (score <= 3) {
      feedback = "Your fundamentals are weak. Focus on core concepts and practice daily.";
    } else if (score <= 7) {
      feedback = "You have moderate understanding. Improve speed and accuracy.";
    } else {
      feedback = "Strong performance. Work on advanced-level problems.";
    }

    console.log("📤 Sending response with", detailedResults.length, "results");

    res.json({
      message: "Test submitted successfully",
      score,
      totalQuestions: session.questions.length,
      results: detailedResults,
      feedback
    });

  } catch (err) {
    console.error("❌ Submit test error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ==============================
// GET USER TEST RESULTS
// ==============================
router.get("/results", authMiddleware, async (req, res) => {
  try {
    const sessions = await TestSession.find({
      userId: req.user.id,
      completed: true
    }).sort({ createdAt: -1 });

    res.json(sessions);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;