const mongoose = require("mongoose");
require("dotenv").config();

const InterviewQuestion = require("../models/InterviewQuestion");

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

const questions = [
  // Behavioral Questions
  {
    questionText: "Tell me about yourself and your professional background.",
    category: "behavioral",
    difficulty: "easy",
    evaluationCriteria: [
      "Clear and concise introduction",
      "Relevant work experience highlighted",
      "Career progression explained",
      "Personal strengths mentioned"
    ],
    suggestedAnswerKeyPoints: [
      "Brief background (education, experience)",
      "Key achievements or projects",
      "Why you're interested in this role",
      "Career goals alignment"
    ],
    followUpPrompt: "What specific achievements are you most proud of?",
    timeLimit: 120
  },
  {
    questionText: "Describe a situation where you faced a difficult problem at work and how you solved it.",
    category: "problem-solving",
    difficulty: "medium",
    evaluationCriteria: [
      "Clear problem identification",
      "Logical problem-solving approach",
      "Action taken and results",
      "Learning from the experience"
    ],
    suggestedAnswerKeyPoints: [
      "Use STAR method - Situation, Task, Action, Result",
      "Show analytical thinking",
      "Demonstrate resourcefulness",
      "Quantify impact if possible"
    ],
    followUpPrompt: "What would you do differently if faced with a similar challenge?",
    timeLimit: 180
  },
  {
    questionText: "How do you handle stress and pressure in your workplace?",
    category: "behavioral",
    difficulty: "medium",
    evaluationCriteria: [
      "Self-awareness about stress",
      "Practical coping mechanisms",
      "Maintains productivity under pressure",
      "Seeks help when needed"
    ],
    suggestedAnswerKeyPoints: [
      "Identify stress management techniques",
      "Work prioritization methods",
      "Physical or mental wellness practices",
      "Communication with team/management"
    ],
    followUpPrompt: "Can you give a specific example of managing a stressful project?",
    timeLimit: 120
  },
  {
    questionText: "Tell me about a time when you had to work with a difficult team member or manager.",
    category: "behavioral",
    difficulty: "hard",
    evaluationCriteria: [
      "Empathy and understanding",
      "Professional communication",
      "Conflict resolution skills",
      "Positive outcome achieved"
    ],
    suggestedAnswerKeyPoints: [
      "Stay objective about the situation",
      "Focus on understanding their perspective",
      "Actions taken to improve working relationship",
      "What you learned from the experience"
    ],
    followUpPrompt: "How did this experience change your team collaboration approach?",
    timeLimit: 180
  },
  {
    questionText: "Describe your leadership style and how you motivate your team.",
    category: "leadership",
    difficulty: "hard",
    evaluationCriteria: [
      "Clear definition of leadership approach",
      "Specific examples of team motivation",
      "Employee development focus",
      "Results and team performance"
    ],
    suggestedAnswerKeyPoints: [
      "Recognition and appreciation",
      "Clear communication and goals",
      "Delegation and trust",
      "Professional growth opportunities"
    ],
    followUpPrompt: "Tell me about a team member you helped develop professionally.",
    timeLimit: 180
  },

  // Technical Problem-Solving Questions
  {
    questionText: "How would you approach a technical problem you've never encountered before?",
    category: "technical",
    difficulty: "medium",
    evaluationCriteria: [
      "Systematic problem-solving approach",
      "Resource utilization",
      "Communication of unknowns",
      "Learning mindset"
    ],
    suggestedAnswerKeyPoints: [
      "Break down the problem",
      "Research and documentation review",
      "Ask clarifying questions",
      "Test hypotheses methodically",
      "Document learnings"
    ],
    followUpPrompt: "What tools or resources would you use?",
    timeLimit: 120
  },
  {
    questionText: "Tell me about the most challenging technical project you've completed.",
    category: "technical",
    difficulty: "hard",
    evaluationCriteria: [
      "Technical complexity explained",
      "Problem-solving approach",
      "Team collaboration",
      "Results and impact"
    ],
    suggestedAnswerKeyPoints: [
      "Project scope and objectives",
      "Technical challenges faced",
      "Solutions implemented",
      "Technologies and tools used",
      "Measurable outcomes"
    ],
    followUpPrompt: "What would you do differently if you started over?",
    timeLimit: 180
  },

  // Culture Fit Questions
  {
    questionText: "Why are you interested in working for our company specifically?",
    category: "culture",
    difficulty: "medium",
    evaluationCriteria: [
      "Company research demonstrated",
      "Alignment with company values",
      "Personal motivation clarity",
      "Long-term interest shown"
    ],
    suggestedAnswerKeyPoints: [
      "Company mission and vision alignment",
      "Specific products or initiatives admired",
      "Company culture fit",
      "Career growth opportunities",
      "Contribution you can make"
    ],
    followUpPrompt: "What excites you most about this role?",
    timeLimit: 120
  },
  {
    questionText: "Describe a time when you had to adapt to significant change at work.",
    category: "behavioral",
    difficulty: "medium",
    evaluationCriteria: [
      "Flexibility and adaptability",
      "Positive attitude toward change",
      "Proactive approach",
      "Results achieved"
    ],
    suggestedAnswerKeyPoints: [
      "Specific change scenario",
      "Initial reaction and concerns",
      "Steps taken to adapt",
      "New skills or perspectives gained",
      "Positive outcomes"
    ],
    followUpPrompt: "How would you handle an even bigger change?",
    timeLimit: 120
  },

  // Leadership and Initiative
  {
    questionText: "Tell me about a time when you took initiative beyond your job responsibilities.",
    category: "leadership",
    difficulty: "medium",
    evaluationCriteria: [
      "Initiative and proactiveness",
      "Ownership mentality",
      "Impact of the action",
      "Alignment with company goals"
    ],
    suggestedAnswerKeyPoints: [
      "Identified a gap or opportunity",
      "Took action without being asked",
      "Collaborated with others if needed",
      "Results and impact achieved",
      "What it taught you"
    ],
    followUpPrompt: "How did this initiative benefit the company?",
    timeLimit: 120
  },
  {
    questionText: "What are your top 3 strengths and how do they contribute to your success?",
    category: "behavioral",
    difficulty: "easy",
    evaluationCriteria: [
      "Self-awareness",
      "Relevant strengths selected",
      "Concrete examples provided",
      "Impact on work performance"
    ],
    suggestedAnswerKeyPoints: [
      "Pick strengths relevant to the role",
      "Provide specific examples",
      "Show measurable impact",
      "Link to job requirements"
    ],
    followUpPrompt: "Can you give me a recent example of one of these strengths in action?",
    timeLimit: 120
  },
  {
    questionText: "What areas are you looking to improve or develop professionally?",
    category: "behavioral",
    difficulty: "medium",
    evaluationCriteria: [
      "Self-awareness and humility",
      "Growth mindset",
      "Concrete improvement steps",
      "Relevance to the role"
    ],
    suggestedAnswerKeyPoints: [
      "Be honest but not disqualifying",
      "Show commitment to improvement",
      "Mention specific steps taken",
      "How new role will help growth",
      "Realistic timeline for development"
    ],
    followUpPrompt: "What's your plan to address this development area?",
    timeLimit: 120
  }
];

async function seedQuestions() {
  try {
    await InterviewQuestion.deleteMany({});
    const inserted = await InterviewQuestion.insertMany(questions);

    console.log(`✅ Successfully seeded ${inserted.length} interview questions`);

    // Display stats
    const stats = await InterviewQuestion.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      }
    ]);
    console.log("📊 Question distribution by category:", stats);

    const diffStats = await InterviewQuestion.aggregate([
      {
        $group: {
          _id: "$difficulty",
          count: { $sum: 1 }
        }
      }
    ]);
    console.log("📊 Question distribution by difficulty:", diffStats);

    process.exit();
  } catch (error) {
    console.log("❌ Seeding failed:", error.message);
    process.exit(1);
  }
}

seedQuestions();
