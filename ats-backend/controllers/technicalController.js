const TechnicalProblem = require("../models/TechnicalProblem");
const TechnicalSession = require("../models/TechnicalSession");
const TechnicalAttempt = require("../models/TechnicalAttempt");
const codeExecutionService = require("../services/codeExecutionService");
const openai = require("../config/openai");

// Start a technical round
exports.startTechnical = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get 1 easy/medium problem and 1 medium/hard problem
    const easyMediumProblems = await TechnicalProblem.aggregate([
      { $match: { difficulty: { $in: ["easy", "medium"] } } },
      { $sample: { size: 1 } }
    ]);
    
    const mediumHardProblems = await TechnicalProblem.aggregate([
      { $match: { difficulty: { $in: ["medium", "hard"] } } },
      { $sample: { size: 1 } }
    ]);
    
    if (easyMediumProblems.length === 0 || mediumHardProblems.length === 0) {
      return res.status(404).json({ error: "Not enough problems available" });
    }
    
    const problems = [easyMediumProblems[0], mediumHardProblems[0]];
    
    // Handle both Map and plain object for starterCode
    const getStarterCode = (problem, lang) => {
      if (problem.starterCode?.get) {
        return problem.starterCode.get(lang) || "";
      }
      return problem.starterCode?.[lang] || "";
    };
    
    // Create session with multiple problems (45 minutes)
    const session = await TechnicalSession.create({
      userId,
      problemId: problems[0]._id, // Primary problem for tracking
      problems: problems.map(p => ({
        problemId: p._id,
        code: getStarterCode(p, "javascript"),
        language: "javascript"
      })),
      language: "javascript",
      code: getStarterCode(problems[0], "javascript"),
      expiresAt: new Date(Date.now() + 45 * 60000)
    });
    
    // Return problems without hidden test cases
    const problemsData = problems.map(problem => {
      const visibleTestCases = problem.testCases.filter(tc => !tc.isHidden);
      return {
        _id: problem._id,
        title: problem.title,
        description: problem.description,
        difficulty: problem.difficulty,
        category: problem.category,
        constraints: problem.constraints,
        hints: problem.hints,
        testCases: visibleTestCases,
        starterCode: problem.starterCode
      };
    });
    
    res.json({
      sessionId: session._id,
      problems: problemsData,
      expiresAt: session.expiresAt
    });
    
  } catch (error) {
    console.error("Start technical error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Run code
exports.runCode = async (req, res) => {
  try {
    const { sessionId, code, language, input } = req.body;
    
    if (!sessionId || !code || !language) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const session = await TechnicalSession.findById(sessionId);
    
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    
    if (new Date() > session.expiresAt) {
      return res.status(400).json({ error: "Time expired" });
    }
    
    // Execute code
    const result = await codeExecutionService.executeCode(
      code,
      language,
      input || "",
      5000
    );
    
    // Update session code
    session.code = code;
    session.language = language;
    await session.save();
    
    // Check if output is empty or undefined
    let warning = null;
    if (result.success && (!result.output || result.output.trim() === '' || result.output === 'undefined')) {
      warning = "⚠️ Your code runs but produces no output. Make sure to implement the solution and return a result.";
    }
    
    res.json({
      success: result.success && result.output && result.output.trim() !== '' && result.output !== 'undefined',
      output: result.output,
      error: result.error || warning,
      executionTime: result.executionTime,
      warning: warning
    });
    
  } catch (error) {
    console.error("Run code error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Submit code for evaluation
exports.submitCode = async (req, res) => {
  try {
    const { sessionId, code, language } = req.body;
    
    if (!sessionId || !code || !language) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const session = await TechnicalSession.findById(sessionId)
      .populate("problemId");
    
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    
    if (session.completed) {
      return res.status(400).json({ error: "Already submitted" });
    }
    
    const problem = session.problemId;
    const testResults = [];
    
    let passedTests = 0;
    let totalExecutionTime = 0;
    
    // Run against all test cases
    for (const testCase of problem.testCases) {
      const result = await codeExecutionService.executeCode(
        code,
        language,
        testCase.input,
        5000
      );
      
      // Normalize outputs for comparison
      const normalizeOutput = (output) => {
        return output
          .trim()
          .replace(/\s+/g, ' ')
          .replace(/\r\n/g, '\n')
          .toLowerCase();
      };
      
      const actualNormalized = normalizeOutput(result.output);
      const expectedNormalized = normalizeOutput(testCase.expectedOutput);
      
      const passed = result.success && actualNormalized === expectedNormalized;
      
      if (passed) passedTests++;
      
      testResults.push({
        passed,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: result.output,
        executionTime: result.executionTime,
        error: result.error
      });
      
      totalExecutionTime += result.executionTime;
    }
    
    const score = Math.round((passedTests / problem.testCases.length) * 100);
    
    // Generate AI feedback based on the code
    let aiFeedback = "";
    try {
      const prompt = `Analyze this ${language} code solution for the problem "${problem.title}":

Problem Description:
${problem.description}

Submitted Code:
${code}

Test Results: ${passedTests}/${problem.testCases.length} passed (Score: ${score}/100)

Provide a brief professional analysis covering:
1. Code quality and approach
2. Time/space complexity if applicable
3. What worked well
4. Areas for improvement
5. Suggestions for optimization

Keep the response concise (max 150 words).`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are an expert technical interviewer analyzing coding solutions. Be constructive and educational." },
          { role: "user", content: prompt }
        ],
        max_tokens: 300,
        temperature: 0.7,
      });

      aiFeedback = completion.choices[0].message.content;
    } catch (aiError) {
      console.error("AI feedback generation error:", aiError);
      aiFeedback = "AI analysis temporarily unavailable.";
    }
    
    // Save submission
    session.submissions.push({
      code,
      language,
      testResults,
      score
    });
    
    session.finalScore = score;
    session.completed = true;
    session.code = code;
    session.language = language;
    
    await session.save();
    
    // Save attempt for dashboard
    let feedback = "";
    if (score === 100) {
      feedback = "Perfect! All test cases passed. Excellent problem-solving skills.";
    } else if (score >= 70) {
      feedback = "Good work! Most test cases passed. Review edge cases.";
    } else if (score >= 50) {
      feedback = "Decent attempt. Focus on correctness and edge cases.";
    } else {
      feedback = "Needs improvement. Review the problem and test cases carefully.";
    }
    
    await TechnicalAttempt.create({
      userId: session.userId,
      problemId: problem._id,
      problemTitle: problem.title,
      language,
      finalCode: code,
      score,
      testsPassed: passedTests,
      totalTests: problem.testCases.length,
      executionTime: totalExecutionTime,
      feedback: feedback + "\n\nAI Analysis:\n" + aiFeedback
    });
    
    res.json({
      score,
      passedTests,
      totalTests: problem.testCases.length,
      testResults,
      feedback,
      aiFeedback,
      executionTime: totalExecutionTime
    });
    
  } catch (error) {
    console.error("Submit code error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get session status
exports.getSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await TechnicalSession.findById(sessionId)
      .populate("problemId");
    
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    
    res.json(session);
    
  } catch (error) {
    console.error("Get session error:", error);
    res.status(500).json({ error: error.message });
  }
};
