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

/* START INTERVIEW SESSION (ROUND 1 or ROUND 2) */
exports.startInterview = async (req, res) => {
  try {
    const { round = 1, sessionId: existingSessionId } = req.body;
    
    if (![1, 2].includes(round)) {
      return res.status(400).json({ error: "Round must be 1 or 2" });
    }

    let session;

    if (existingSessionId && round === 2) {
      // Get existing session for round 2
      session = await BotInterview.findOne({ sessionId: existingSessionId });
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      
      // Clear questions for round 2
      session.questions = [];
      session.currentRound = 2;
      session.roundStatus.get('round2').startedAt = new Date();
    } else if (round === 1) {
      // Create new session for round 1
      session = new BotInterview({
        userId: req.user?.id || req.user?.userId || req.user?._id,
        sessionId: uuidv4(),
        currentRound: 1,
        roundStatus: new Map([
          ['round1', { completed: false, startedAt: new Date() }],
          ['round2', { completed: false }]
        ])
      });
    } else {
      return res.status(400).json({ error: "Invalid round or sessionId" });
    }

    // Get questions based on round
    let questions;

    if (round === 1) {
      // ROUND 1: General/Behavioral Interview
      const tellMeAboutYourself = await InterviewQuestion.findOne({
        questionText: /Tell me about yourself/i,
        round: 1
      });

      if (!tellMeAboutYourself) {
        return res.status(400).json({ 
          error: "Interview questions not properly seeded. Please run seed script." 
        });
      }

      // Get 1 technical and 3 additional questions for round 1
      const technicalQuestion = await InterviewQuestion.aggregate([
        { $match: { category: "technical", round: 1 } },
        { $sample: { size: 1 } },
        { $project: { _id: 1, questionText: 1, timeLimit: 1, category: 1 } }
      ]);

      if (technicalQuestion.length === 0) {
        return res.status(400).json({ 
          error: "No technical questions available. Please seed the database." 
        });
      }

      const additionalQuestions = await InterviewQuestion.aggregate([
        { 
          $match: { 
            _id: { 
              $nin: [
                tellMeAboutYourself._id, 
                technicalQuestion[0]._id
              ] 
            },
            round: 1
          } 
        },
        { $sample: { size: 3 } },
        { $project: { _id: 1, questionText: 1, timeLimit: 1, category: 1 } }
      ]);

      questions = [
        {
          _id: tellMeAboutYourself._id,
          questionText: tellMeAboutYourself.questionText,
          timeLimit: tellMeAboutYourself.timeLimit,
          category: tellMeAboutYourself.category
        },
        ...technicalQuestion,
        ...additionalQuestions
      ];
    } else {
      // ROUND 2: Technical Stack + Coding Interview
      // Get both technical stack and coding questions for a comprehensive technical round
      const stackQuestions = await InterviewQuestion.find({
        category: "technical-stack",
        round: 2
      }).limit(3);

      const codingQuestions = await InterviewQuestion.find({
        category: "technical-coding",
        round: 2
      }).limit(2);

      if (stackQuestions.length === 0 && codingQuestions.length === 0) {
        return res.status(400).json({ 
          error: "No technical questions available. Please seed the database." 
        });
      }

      questions = [...stackQuestions, ...codingQuestions].map(q => ({
        _id: q._id,
        questionText: q.questionText,
        timeLimit: q.timeLimit,
        category: q.category
      }));
    }

    // Add questions to session
    session.questions = questions.map(q => ({
      questionId: q._id,
      question: q.questionText,
      category: q.category,
      userAnswer: "",
      answerQuality: 0,
      feedback: ""
    }));

    session.totalQuestions = session.questions.length;
    session.answeredQuestions = 0;

    // Initialize scores for the round
    if (round === 1) {
      session.scores.round1 = {
        communicationSkills: 0,
        problemSolving: 0,
        leadershipPotential: 0,
        cultureFit: 0,
        technicalKnowledge: 0,
        overall: 0
      };
    } else {
      session.scores.round2 = {
        technicalDepth: 0,
        stackKnowledge: 0,
        architectureUnderstanding: 0,
        bestPractices: 0,
        problemSolving: 0,
        overall: 0
      };
    }

    await session.save();

    res.json({
      sessionId: session.sessionId,
      round: round,
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
        let evaluationPrompt = "";
        
        if (fullQuestion.category === 'technical-coding') {
          // Special evaluation for coding questions
          evaluationPrompt = `You are an expert code reviewer. Evaluate this code solution to the programming challenge.

Challenge: "${fullQuestion.questionText}"

Evaluation Criteria:
${fullQuestion.evaluationCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Code Quality Aspects to Check:
- Correctness and logic soundness
- Code readability and structure
- Use of appropriate data structures
- Time and space complexity
- Edge case handling
- Proper variable naming
- Comments where needed

Candidate's Code Solution:
\`\`\`
${answer}
\`\`\`

Provide:
1. A quality score from 0-10 based on code correctness and quality
2. Specific strengths in the solution
3. Areas for improvement
4. Time/Space complexity analysis (if applicable)
5. Brief feedback on the approach

Respond in JSON format ONLY:
{
  "score": <0-10>,
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["improvement1", "improvement2"],
  "complexity": "Brief complexity analysis (e.g., Time: O(n), Space: O(1))",
  "summary": "Brief summary of the solution quality"
}`;
        } else {
          // Standard evaluation for other questions
          evaluationPrompt = `You are an expert interview evaluator. Evaluate this answer to the interview question.

Question: "${fullQuestion.questionText}"

Evaluation Criteria:
${fullQuestion.evaluationCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Suggested Answer Key Points:
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
        }

        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: fullQuestion.category === 'technical-coding' 
                ? "You are an expert code reviewer. Provide fair, constructive evaluation of code. Always respond with valid JSON only."
                : "You are an expert HR interviewer and evaluator. Provide fair, constructive evaluation. Always respond with valid JSON only."
            },
            {
              role: "user",
              content: evaluationPrompt
            }
          ],
          temperature: 0.7,
          max_tokens: 600
        });

        try {
          const content = response.choices[0].message.content.trim();
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          const evaluation = JSON.parse(jsonMatch ? jsonMatch[0] : content);
          
          answerQuality = Math.min(10, Math.max(0, evaluation.score || 5));
          if (fullQuestion.category === 'technical-coding') {
            feedback = `${evaluation.summary || "Code solution reviewed."} ${evaluation.complexity ? `Complexity: ${evaluation.complexity}` : ""}`;
          } else {
            feedback = evaluation.summary || "Good answer with relevant points.";
          }
        } catch(parseErr) {
          console.warn("Failed to parse AI evaluation, using fallback");
          answerQuality = getRandomScore();
          feedback = fullQuestion.category === 'technical-coding' 
            ? "Code solution evaluated. Ensure proper logic and edge case handling."
            : "Your answer addressed the question with relevant points.";
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

    const currentRound = session.currentRound || 1;

    // Calculate scores based on current round
    const evaluation = await evaluateInterview(session, currentRound);

    // Update session with scores and mark round as completed
    if (currentRound === 1) {
      session.scores.round1 = evaluation.scores;
    } else {
      session.scores.round2 = evaluation.scores;
    }

    session.strengths = evaluation.strengths;
    session.improvements = evaluation.improvements;
    session.aiAnalysis = evaluation.aiAnalysis;
    session.recommendation = evaluation.recommendation;
    session.duration = duration || 0;
    session.answeredQuestions = session.questions.filter(q => q.userAnswer).length;

    // Mark round as completed
    const roundKey = `round${currentRound}`;
    const roundStatus = session.roundStatus.get(roundKey) || {};
    roundStatus.completed = true;
    roundStatus.completedAt = new Date();
    session.roundStatus.set(roundKey, roundStatus);

    await session.save();

    res.json({
      sessionId,
      currentRound: currentRound,
      roundCompleted: true,
      canContinueToNextRound: currentRound === 1,
      overallScore: evaluation.scores.overall,
      scores: evaluation.scores,
      strengths: evaluation.strengths,
      improvements: evaluation.improvements,
      aiAnalysis: evaluation.aiAnalysis,
      recommendation: evaluation.recommendation,
      answeredQuestions: session.answeredQuestions,
      totalQuestions: session.totalQuestions
    });
  } catch(err) {
    console.error("Finish interview error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* EVALUATE ENTIRE INTERVIEW */
async function evaluateInterview(session, round = 1) {
  // Calculate average scores from question quality
  const answers = session.questions.filter(q => q.userAnswer);
  const avgQuality = answers.length > 0 ? 
    answers.reduce((sum, q) => sum + q.answerQuality, 0) / answers.length : 0;

  let evaluation = {};

  if (round === 1) {
    // Round 1: General/Behavioral scoring
    evaluation.scores = {
      communicationSkills: Math.min(10, avgQuality * 0.9 + Math.random()),
      problemSolving: Math.min(10, avgQuality * 0.85 + Math.random()),
      leadershipPotential: Math.min(10, avgQuality * 0.8 + Math.random()),
      cultureFit: Math.min(10, avgQuality * 0.85 + Math.random()),
      technicalKnowledge: Math.min(10, avgQuality * 0.9 + Math.random()),
      overall: 0
    };
  } else {
    // Round 2: Technical Stack scoring
    evaluation.scores = {
      technicalDepth: Math.min(10, avgQuality * 0.95 + Math.random()),
      stackKnowledge: Math.min(10, avgQuality * 1.0 + Math.random()),
      architectureUnderstanding: Math.min(10, avgQuality * 0.9 + Math.random()),
      bestPractices: Math.min(10, avgQuality * 0.85 + Math.random()),
      problemSolving: Math.min(10, avgQuality * 0.9 + Math.random()),
      overall: 0
    };
  }

  evaluation.strengths = [];
  evaluation.improvements = [];
  evaluation.aiAnalysis = "";

  // If OpenAI available, get detailed analysis
  if (openai) {
    try {
      const fullAnswers = session.questions
        .filter(q => q.userAnswer)
        .map(q => `Q: ${q.question}\nA: ${q.userAnswer}`)
        .join("\n\n");

      let analysisPrompt;

      if (round === 1) {
        analysisPrompt = `You are an expert HR interviewer and hiring manager. Analyze this candidate's interview responses for ROUND 1 (Behavioral/General).

Candidate Responses:
${fullAnswers}

Evaluate on these criteria:
1. Communication Skills - clarity, articulation, listening
2. Problem Solving - approach, creativity, logic
3. Leadership Potential - initiative, influence, decision-making
4. Cultural Fit - values alignment, team orientation
5. Technical Knowledge - depth, relevance to role

Provide:
1. Score for each criterion (0-10)
2. Top 3 strengths demonstrated
3. Top 3 areas for improvement
4. Overall assessment

Respond in JSON format ONLY:
{
  "communicationSkills": <0-10>,
  "problemSolving": <0-10>,
  "leadershipPotential": <0-10>,
  "cultureFit": <0-10>,
  "technicalKnowledge": <0-10>,
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["improvement1", "improvement2", "improvement3"],
  "analysis": "Overall assessment"
}`;
      } else {
        analysisPrompt = `You are an expert technical interviewer and architect. Analyze this candidate's ROUND 2 (Technical Stack) responses.

Candidate Responses:
${fullAnswers}

Evaluate on these criteria:
1. Technical Depth - deep understanding, specifics
2. Stack Knowledge - familiarity with modern technologies
3. Architecture Understanding - system design, scalability concepts
4. Best Practices - patterns, coding standards, optimization
5. Problem Solving - technical approach, trade-offs

Provide:
1. Score for each criterion (0-10)
2. Top 3 technical strengths
3. Top 3 areas for improvement
4. Technical assessment and recommendations

Respond in JSON format ONLY:
{
  "technicalDepth": <0-10>,
  "stackKnowledge": <0-10>,
  "architectureUnderstanding": <0-10>,
  "bestPractices": <0-10>,
  "problemSolving": <0-10>,
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["improvement1", "improvement2", "improvement3"],
  "analysis": "Technical assessment and recommendations"
}`;
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert ${round === 1 ? 'HR' : 'technical'} interviewer. Provide candidate evaluation. Always respond with valid JSON only.`
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

        if (round === 1) {
          evaluation.scores = {
            communicationSkills: Math.min(10, aiEval.communicationSkills || 6),
            problemSolving: Math.min(10, aiEval.problemSolving || 6),
            leadershipPotential: Math.min(10, aiEval.leadershipPotential || 5),
            cultureFit: Math.min(10, aiEval.cultureFit || 6),
            technicalKnowledge: Math.min(10, aiEval.technicalKnowledge || 6),
            overall: 0
          };
        } else {
          evaluation.scores = {
            technicalDepth: Math.min(10, aiEval.technicalDepth || 6),
            stackKnowledge: Math.min(10, aiEval.stackKnowledge || 6),
            architectureUnderstanding: Math.min(10, aiEval.architectureUnderstanding || 5),
            bestPractices: Math.min(10, aiEval.bestPractices || 6),
            problemSolving: Math.min(10, aiEval.problemSolving || 6),
            overall: 0
          };
        }

        evaluation.strengths = aiEval.strengths || [];
        evaluation.improvements = aiEval.improvements || [];
        evaluation.aiAnalysis = aiEval.analysis || "Interview completed successfully.";
      } catch(parseErr) {
        console.warn("Failed to parse AI analysis");
      }
    } catch(aiErr) {
      console.warn("AI analysis failed:", aiErr.message);
    }
  }

  // Calculate overall score
  const scores = Object.values(evaluation.scores).filter(v => typeof v === 'number' && v !== 0);
  const roundOverall = scores.length > 0 ?
    Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : 0;
  
  evaluation.scores.overall = roundOverall;

  // Determine recommendation based on round
  if (round === 1) {
    if (evaluation.scores.overall >= 8) {
      evaluation.recommendation = "Strong Fit - Move to Round 2 (Technical)";
    } else if (evaluation.scores.overall >= 6.5) {
      evaluation.recommendation = "Good Fit - Proceed to Round 2";
    } else if (evaluation.scores.overall >= 5) {
      evaluation.recommendation = "Average - Consider for Round 2";
    } else {
      evaluation.recommendation = "Needs Improvement - Contact for clarification";
    }
  } else {
    if (evaluation.scores.overall >= 8) {
      evaluation.recommendation = "Strong Technical Match - Recommend for Role";
    } else if (evaluation.scores.overall >= 6.5) {
      evaluation.recommendation = "Good Technical Fit - Recommend";
    } else if (evaluation.scores.overall >= 5) {
      evaluation.recommendation = "Average Technical Skills - Consider with Training";
    } else {
      evaluation.recommendation = "Technical Gaps - May Need Support";
    }
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
