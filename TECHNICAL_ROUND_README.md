# Technical Round Feature Documentation

## Overview
The Technical Round is a coding interview simulation that allows candidates to solve programming problems with live code execution. The system uses Docker containers to securely execute code in multiple languages.

## Features
- 🎯 5 pre-seeded coding problems (Two Sum, Reverse String, Palindrome, Valid Parentheses, Fibonacci)
- 💻 Monaco Editor integration for code editing
- 🐳 Docker-based secure code execution
- ⏱️ 45-minute session timeout
- 🧪 Test case evaluation (visible and hidden)
- 📊 Detailed result tracking in student dashboard
- 🌐 Support for JavaScript and Python (extendable to Java and C++)

## System Requirements

### Docker Installation (Required)
The technical round uses Docker containers to execute user code safely and securely. You MUST have Docker installed and running.

#### Install Docker:
1. **Windows**: Download Docker Desktop from https://www.docker.com/products/docker-desktop
2. **Mac**: Download Docker Desktop from https://www.docker.com/products/docker-desktop
3. **Linux**: Install Docker Engine using your package manager

#### Verify Docker Installation:
```bash
docker --version
```

#### Pull Required Docker Images:
```bash
docker pull node:18-alpine
docker pull python:3.9-alpine
# Optional for Java/C++ support:
# docker pull openjdk:11-jdk-slim
# docker pull gcc:11
```

### Backend Setup
```bash
cd ats-backend

# Install dependencies
npm install

# Seed technical problems (only needed once)
node seed/technicalProblemsSeed.js
```

### Frontend Setup
```bash
cd interview-frontend

# Install dependencies (including Monaco Editor)
npm install @monaco-editor/react

# Start development server
npm start
```

## Usage

### For Students:
1. Navigate to Dashboard
2. Click "Start Coding" on Technical Round card
3. Read the problem description
4. Select language (JavaScript or Python)
5. Write code in Monaco Editor
6. Click "Run Code" to test with custom input
7. Click "Submit" when ready for evaluation

### Code Execution Flow:
1. Code is written in TechnicalRound.jsx
2. Sent to backend via `/api/technical/run` or `/api/technical/submit`
3. Backend creates temporary directory with unique UUID
4. Code is written to temp file
5. Docker container is spawned with volume mount
6. Code executes with timeout (30 seconds)
7. Output/error captured and returned
8. Temp directory cleaned up

## API Endpoints

### POST /api/technical/start
- Starts a new technical round session
- Returns: sessionId, problem details, starter code
- Duration: 45 minutes

### POST /api/technical/run
- Executes code without evaluation
- Body: { sessionId, code, language, input }
- Returns: { success, output, error, executionTime }

### POST /api/technical/submit
- Submits code for full evaluation
- Body: { sessionId, code, language }
- Returns: { score, passedTests, totalTests, testResults, feedback }

### GET /api/technical/session/:sessionId
- Retrieves session details
- Returns: Session with problem and submission history

## Database Models

### TechnicalProblem
- title, description, difficulty, category
- starterCode (Map: language -> code)
- testCases (array with input, expectedOutput, hidden flag)
- constraints, hints

### TechnicalSession
- userId, problemId, sessionId
- startTime, expiresAt
- submissions (array with timestamp, code, result)
- finalScore, completed

### TechnicalAttempt
- userId, problemTitle, language
- finalCode, score, testsPassed, totalTests
- executionTime, feedback

## Security Features
- ✅ Docker container isolation
- ✅ Execution timeout (30 seconds per test)
- ✅ Temp directory with unique UUID
- ✅ Volume mounting for code access
- ✅ Process cleanup after execution
- ✅ JWT authentication for all endpoints

## Proctoring
- Webcam monitoring enabled during coding session
- Timer countdown visible at all times
- Auto-submit on timeout

## Scoring System
- Score = (passedTests / totalTests) * 100
- Feedback generated based on performance:
  - 100: "Perfect! All test cases passed!"
  - 80-99: "Great job! Almost there."
  - 50-79: "Good effort. Review failed test cases."
  - < 50: "Keep practicing. Focus on edge cases."

## Adding New Problems

Create a new seed file or update `technicalProblemsSeed.js`:
```javascript
{
  title: "Your Problem Title",
  description: "Problem description here",
  difficulty: "easy", // easy, medium, hard
  category: "Array", // Array, String, DP, etc.
  starterCode: new Map([
    ["javascript", "function solve(input) {\n  // Your code here\n}"],
    ["python", "def solve(input):\n    # Your code here\n    pass"]
  ]),
  testCases: [
    { input: "1", expectedOutput: "1", hidden: false },
    { input: "2", expectedOutput: "2", hidden: true }
  ],
  constraints: ["Constraint 1", "Constraint 2"],
  hints: ["Hint 1", "Hint 2"]
}
```

## Troubleshooting

### Docker not running:
```
Error: Cannot connect to Docker daemon
Solution: Start Docker Desktop application
```

### Port already in use:
```
Error: Port 5000 already in use
Solution: Change port in server.js or kill process using port 5000
```

### Monaco Editor not loading:
```
Solution: Ensure @monaco-editor/react is installed
npm install @monaco-editor/react
```

### Code execution timeout:
```
Solution: Optimize code or increase timeout in codeExecutionService.js
```

## Future Enhancements
- [ ] Add more problems (target: 50+)
- [ ] Support for more languages (C++, Java, Go)
- [ ] Real-time collaboration
- [ ] Code quality analysis
- [ ] Plagiarism detection
- [ ] Interview recording
- [ ] AI code review feedback
- [ ] Live interviewer join option

## Contributing
To add features or fix bugs:
1. Backend files: `ats-backend/controllers/technicalController.js`, `ats-backend/services/codeExecutionService.js`
2. Frontend files: `interview-frontend/src/pages/technical/TechnicalRound.jsx`
3. Test thoroughly with Docker running
4. Update this README with changes

## Support
For issues or questions, check:
- Docker installation: https://docs.docker.com/get-docker/
- Monaco Editor docs: https://microsoft.github.io/monaco-editor/
- Node.js child_process: https://nodejs.org/api/child_process.html
