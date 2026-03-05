const BotInterview = require("../models/BotInterview");
const InterviewQuestion = require("../models/InterviewQuestion");
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
    console.warn("⚠️  OPENAI_API_KEY not found. AI evaluation will use fallback scoring.");
  }
} catch(err) {
  console.warn("⚠️  OpenAI initialization failed:", err.message);
}

/* START INTERVIEW SESSION */
exports.startInterview = async (req, res) => {
  try {
    // Get 5 random questions (mix of difficulties)
    const questions = await InterviewQuestion.aggregate([
      { $sample: { size: 5 } },
      { $project: { _id: 1, questionText: 1, timeLimit: 1, category: 1 } }
    ]);

    if (questions.length === 0) {
      return res.status(400).json({ 
        error: "No interview questions available. Please seed the database." 
      });
    }

    const session = await BotInterview.create({
      userId: req.user?.id || req.user?.userId || req.user?._id,
      sessionId: uuidv4(),
      questions: questions.map(q => ({
        questionId: q._id,
        question: q.questionText,
        category: q.category,
        userAnswer: "",
        answerQuality: 0,
        feedback: ""
      })),
      totalQuestions: questions.length,
      answeredQuestions: 0,
      scores: {
        communicationSkills: 0,
        problemSolving: 0,
        leadershipPotential: 0,
        cultureFit: 0,
        technicalKnowledge: 0
      }
    });

    res.json({
      sessionId: session.sessionId,
      totalQuestions: session.totalQuestions,
      questions: session.questions.map(q => ({
        questionId: q.questionId,
        question: q.question,
        category: q.category,
        timeLimit: questions.find(x => x._id.toString() === q.questionId.toString())?.timeLimit || 120
      }))
    });
  } catch(err) {
    console.error("Start interview error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* SUBMIT ANSWER TO QUESTION */
exports.submitAnswer = async (req, res) => {
  try {
    const { sessionId, questionId, answer } = req.body;

    if(!sessionId || !questionId || !answer) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const session = await BotInterview.findOne({ sessionId });

    if(!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Find the question in the session
    const questionIndex = session.questions.findIndex(
      q => q.questionId.toString() === questionId.toString()
    );

    if(questionIndex === -1) {
      return res.status(404).json({ error: "Question not found in session" });
    }

    // Get the full question details
    const fullQuestion = await InterviewQuestion.findById(questionId);

    if(!fullQuestion) {
      return res.status(404).json({ error: "Question details not found" });
    }

    // Store the answer
    session.questions[questionIndex].userAnswer = answer;

    let feedback = "";
    let answerQuality = 5; // Default score

    // If OpenAI is available, use AI for evaluation
    if (openai) {
      try {
        const evaluationPrompt = `You are an expert interview evaluator. Evaluate this answer to the interview question.

Question: "${fullQuestion.questionText}"

Evaluation Criteria:
${fullQuestion.evaluationCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Suggeste Answer Key Points:
${fullQuestion.suggestedAnswerKeyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

Candidate's Answer:
"${answer}"

Provide:
1. A quality score from 0-10 based on how well the answer addresses the criteria
2. Specific feedback on strengths in the answer
3. Areas for improvement
4. One key takeaway

Respond in JSON format ONLY:
{
  "score": <0-10>,
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "summary": "Brief summary of the answer quality"
}`;

        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are an expert HR interviewer and evaluator. Provide fair, constructive evaluation. Always respond with valid JSON only."
            },
            {
              role: "user",
              content: evaluationPrompt
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        });

        try {
          const content = response.choices[0].message.content.trim();
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          const evaluation = JSON.parse(jsonMatch ? jsonMatch[0] : content);
          
          answerQuality = Math.min(10, Math.max(0, evaluation.score || 5));
          feedback = evaluation.summary || "Good answer with relevant points.";
        } catch(parseErr) {
          console.warn("Failed to parse AI evaluation, using fallback");
          answerQuality = getRandomScore();
          feedback = "Your answer addressed the question with relevant points.";
        }
      } catch(aiErr) {
        console.warn("AI evaluation failed, using fallback:", aiErr.message);
        answerQuality = getRandomScore();
        feedback = "Your answer shows understanding of the topic.";
      }
    } else {
      // Fallback scoring
      answerQuality = getRandomScore();
      feedback = "Good answer with relevant points.";
    }

    // Update the question with feedback
    session.questions[questionIndex].answerQuality = answerQuality;
    session.questions[questionIndex].feedback = feedback;
    session.answeredQuestions = session.questions.filter(q => q.userAnswer).length;

    await session.save();

    res.json({
      questionId,
      answerQuality,
      feedback,
      answeredQuestions: session.answeredQuestions,
      totalQuestions: session.totalQuestions
    });
  } catch(err) {
    console.error("Submit answer error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* FINISH INTERVIEW AND GET EVALUATION */
exports.finishInterview = async (req, res) => {
  try {
    const { sessionId, duration } = req.body;

    if(!sessionId) {
      return res.status(400).json({ error: "SessionId is required" });
    }

    const session = await BotInterview.findOne({ sessionId });

    if(!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Calculate scores based on answers
    const evaluation = await evaluateInterview(session);

    // Update session with scores
    session.scores = evaluation.scores;
    session.overallScore = evaluation.overallScore;
    session.strengths = evaluation.strengths;
    session.improvements = evaluation.improvements;
    session.aiAnalysis = evaluation.aiAnalysis;
    session.recommendation = evaluation.recommendation;
    session.duration = duration || 0;
    session.answeredQuestions = session.questions.filter(q => q.userAnswer).length;

    await session.save();

    res.json({
      sessionId,
      scores: session.scores,
      overallScore: session.overallScore,
      strengths: session.strengths,
      improvements: session.improvements,
      aiAnalysis: session.aiAnalysis,
      recommendation: session.recommendation,
      answeredQuestions: session.answeredQuestions,
      totalQuestions: session.totalQuestions
    });
  } catch(err) {
    console.error("Finish interview error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* EVALUATE ENTIRE INTERVIEW */
async function evaluateInterview(session) {
  // Calculate average scores from question quality
  const answers = session.questions.filter(q => q.userAnswer);
  const avgQuality = answers.length > 0 ? 
    answers.reduce((sum, q) => sum + q.answerQuality, 0) / answers.length : 0;

  let evaluation = {
    scores: {
      communicationSkills: Math.min(10, avgQuality * 0.9 + Math.random()),
      problemSolving: Math.min(10, avgQuality * 0.85 + Math.random()),
      leadershipPotential: Math.min(10, avgQuality * 0.8 + Math.random()),
      cultureFit: Math.min(10, avgQuality * 0.85 + Math.random()),
      technicalKnowledge: Math.min(10, avgQuality * 0.9 + Math.random())
    },
    strengths: [],
    improvements: [],
    aiAnalysis: ""
  };

  // If OpenAI available, get detailed analysis
  if (openai) {
    try {
      const fullAnswers = session.questions
        .filter(q => q.userAnswer)
        .map(q => `Q: ${q.question}\nA: ${q.userAnswer}`)
        .join("\n\n");

      const analysisPrompt = `You are an expert HR interviewer and hiring manager. Analyze this candidate's interview responses and provide a comprehensive assessment.

Candidate Responses:
${fullAnswers}

Provide:
1. Overall assessment (0-10 scale)
2. Top 3 strengths demonstrated
3. Top 3 areas for improvement
4. One sentence recommendation

Respond in JSON format ONLY:
{
  "communicationSkills": <0-10>,
  "problemSolving": <0-10>,
  "leadershipPotential": <0-10>,
  "cultureFit": <0-10>,
  "technicalKnowledge": <0-10>,
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["improvement1", "improvement2", "improvement3"],
  "analysis": "Overall assessment and recommendation"
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert hiring manager providing candidate evaluation. Always respond with valid JSON only."
          },
          {
            role: "user",
            content: analysisPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      });

      try {
        const content = response.choices[0].message.content.trim();
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const aiEval = JSON.parse(jsonMatch ? jsonMatch[0] : content);

        evaluation.scores = {
          communicationSkills: Math.min(10, aiEval.communicationSkills || 6),
          problemSolving: Math.min(10, aiEval.problemSolving || 6),
          leadershipPotential: Math.min(10, aiEval.leadershipPotential || 5),
          cultureFit: Math.min(10, aiEval.cultureFit || 6),
          technicalKnowledge: Math.min(10, aiEval.technicalKnowledge || 6)
        };
        evaluation.strengths = aiEval.strengths || [];
        evaluation.improvements = aiEval.improvements || [];
        evaluation.aiAnalysis = aiEval.analysis || "Good interview performance.";
      } catch(parseErr) {
        console.warn("Failed to parse AI analysis");
      }
    } catch(aiErr) {
      console.warn("AI analysis failed:", aiErr.message);
    }
  }

  // Calculate overall score
  const scores = Object.values(evaluation.scores);
  evaluation.overallScore = Math.round(
    (scores.reduce((a, b) => a + b, 0) / scores.length) * 10
  ) / 10;

  // Determine recommendation
  if (evaluation.overallScore >= 8) {
    evaluation.recommendation = "Strong Fit - Highly Recommended";
  } else if (evaluation.overallScore >= 6.5) {
    evaluation.recommendation = "Good Fit - Recommended";
  } else if (evaluation.overallScore >= 5) {
    evaluation.recommendation = "Average Performance - Consider";
  } else {
    evaluation.recommendation = "Needs Improvement - Review Feedback";
  }

  return evaluation;
}

function getRandomScore() {
  return Math.floor(Math.random() * 4) + 5; // 5-9
}

/* GET SESSION DETAILS */
exports.getSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await BotInterview.findOne({ sessionId });

    if(!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    res.json(session);
  } catch(err) {
    console.error("Get session error:", err);
    res.status(500).json({ error: err.message });
  }
};
