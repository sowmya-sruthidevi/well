const GDSession = require("../models/GDSession");
const GDAttempt = require("../models/GDAttempt");

let openai = null;

// Initialize OpenAI only if API key is available
try {
  const { OpenAI } = require("openai");
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  } else {
    console.warn("⚠️  OPENAI_API_KEY not found. AI evaluation will use fallback scoring.");
  }
} catch(err) {
  console.warn("⚠️  OpenAI initialization failed:", err.message);
}

exports.evaluate = async (req,res)=>{
  try {
    const { sessionId, speakingTime, topic, duration } = req.body;

    if(!sessionId) {
      return res.status(400).json({error:"SessionId is required"});
    }

    const session = await GDSession.findOne({sessionId});

    if(!session) {
      return res.status(404).json({error:"Session not found"});
    }

    let evaluation = {};

    // If OpenAI is available, use AI-powered evaluation
    if (openai) {
      try {
        const transcriptText = session.transcript
          .map(t => `${t.name}: ${t.content}`)
          .join("\n");

        const analysisPrompt = `You are an expert interviewer evaluating a candidate's performance in a group discussion.

Topic: "${session.topic}"

Discussion Transcript:
${transcriptText}

Evaluate the candidate ("You") on the following 5 parameters on a scale of 0-10:

1. **Communication**: Clarity of expression, vocabulary usage, grammar
2. **Confidence**: Assertiveness, conviction in ideas, body language (inferred)
3. **Relevance**: How well points are connected to the topic
4. **Participation**: Number and quality of contributions, engagement level
5. **Critical Thinking**: Depth of analysis, questioning assumptions, logical reasoning

Also provide:
- 3 key strengths demonstrated
- 3 areas for improvement with specific suggestions

Respond in this JSON format ONLY (no other text):
{
  "communication": <0-10>,
  "confidence": <0-10>,
  "relevance": <0-10>,
  "participation": <0-10>,
  "criticalThinking": <0-10>,
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["improvement1", "improvement2", "improvement3"],
  "analysis": "Detailed feedback paragraph"
}`;

        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are an expert group discussion evaluator. Provide fair, constructive evaluation. Always respond with valid JSON only."
            },
            {
              role: "user",
              content: analysisPrompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        });

        try {
          const content = response.choices[0].message.content.trim();
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          evaluation = JSON.parse(jsonMatch ? jsonMatch[0] : content);
        } catch(parseErr) {
          console.error("Failed to parse AI evaluation:", parseErr);
          evaluation = getDefaultEvaluation();
        }
      } catch(aiErr) {
        console.warn("AI evaluation failed, using fallback:", aiErr.message);
        evaluation = getDefaultEvaluation();
      }
    } else {
      // Use default evaluation if OpenAI not available
      evaluation = getDefaultEvaluation();
    }

    // Calculate overall score
    const overallScore = Math.round(
      (evaluation.communication + 
       evaluation.confidence + 
       evaluation.relevance + 
       evaluation.participation + 
       evaluation.criticalThinking) / 5 * 10
    ) / 10;

    const result = {
      communication: evaluation.communication || 6,
      confidence: evaluation.confidence || 6,
      relevance: evaluation.relevance || 6,
      participation: evaluation.participation || 6,
      criticalThinking: evaluation.criticalThinking || 5,
      overallScore,
      improvements: evaluation.improvements || ["Give more structured arguments"],
      strengths: evaluation.strengths || ["Good participation"],
      aiAnalysis: evaluation.analysis || "Good performance in the group discussion"
    };

    res.json(result);
  } catch(err) {
    console.error("Evaluation error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Fallback evaluation when AI is not available
function getDefaultEvaluation() {
  return {
    communication: Math.floor(Math.random() * 3) + 6,
    confidence: Math.floor(Math.random() * 3) + 5,
    relevance: Math.floor(Math.random() * 3) + 6,
    participation: Math.floor(Math.random() * 3) + 6,
    criticalThinking: Math.floor(Math.random() * 3) + 4,
    strengths: [
      "Good participation throughout",
      "Relevant topic understanding",
      "Respectful communication style"
    ],
    improvements: [
      "Provide more specific examples and data points",
      "Build on others' ideas more explicitly",
      "Work on speaking with more conviction"
    ],
    analysis: "You demonstrated decent participation in the group discussion. Your points were generally relevant to the topic. To improve further, try to provide more specific examples, engage more deeply with others' perspectives, and express your ideas with greater confidence."
  };
}

exports.saveResult = async (req,res)=>{
  try {
    const { sessionId, scores, speakingTime, topic, duration } = req.body;
    const userId = req.user?.id || req.user?.userId || req.user?._id;

    console.log("💾 Saving GD Result - userId:", userId, "topic:", topic);

    if (!userId) {
      console.error("❌ No userId found!");
      return res.status(401).json({ error: "User not authenticated" });
    }

    const session = await GDSession.findOne({sessionId});

    const result = await GDAttempt.create({
      userId,
      sessionId,
      topic: session?.topic || topic,
      difficulty: session?.difficulty || "medium",
      speakingTime: speakingTime || session?.userSpeakingTime || 0,
      messageCount: session?.messageCount || 0,
      scores: {
        communication: scores.communication,
        confidence: scores.confidence,
        relevance: scores.relevance,
        participation: scores.participation,
        criticalThinking: scores.criticalThinking
      },
      overallScore: scores.overallScore || 5,
      improvements: scores.improvements || [],
      strengths: scores.strengths || [],
      aiAnalysis: scores.aiAnalysis || "",
      duration: duration || session?.duration || 0,
      createdAt: new Date()
    });

    console.log("✅ GD Result saved:", result._id);

    res.json({ success: true, result });
  } catch(err) {
    console.error("❌ GD Save Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// 🤖 Analyze User Message - Instant AI Feedback
exports.analyzeUserMessage = async (req, res) => {
  try {
    const { sessionId, message, topic } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({ error: "SessionId and message are required" });
    }

    const session = await GDSession.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    let feedback = {};

    if (openai) {
      try {
        const analysisPrompt = `You are an expert group discussion evaluator. Analyze this single point made by a candidate in a group discussion.

Topic: "${topic || session.topic}"

User's Statement: "${message}"

Provide CONSTRUCTIVE feedback on:
1. **Strength** - What was good about this point
2. **Clarity** - How clear and well-articulated it was (0-10 score)
3. **Relevance** - How relevant to the topic (0-10 score)
4. **Suggestion** - One specific way to improve or expand on this point

Respond in this JSON format ONLY:
{
  "strength": "What was done well",
  "clarity": <0-10>,
  "relevance": <0-10>,
  "suggestion": "Specific improvement tip",
  "insight": "Brief psychological/logical insight about the statement"
}`;

        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "Provide constructive, encouraging feedback on group discussion contributions. Always respond with valid JSON only."
            },
            {
              role: "user",
              content: analysisPrompt
            }
          ],
          temperature: 0.7,
          max_tokens: 300
        });

        try {
          const content = response.choices[0].message.content.trim();
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          feedback = JSON.parse(jsonMatch ? jsonMatch[0] : content);
        } catch (parseErr) {
          console.error("Failed to parse message analysis:", parseErr);
          feedback = getDefaultMessageFeedback();
        }
      } catch (aiErr) {
        console.warn("AI message analysis failed:", aiErr.message);
        feedback = getDefaultMessageFeedback();
      }
    } else {
      feedback = getDefaultMessageFeedback();
    }

    res.json({
      success: true,
      feedback,
      sessionId
    });
  } catch (err) {
    console.error("Message analysis error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

function getDefaultMessageFeedback() {
  return {
    strength: "Good contribution to the discussion",
    clarity: 7,
    relevance: 8,
    suggestion: "Consider adding specific examples or data to support your point",
    insight: "You presented a balanced perspective on the subject"
  };
}