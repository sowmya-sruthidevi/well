const express = require("express");
const router = express.Router();

const gdController = require("../controllers/gdController");
const gdEvaluationController = require("../controllers/gdEvaluationController");
const authMiddleware = require("../middleware/auth");

router.post("/start", authMiddleware, gdController.startGD);
router.post("/message", authMiddleware, gdController.userMessage);
router.post("/next", authMiddleware, gdController.nextBot);
router.post("/finish", authMiddleware, gdController.finishGD);
router.post("/analyze-message", authMiddleware, gdEvaluationController.analyzeUserMessage);
router.post("/evaluate", authMiddleware, gdEvaluationController.evaluate);
router.post("/save-result", authMiddleware, gdEvaluationController.saveResult);

module.exports = router;