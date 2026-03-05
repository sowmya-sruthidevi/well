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
    timeLimit: 120,
    round: 1
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
    timeLimit: 120,
    round: 1
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
  },

  // Technical Coding Questions
  {
    questionText: "Write a function to reverse a string. Write the code in your preferred language.",
    category: "technical",
    difficulty: "easy",
    evaluationCriteria: [
      "Correct algorithm",
      "Code syntax and structure",
      "Handles edge cases",
      "Code clarity and readability"
    ],
    suggestedAnswerKeyPoints: [
      "Input validation",
      "Efficient approach",
      "Proper variable naming",
      "Comments for clarity",
      "Testing with examples"
    ],
    followUpPrompt: "Can you optimize it further or provide an alternative approach?",
    timeLimit: 180
  },
  {
    questionText: "Write a function to find the maximum sum of a subarray (Kadane's algorithm). Code in your preferred language.",
    category: "technical",
    difficulty: "medium",
    evaluationCriteria: [
      "Algorithm correctness",
      "Time complexity understanding",
      "Code implementation",
      "Edge case handling"
    ],
    suggestedAnswerKeyPoints: [
      "Understand the problem",
      "Dynamic programming approach",
      "Track current and max sum",
      "Handle negative numbers",
      "Optimize for O(n) time complexity"
    ],
    followUpPrompt: "What's the time and space complexity of your solution?",
    timeLimit: 180
  },
  {
    questionText: "Write a function to check if a string is a palindrome. Code in your preferred language.",
    category: "technical",
    difficulty: "easy",
    evaluationCriteria: [
      "Correct palindrome detection",
      "Case handling",
      "Special character handling",
      "Code efficiency"
    ],
    suggestedAnswerKeyPoints: [
      "Handle case insensitivity",
      "Consider spaces and punctuation",
      "Two-pointer approach",
      "Recursive or iterative solution",
      "Proper validation"
    ],
    followUpPrompt: "How would you handle special characters and spaces?",
    timeLimit: 180
  },
  {
    questionText: "Write a function to find all unique combinations of a given set. Code in your preferred language.",
    category: "technical",
    difficulty: "hard",
    evaluationCriteria: [
      "Correct combination generation",
      "No duplicates",
      "Recursive logic",
      "Efficient implementation"
    ],
    suggestedAnswerKeyPoints: [
      "Backtracking approach",
      "Base case definition",
      "Recursive case logic",
      "Memory efficient",
      "Proper result tracking"
    ],
    followUpPrompt: "How would you modify this to find permutations instead?",
    timeLimit: 240
  },
  {
    questionText: "Write a function to implement binary search on a sorted array. Code in your preferred language.",
    category: "technical",
    difficulty: "medium",
    evaluationCriteria: [
      "Correct binary search logic",
      "Proper boundary handling",
      "Time complexity O(log n)",
      "Error handling"
    ],
    suggestedAnswerKeyPoints: [
      "Mid-point calculation",
      "Left and right pointers",
      "Comparison logic",
      "Loop termination",
      "Return target index"
    ],
    followUpPrompt: "How would you handle duplicates in the array?",
    timeLimit: 180,
    round: 1
  },
  
  // ===== ROUND 2: TECHNICAL STACK QUESTIONS =====
  {
    questionText: "What is your preferred tech stack and why did you choose it? Explain the components (frontend, backend, database).",
    category: "technical-stack",
    difficulty: "medium",
    evaluationCriteria: [
      "Clear understanding of each layer",
      "Knowledge of technology choices",
      "Trade-offs awareness",
      "Practical experience mentioned",
      "Scalability considerations"
    ],
    suggestedAnswerKeyPoints: [
      "Frontend framework (React, Vue, Angular)",
      "Backend runtime/language (Node.js, Python, Java)",
      "Database choice (SQL vs NoSQL)",
      "Why these choices fit the use case",
      "Experience with chosen stack"
    ],
    followUpPrompt: "Have you used this stack in production? What challenges did you face?",
    timeLimit: 180,
    round: 2
  },
  {
    questionText: "Describe the differences between SQL and NoSQL databases. When would you use each?",
    category: "technical-stack",
    difficulty: "medium",
    evaluationCriteria: [
      "Understanding of both paradigms",
      "ACID vs BASE properties mentioned",
      "Use case differentiation",
      "Scalability considerations",
      "Real-world examples"
    ],
    suggestedAnswerKeyPoints: [
      "SQL: relational, ACID transactions, structured schema",
      "NoSQL: flexible schema, horizontal scalability",
      "SQL for transactional systems",
      "NoSQL for high-volume, unstructured data",
      "Examples: PostgreSQL, MongoDB, DynamoDB"
    ],
    followUpPrompt: "Have you used both? Compare a specific project experience.",
    timeLimit: 150,
    round: 2
  },
  {
    questionText: "Explain microservices architecture. What are the benefits and challenges compared to monolithic architecture?",
    category: "technical-stack",
    difficulty: "hard",
    evaluationCriteria: [
      "Clear architecture understanding",
      "Service decomposition knowledge",
      "API communication concepts",
      "Scalability and deployment benefits",
      "Challenges like distributed systems"
    ],
    suggestedAnswerKeyPoints: [
      "Monolithic: single codebase, easier to start",
      "Microservices: independent services, scalable",
      "Independent deployment and scaling",
      "Service-to-service communication (APIs, queues)",
      "Challenges: distributed debugging, data consistency, complexity"
    ],
    followUpPrompt: "Have you designed or maintained a microservices system? Describe the architecture.",
    timeLimit: 180,
    round: 2
  },
  {
    questionText: "What are the pros and cons of using containerization (Docker) and orchestration (Kubernetes)?",
    category: "technical-stack",
    difficulty: "hard",
    evaluationCriteria: [
      "Docker concepts understanding",
      "Container benefits clarity",
      "Kubernetes orchestration knowledge",
      "Deployment considerations",
      "Resource management awareness"
    ],
    suggestedAnswerKeyPoints: [
      "Docker: consistency, isolation, lightweight",
      "Kubernetes: orchestration, scaling, load balancing",
      "Environment parity across development and production",
      "Challenges: complexity, learning curve",
      "Resource overhead and management"
    ],
    followUpPrompt: "Have you deployed applications with Docker and Kubernetes?",
    timeLimit: 150,
    round: 2
  },
  {
    questionText: "Discuss caching strategies in a web application. Where would you implement caching?",
    category: "technical-stack",
    difficulty: "medium",
    evaluationCriteria: [
      "Caching layer understanding",
      "Multiple caching strategies mentioned",
      "Performance impact awareness",
      "Cache invalidation knowledge",
      "Practical implementation examples"
    ],
    suggestedAnswerKeyPoints: [
      "Client-side caching (browser cache, localStorage)",
      "Server-side caching (Redis, Memcached)",
      "Database query caching",
      "HTTP caching headers and strategies",
      "Cache invalidation and TTL management"
    ],
    followUpPrompt: "How would you handle cache invalidation in a distributed system?",
    timeLimit: 150,
    round: 2
  },
  {
    questionText: "Explain the concept of API design. What makes a good REST API?",
    category: "technical-stack",
    difficulty: "medium",
    evaluationCriteria: [
      "REST principles understanding",
      "HTTP methods usage",
      "Status codes knowledge",
      "Versioning approach",
      "Documentation and conventions"
    ],
    suggestedAnswerKeyPoints: [
      "Resource-based URLs",
      "Proper HTTP methods (GET, POST, PUT, DELETE)",
      "Appropriate status codes (200, 201, 400, 404, 500)",
      "Versioning strategy (v1, v2 in URL or header)",
      "Clear documentation and error handling"
    ],
    followUpPrompt: "Have you designed APIs for production systems? What did you learn?",
    timeLimit: 150,
    round: 2
  },
  {
    questionText: "How do you ensure security in your tech stack? What security measures would you implement?",
    category: "technical-stack",
    difficulty: "hard",
    evaluationCriteria: [
      "Security awareness",
      "Authentication knowledge",
      "Data protection understanding",
      "Encryption concepts",
      "Common vulnerabilities awareness"
    ],
    suggestedAnswerKeyPoints: [
      "Authentication (JWT, OAuth, sessions)",
      "Authorization and access control",
      "Data encryption in transit (HTTPS/TLS) and at rest",
      "Input validation and sanitization",
      "Protection against common attacks (SQL injection, XSS, CSRF)"
    ],
    followUpPrompt: "Have you implemented authentication in production? Describe the approach.",
    timeLimit: 180,
    round: 2
  },
  {
    questionText: "What is CI/CD? How would you set up a CI/CD pipeline for a web application?",
    category: "technical-stack",
    difficulty: "hard",
    evaluationCriteria: [
      "CI/CD concept understanding",
      "Pipeline stages knowledge",
      "Testing strategy awareness",
      "Deployment automation understanding",
      "Tools and best practices"
    ],
    suggestedAnswerKeyPoints: [
      "Continuous Integration: automated testing on code push",
      "Continuous Deployment: automated release to production",
      "Pipeline stages: code → build → test → deploy",
      "Tools: GitHub Actions, GitLab CI, Jenkins, CircleCI",
      "Testing stages and deployment strategies (blue-green, canary)"
    ],
    followUpPrompt: "Have you set up a CI/CD pipeline? Describe the tools and stages.",
    timeLimit: 150,
    round: 2
  },
  {
    questionText: "Describe your experience with cloud platforms (AWS, Azure, GCP). What services have you used?",
    category: "technical-stack",
    difficulty: "medium",
    evaluationCriteria: [
      "Cloud platform familiarity",
      "Service knowledge (Compute, Storage, Databases)",
      "Cost and scalability awareness",
      "Practical project experience",
      "Cloud architecture understanding"
    ],
    suggestedAnswerKeyPoints: [
      "Compute services (EC2, App Engine, Compute Engine)",
      "Storage solutions (S3, Cloud Storage, Blob Storage)",
      "Database services (RDS, Firestore, Cosmos DB)",
      "Managed services vs self-hosted trade-offs",
      "Cost optimization and resource scaling"
    ],
    followUpPrompt: "Walk through a specific cloud application you built.",
    timeLimit: 150,
    round: 2
  },
  {
    questionText: "What are the key principles of clean code and how do you maintain code quality in your projects?",
    category: "technical-stack",
    difficulty: "medium",
    evaluationCriteria: [
      "Code quality understanding",
      "Best practices knowledge",
      "Maintainability awareness",
      "Testing practices",
      "Team collaboration focus"
    ],
    suggestedAnswerKeyPoints: [
      "Readable, self-documenting code",
      "DRY principle (Don't Repeat Yourself)",
      "SOLID principles",
      "Code reviews and pair programming",
      "Automated testing and linting tools"
    ],
    followUpPrompt: "How do you enforce code quality standards in a team?",
    timeLimit: 120,
    round: 2
  },

  // ===== ROUND 2: TECHNICAL CODING QUESTIONS =====
  {
    questionText: "Write a function that finds the most common character in a string (excluding spaces). Explain your approach.",
    category: "technical-coding",
    difficulty: "easy",
    evaluationCriteria: [
      "Correct implementation",
      "Handles edge cases",
      "Time complexity consideration",
      "Code readability",
      "Proper explanation"
    ],
    suggestedAnswerKeyPoints: [
      "Use hash map/object to count characters",
      "Loop through string and count occurrences",
      "Find character with maximum count",
      "Return the most common character",
      "Handle edge cases (empty string, ties)"
    ],
    followUpPrompt: "How would you handle case sensitivity or multiple characters with the same frequency?",
    timeLimit: 300,
    round: 2
  },
  {
    questionText: "Implement a function to check if a string is a valid palindrome (considering only alphanumeric characters, case-insensitive).",
    category: "technical-coding",
    difficulty: "easy",
    evaluationCriteria: [
      "Correct palindrome logic",
      "Proper character filtering",
      "Case handling",
      "Efficient approach",
      "Edge case handling"
    ],
    suggestedAnswerKeyPoints: [
      "Filter to keep only alphanumeric characters",
      "Convert to lowercase",
      "Compare from start and end moving inward",
      "Return true if all characters match",
      "Handle empty and single character strings"
    ],
    followUpPrompt: "Can you optimize this to work in-place without creating new strings?",
    timeLimit: 240,
    round: 2
  },
  {
    questionText: "Write a function that removes duplicate characters from a string while maintaining the order of first appearance.",
    category: "technical-coding",
    difficulty: "medium",
    evaluationCriteria: [
      "Correct duplicate removal",
      "Order preservation",
      "Efficient algorithm",
      "Clean code",
      "Edge case handling"
    ],
    suggestedAnswerKeyPoints: [
      "Use a set to track seen characters",
      "Iterate through string once",
      "Only add character if not in set",
      "Add to set when encountered",
      "Handle empty strings and duplicates"
    ],
    followUpPrompt: "What if you needed to remove duplicates while keeping the last occurrence instead of first?",
    timeLimit: 240,
    round: 2
  },
  {
    questionText: "Implement a simple REST API endpoint in your preferred framework that returns a list of users. Include proper error handling.",
    category: "technical-coding",
    difficulty: "medium",
    evaluationCriteria: [
      "RESTful design principles",
      "Proper HTTP methods",
      "Error handling",
      "Response format",
      "Code structure"
    ],
    suggestedAnswerKeyPoints: [
      "Use GET for retrieving data",
      "Return JSON response",
      "Include proper status codes (200, 404, 500)",
      "Add error handling try-catch blocks",
      "Validate input parameters",
      "Use appropriate framework methods"
    ],
    followUpPrompt: "How would you add pagination and filtering to this endpoint?",
    timeLimit: 300,
    round: 2
  },
  {
    questionText: "Write a function to find all unique pairs in an array that sum to a target value. Return the pairs as a 2D array.",
    category: "technical-coding",
    difficulty: "hard",
    evaluationCriteria: [
      "Correct pair finding logic",
      "No duplicate pairs in result",
      "Efficient algorithm",
      "Proper data structures",
      "Edge case handling"
    ],
    suggestedAnswerKeyPoints: [
      "Use hash set for O(n) lookup",
      "Single pass through array",
      "Track seen numbers",
      "Check if complement exists",
      "Avoid duplicate pairs using set",
      "Return unique pairs"
    ],
    followUpPrompt: "What's the time and space complexity? Can you solve it without extra space?",
    timeLimit: 360,
    round: 2
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
