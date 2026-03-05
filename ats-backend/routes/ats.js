const express = require("express");
const multer = require("multer");

const { 
  analyzeResume, 
  getProgressStats, 
  getSkillInsights,
  generateImprovedResume
} = require("../controllers/atsController");

const authMiddleware = require("../middleware/auth");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "image/png",
      "image/jpeg",
      "image/jpg"
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, DOCX, DOC, PNG, JPG, and JPEG files allowed"));
    }
  },
});

// 🔹 Analyze resume
router.post("/analyze", authMiddleware, upload.single("resume"), analyzeResume);

// 🔹 Get score trend
router.get("/progress", authMiddleware, getProgressStats);

// 🔹 Get weak skill insights
router.get("/skill-insights", authMiddleware, getSkillInsights);

// 🚀 Generate improved resume
router.post("/improve-resume", authMiddleware, upload.single("resume"), generateImprovedResume);

module.exports = router;