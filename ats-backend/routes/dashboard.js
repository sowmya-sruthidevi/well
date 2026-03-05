const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const dashboardController = require("../controllers/dashboardController");

router.get("/", authMiddleware, dashboardController.getDashboard);
router.get("/gd-results", authMiddleware, dashboardController.getGDResults);

module.exports = router;