const GDAttempt = require("../models/GDAttempt");
const Attempt = require("../models/Attempt");
const AtsResult = require("../models/AtsResult");
const TestSession = require("../models/TestSession");
const TechnicalAttempt = require("../models/TechnicalAttempt");
const User = require("../models/User");

exports.getDashboard = async(req,res)=>{

try {
const userId = req.user.id;

console.log("🔍 Dashboard requested for userId:", userId);
console.log("   req.user:", req.user);

if (!userId) {
console.error("❌ No userId in dashboard request!");
return res.status(401).json({ error: "User not authenticated" });
}

// Get GD attempts
const gdAttempts = await GDAttempt.find({ userId }).sort({ createdAt: -1 });
console.log("📊 GD Attempts found:", gdAttempts.length);
if (gdAttempts.length > 0) {
  console.log("   Sample GD Attempt:", gdAttempts[0]);
} else {
  console.log("   ⚠️  No GD attempts found - checking DB directly...");
  const allGD = await GDAttempt.find({});
  console.log("   Total GD attempts in DB:", allGD.length);
  if (allGD.length > 0) {
    console.log("   Sample GD in DB:", allGD[0]);
  }
}

// Get aptitude attempts
let aptitudeAttempts = await Attempt.find({ userId, roundType: "aptitude" }).sort({ createdAt: -1 });
console.log("📚 Aptitude Attempts found:", aptitudeAttempts.length);

// Fallback for older data where aptitude scores were only saved in TestSession
if (aptitudeAttempts.length === 0) {
const completedSessions = await TestSession.find({ userId, completed: true }).sort({ startedAt: -1 });
console.log("🔄 Completed TestSessions found (fallback):", completedSessions.length);
aptitudeAttempts = completedSessions.map((session) => ({
score: session.score || 0,
createdAt: session.startedAt,
roundType: "aptitude",
evaluation: {
totalQuestions: session.questions?.length || 10,
accuracy: session.questions?.length
? ((session.score || 0) / session.questions.length) * 100
: 0
}
}));
}

// Get ATS results
const atsResults = await AtsResult.find({ userId }).sort({ createdAt: -1 });
console.log("🔐 ATS Results found:", atsResults.length);

// Get Technical attempts
const technicalAttempts = await TechnicalAttempt.find({ userId }).sort({ createdAt: -1 });
console.log("💻 Technical Attempts found:", technicalAttempts.length);

// Get user profile
const user = await User.findById(userId).select("fullName email photo");
const photoUrl = user?.photo
  ? `${req.protocol}://${req.get("host")}/uploads/${user.photo}`
  : null;

// Calculate best scores
const gdBestScore = gdAttempts.length > 0 ? Math.max(...gdAttempts.map(g => g.overallScore || 0)) : 0;
const aptitudeBestScore = aptitudeAttempts.length > 0 ? Math.max(...aptitudeAttempts.map(a => a.score || 0)) : 0;
const atsBestScore = atsResults.length > 0 ? Math.max(...atsResults.map(a => a.overallScore || 0)) : 0;
const technicalBestScore = technicalAttempts.length > 0 ? Math.max(...technicalAttempts.map(t => t.score || 0)) : 0;

res.json({
user: {
fullName: user?.fullName || "",
email: user?.email || "",
photoUrl
},
gdAttempts: gdAttempts,
gdAttemptCount: gdAttempts.length,
gdBestScore: gdBestScore,
gdLatestScore: gdAttempts.length > 0 ? gdAttempts[0].overallScore : 0,
aptitudeAttempts: aptitudeAttempts,
aptitudeAttemptCount: aptitudeAttempts.length,
aptitudeBestScore: aptitudeBestScore,
aptitudeLatestScore: aptitudeAttempts.length > 0 ? aptitudeAttempts[0].score : 0,
atsResults: atsResults,
atsAttemptCount: atsResults.length,
atsBestScore: atsBestScore,
atsLatestScore: atsResults.length > 0 ? atsResults[0].overallScore : 0,
technicalAttempts: technicalAttempts,
technicalAttemptCount: technicalAttempts.length,
technicalBestScore: technicalBestScore,
technicalLatestScore: technicalAttempts.length > 0 ? technicalAttempts[0].score : 0
});
} catch(err){
res.status(500).json({ error: err.message });
}
};

exports.getGDResults = async(req,res)=>{

try {
const userId = req.user.id;

if (!userId) {
return res.status(401).json({ error: "User not authenticated" });
}

const results = await GDAttempt.find({ userId }).sort({ createdAt: -1 });

res.json({ results, count: results.length });
} catch(err){
res.status(500).json({ error: err.message });
}
};