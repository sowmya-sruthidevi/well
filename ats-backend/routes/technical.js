const express = require("express");
const router = express.Router();
const technicalController = require("../controllers/technicalController");
const authMiddleware = require("../middleware/auth");

// Start technical round
router.post("/start", authMiddleware, technicalController.startTechnical);

// Run code (not for submission, just testing)
router.post("/run", authMiddleware, technicalController.runCode);

// Submit code for evaluation
router.post("/submit", authMiddleware, technicalController.submitCode);

// Get session
router.get("/session/:sessionId", authMiddleware, technicalController.getSession);

module.exports = router;
