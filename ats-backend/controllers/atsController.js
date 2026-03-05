const extractText = require("../utils/extractText");
const analyzeResumeWithAI = require("../services/atsAIService");
const AtsResult = require("../models/AtsResult");

exports.analyzeResume = async (req, res) => {
  try {
    const { jobDescription, jobTitle, jobCategory } = req.body;
    const file = req.file;
    const userId = req.user?.id || req.user?.userId || req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!file) {
      return res.status(400).json({ message: "Resume file required" });
    }

    if (!jobDescription || jobDescription.length < 20) {
      return res.status(400).json({ message: "Valid job description required" });
    }

    // 1️⃣ Extract resume text
    console.log("STEP 1: Extracting resume...");
    const resumeText = await extractText(file);
    console.log("STEP 2: Resume extracted");
    console.log("STEP 3: Calling OpenAI");
    
    // 2️⃣ AI analysis
    const aiResult = await analyzeResumeWithAI(
      resumeText,
      jobDescription
    );
    
    console.log("STEP 4: OpenAI responded");

    // 3️⃣ Use real scores from AI analysis
    const skillScore = aiResult.skillMatchScore || 0;
    const formatScore = aiResult.formatScore || 0;
    const keywordScore = aiResult.keywordScore || 0;

    // Calculate weighted overall score
    const overallScore = Math.round(
      skillScore * 0.4 +
      formatScore * 0.3 +
      keywordScore * 0.3
    );

    // 4️⃣ Save to DB
    const savedResult = await AtsResult.create({
      userId,
      jobTitle,
      jobCategory,
      jobDescription,
      overallScore,
      skillScore,
      experienceScore: formatScore, // Use format score instead
      keywordScore,
      matchedSkills: aiResult.matchedSkills,
      missingSkills: aiResult.missingSkills,
      strengths: aiResult.strengths,
      improvementAreas: aiResult.improvementAreas
    });

    console.log("✅ ATS Result saved - userId:", userId, "score:", overallScore);

    // 5️⃣ Send response
    res.json(savedResult);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "ATS analysis failed" });
  }
};

// 🔥 Progress Stats
exports.getProgressStats = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId || req.user?._id;
    const results = await AtsResult.find({ userId })
      .sort({ createdAt: 1 });

    const trend = results.map(r => ({
      date: r.createdAt,
      score: r.overallScore
    }));

    res.json(trend);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch progress" });
  }
};
exports.getSkillInsights = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId || req.user?._id;
    const results = await AtsResult.find({ userId });

    const missingSkillsMap = {};

    results.forEach(r => {
      r.missingSkills.forEach(skill => {
        missingSkillsMap[skill] =
          (missingSkillsMap[skill] || 0) + 1;
      });
    });

    res.json(missingSkillsMap);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch skill insights" });
  }
};

// 🚀 Generate Improved Resume
exports.generateImprovedResume = async (req, res) => {
  try {
    const { resultId } = req.body;
    const file = req.file;
    const userId = req.user?.id || req.user?.userId || req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!file) {
      return res.status(400).json({ message: "Original resume file required" });
    }

    if (!resultId) {
      return res.status(400).json({ message: "ATS result ID required" });
    }

    // Get the ATS analysis result
    const atsResult = await AtsResult.findById(resultId);
    if (!atsResult || atsResult.userId.toString() !== userId.toString()) {
      return res.status(404).json({ message: "ATS result not found" });
    }

    // Extract original resume text
    const originalResumeText = await extractText(file);

    // Use OpenAI to generate improved resume
    const OpenAI = require("openai");
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `You are an expert resume writer and ATS optimization specialist.

IMPORTANT: Do NOT add any new skills, experiences, or information that is not in the original resume. Only REWRITE and IMPROVE what already exists.

Your task: Take the original resume and rewrite it to be MORE EFFECTIVE while ONLY using information that already exists in it.

Here's what you should improve (WITHOUT adding new content):
- Use strong action verbs (managed, developed, led, implemented, optimized, etc.)
- Make achievements more quantifiable and impactful
- Improve phrasing for clarity and professionalism
- Better organize sections for ATS readability
- Enhance the Professional Summary to be compelling
- Better highlight existing strengths: ${atsResult.strengths.join(", ")}
- Reword to address these improvement areas better: ${atsResult.improvementAreas.join(", ")}

Job Description Keywords to emphasize (if they already match your resume):
${atsResult.jobDescription}

REMEMBER: Only rewrite better. Do not add new skills, certifications, or experiences. Keep all existing information but make it shine!

Original Resume:
${originalResumeText}

Generate the improved resume in a professional, ATS-friendly format. Make it ready to copy-paste.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert resume writer. Your job is to REWRITE existing resume content to be more effective and impactful. NEVER add new information - only improve existing content."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 3000
    });

    const improvedResume = completion.choices[0].message.content;

    res.json({
      success: true,
      improvedResume,
      improvements: {
        addressedSkills: atsResult.missingSkills,
        improvementAreas: atsResult.improvementAreas,
        strengths: atsResult.strengths
      }
    });

  } catch (error) {
    console.error("Resume improvement error:", error);
    res.status(500).json({ message: "Failed to generate improved resume" });
  }
};