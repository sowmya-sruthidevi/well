const openai = require("../config/openai");

async function analyzeResumeWithAI(resumeText, jobDescription) {
  if (!resumeText || !jobDescription) {
    throw new Error("Resume text and job description are required");
  }

  // Limit resume length to control token usage
  const trimmedResume = resumeText.slice(0, 8000);

  const prompt = `
You are an ATS assistant.

1. Extract important technical skills from JOB DESCRIPTION.
2. Compare them with RESUME.
3. Return structured JSON:

{
 "jdKeywords": [],
 "matchedSkills": [],
 "missingSkills": [],
 "strengths": [],
 "improvementAreas": []
}

Return ONLY valid JSON. Do NOT add explanations.

RESUME:
${trimmedResume}

JOB DESCRIPTION:
${jobDescription}
`;

  try {
    console.log("STEP 1: Sending request to OpenAI...");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    console.log("STEP 2: OpenAI responded");

    let content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error("Empty response from OpenAI");
    }

    // Remove markdown wrappers if present
    content = content.replace(/```json|```/g, "").trim();


    try {
      const parsed = JSON.parse(content);
      console.log("AI PARSED SUCCESSFULLY");
      return parsed;
    } catch (err) {
      console.error("JSON PARSE ERROR:", err);
      throw new Error("Invalid AI JSON response");
    }

  } catch (error) {
    console.error("OPENAI ERROR:", error);
    throw new Error("OpenAI request failed");
  }
}

module.exports = analyzeResumeWithAI;