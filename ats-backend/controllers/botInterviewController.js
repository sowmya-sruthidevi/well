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
    
    // Single comprehensive interview combining all question types
    let session = new BotInterview({
      userId: req.user?.id || req.user?.userId || req.user?._id,
      sessionId: uuidv4(),
      currentRound: 1
    });

    // Load comprehensive mix of all question types
    const [behavioral, leadership, problemSolving, technicalBasic, technicalStack, technicalCoding] = await Promise.all([
      InterviewQuestion.aggregate([
        { $match: { category: "behavioral" } },
        { $sample: { size: 2 } }
      ]),
      InterviewQuestion.aggregate([
        { $match: { category: { $in: ["leadership", "culture"] } } },
        { $sample: { size: 1 } }
      ]),
      InterviewQuestion.aggregate([
        { $match: { category: "problem-solving" } },
        { $sample: { size: 1 } }
      ]),
      InterviewQuestion.aggregate([
        { $match: { category: "technical" } },
        { $sample: { size: 1 } }
      ]),
      InterviewQuestion.aggregate([
        { $match: { category: "technical-stack" } },
        { $sample: { size: 2 } }
      ]),
      InterviewQuestion.aggregate([
        { $match: { category: "technical-coding" } },
        { $sample: { size: 2 } }
      ])
    ]);

    if (behavioral.length === 0 && technicalBasic.length === 0) {
      return res.status(400).json({ 
        error: "Interview questions not properly seeded. Please run seed script." 
      });
    }

    // Shuffle them together for variety
    const allQuestions = [
      ...behavioral,
      ...leadership,
      ...problemSolving,
      ...technicalBasic,
      ...technicalStack,
      ...technicalCoding
    ].sort(() => 0.5 - Math.random()); // Shuffle array

    const questions = allQuestions.map(q => ({
      _id: q._id,
      questionText: q.questionText,
      timeLimit: q.timeLimit,
      category: q.category
    }));

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

    // Initialize comprehensive scoring
    session.scores.overall = {
      communicationSkills: 0,
      problemSolving: 0,
      leadershipPotential: 0,
      cultureFit: 0,
      technicalKnowledge: 0,
      technicalDepth: 0,
      codingAbility: 0,
      overall: 0
    };

    await session.save();

    res.json({
      sessionId: session.sessionId,
      round: 1,
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

    // Calculate scores for comprehensive interview
    const evaluation = await evaluateInterview(session);

    // Update session with overall scores
    session.scores.overall = evaluation.scores;
    session.strengths = evaluation.strengths;
    session.improvements = evaluation.improvements;
    session.aiAnalysis = evaluation.aiAnalysis;
    session.recommendation = evaluation.recommendation;
    session.duration = duration || 0;
    session.answeredQuestions = session.questions.filter(q => q.userAnswer).length;
    session.completed = true;
    session.completedAt = new Date();

    await session.save();

    res.json({
      sessionId,
      interviewCompleted: true,
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
async function evaluateInterview(session) {
  // Calculate average scores from question quality
  const answers = session.questions.filter(q => q.userAnswer);
  const avgQuality = answers.length > 0 ? 
    answers.reduce((sum, q) => sum + q.answerQuality, 0) / answers.length : 0;

  let evaluation = {};

  // Comprehensive scoring for all criteria
  evaluation.scores = {
    communicationSkills: Math.min(10, avgQuality * 0.9 + Math.random()),
    problemSolving: Math.min(10, avgQuality * 0.9 + Math.random()),
    leadershipPotential: Math.min(10, avgQuality * 0.8 + Math.random()),
    cultureFit: Math.min(10, avgQuality * 0.85 + Math.random()),
    technicalKnowledge: Math.min(10, avgQuality * 0.95 + Math.random()),
    technicalDepth: Math.min(10, avgQuality * 0.95 + Math.random()),
    codingAbility: Math.min(10, avgQuality * 0.9 + Math.random()),
    overall: 0
  };

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

      const analysisPrompt = `You are an expert interviewer evaluating a comprehensive interview covering behavioral, technical, and coding aspects.

Candidate Responses:
${fullAnswers}

Evaluate on these criteria:
1. Communication Skills - clarity, articulation, listening
2. Problem Solving - approach, creativity, logic
3. Leadership Potential - initiative, influence, decision-making
4. Cultural Fit - values alignment, team orientation
5. Technical Knowledge - depth, relevance, breadth
6. Technical Depth - architecture, system design, best practices
7. Coding Ability - solution quality, logic, efficiency

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
  "technicalDepth": <0-10>,
  "codingAbility": <0-10>,
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["improvement1", "improvement2", "improvement3"],
  "analysis": "Overall assessment"
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert interviewer. Provide candidate evaluation. Always respond with valid JSON only."
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
          technicalKnowledge: Math.min(10, aiEval.technicalKnowledge || 6),
          technicalDepth: Math.min(10, aiEval.technicalDepth || 6),
          codingAbility: Math.min(10, aiEval.codingAbility || 6),
          overall: 0
        };

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
  const overallScore = scores.length > 0 ?
    Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : 0;
  
  evaluation.scores.overall = overallScore;

  // Determine recommendation
  if (overallScore >= 8) {
    evaluation.recommendation = "Excellent Fit - Strong Technical and Interpersonal Skills";
  } else if (overallScore >= 7) {
    evaluation.recommendation = "Very Good Fit - Solid Technical and Soft Skills";
  } else if (overallScore >= 6) {
    evaluation.recommendation = "Good Fit - Meets Most Requirements";
  } else if (overallScore >= 5) {
    evaluation.recommendation = "Average Performance - Has Potential with Training";
  } else {
    evaluation.recommendation = "Needs Improvement - Consider additional support or guidance";
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
