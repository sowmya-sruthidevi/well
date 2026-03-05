const express = require("express");
const router = express.Router();

const botInterviewController = require("../controllers/botInterviewController");
const authMiddleware = require("../middleware/auth");

// All routes require authentication
router.post("/start", authMiddleware, botInterviewController.startInterview);
router.post("/submit-answer", authMiddleware, botInterviewController.submitAnswer);
router.post("/finish", authMiddleware, botInterviewController.finishInterview);
router.get("/session/:sessionId", authMiddleware, botInterviewController.getSession);

module.exports = router;
