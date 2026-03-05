const GDSession = require("../models/GDSession");
const GDTopic = require("../models/GDTopic");
const { v4: uuidv4 } = require("uuid");

let openai = null;

// Initialize OpenAI only if API key is available
try {
  const { OpenAI } = require("openai");
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  } else {
    console.warn("⚠️  OPENAI_API_KEY not found. AI features will use fallback responses.");
  }
} catch(err) {
  console.warn("⚠️  OpenAI initialization failed:", err.message);
}

/* START SESSION */
exports.startGD = async (req,res)=>{
  try {
    // Get a random topic from database with random difficulty
    const difficulties = ["easy", "medium", "hard"];
    const randomDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
    
    const topicDoc = await GDTopic.findOne({ difficulty: randomDifficulty });
    
    let topic = topicDoc?.topic || "Is artificial intelligence good for society?";
    let topicId = topicDoc?._id || null;
    let difficulty = topicDoc?.difficulty || "medium";
    
    const session = await GDSession.create({
      sessionId: uuidv4(),
      topic,
      topicId,
      difficulty,
      transcript: [],
      startTime: new Date(),
      userSpeakingTime: 0,
      messageCount: 0
    });

    res.json({
      ...session.toObject(),
      context: topicDoc?.context || null,
      keyPoints: topicDoc?.suggestedKeyPoints || []
    });
  } catch(err) {
    console.error("Start GD error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* USER MESSAGE */
exports.userMessage = async (req,res)=>{
  try {
    const { sessionId, message } = req.body;

    if(!sessionId) {
      return res.status(400).json({error:"SessionId is required"});
    }

    const session = await GDSession.findOne({sessionId});

    if(!session) {
      return res.status(404).json({error:"Session not found"});
    }

    session.transcript.push({
      role:"user",
      name:"You",
      content:message,
      timestamp: new Date()
    });
    
    session.messageCount = session.transcript.filter(t => t.role === "user").length;

    await session.save();

    res.json({session});
  } catch(err) {
    console.error("User message error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* BOT RESPONSE - AI POWERED */
exports.nextBot = async (req,res)=>{
  try {
    const { sessionId } = req.body;

    if(!sessionId) {
      return res.status(400).json({error:"SessionId is required"});
    }

    const session = await GDSession.findOne({sessionId});

    if(!session) {
      return res.status(404).json({error:"Session not found"});
    }

    const bots = [
      { name: "Bot1", persona: "analytical and data-driven perspective" },
      { name: "Bot2", persona: "critical and questioning approach" },
      { name: "Bot3", persona: "balanced and diplomatic viewpoint" }
    ];

    const selectedBot = bots[Math.floor(Math.random() * bots.length)];

    let botReply = "";

    // If OpenAI is available, use AI-powered response
    if (openai) {
      try {
        const transcriptText = session.transcript
          .map(t => `${t.name}: ${t.content}`)
          .join("\n");

        const prompt = `You are ${selectedBot.name} in a group discussion about: "${session.topic}"

Your persona: You take a ${selectedBot.persona}.

Current discussion:
${transcriptText}

Generate a single, concise response (1-2 sentences max) that:
1. Directly responds to the last person's point
2. Adds a new perspective or challenges an assumption
3. Stays relevant to the topic
4. Avoids repeating previous points

Respond naturally as if you're speaking in the discussion.`;

        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are an intelligent participant in a group discussion. Keep responses brief (1-2 sentences) and conversational."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 150
        });

        botReply = response.choices[0].message.content.trim();
      } catch(aiErr) {
        console.warn("AI generation failed, using fallback:", aiErr.message);
        botReply = getDefaultResponse();
      }
    } else {
      // Use default responses if OpenAI not available
      botReply = getDefaultResponse();
    }

    session.transcript.push({
      role:"bot",
      name: selectedBot.name,
      content: botReply,
      timestamp: new Date()
    });

    await session.save();

    res.json({
      session,
      botName: selectedBot.name,
      botPersona: selectedBot.persona
    });
  } catch(err) {
    console.error("Bot response error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Fallback responses when AI is not available
function getDefaultResponse() {
  const responses = [
    "That's an interesting point. I think we should also consider the long-term implications.",
    "I agree to some extent, but what about the economic impact on this?",
    "That brings up an important perspective. However, we mustn't forget about the social aspects.",
    "Good argument. Let me offer a different angle to consider.",
    "I see your point, but statistics show a different trend in this area.",
    "That's valid. Building on what you said, there's also the matter of sustainability.",
    "Absolutely, and this connects to the broader issue of resource management.",
    "I understand that view. Let me play devil's advocate here for a moment."
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

/* FINISH GD SESSION */
exports.finishGD = async (req, res) => {
  try {
    const { sessionId, userSpeakingTime } = req.body;

    if(!sessionId) {
      return res.status(400).json({error:"SessionId is required"});
    }

    const session = await GDSession.findOne({sessionId});

    if(!session) {
      return res.status(404).json({error:"Session not found"});
    }

    session.endTime = new Date();
    session.duration = Math.round((session.endTime - session.startTime) / 1000);
    session.userSpeakingTime = userSpeakingTime || 0;

    await session.save();

    res.json({
      success: true,
      session,
      stats: {
        totalDuration: session.duration,
        userSpeakingTime: session.userSpeakingTime,
        messageCount: session.messageCount,
        participationPercentage: Math.min(100, Math.round((session.userSpeakingTime / session.duration) * 100))
      }
    });
  } catch(err) {
    console.error("Finish GD error:", err);
    res.status(500).json({ error: err.message });
  }
};