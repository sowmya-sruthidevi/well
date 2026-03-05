# Bot Interview Round 2: Technical Stack Interview

## Overview

Round 2 of the Bot Interview has been implemented as a dedicated **Technical Stack Interview** that asks candidates about their technical architecture, database choices, microservices, containerization, security, and best practices.

## Architecture Changes

### Backend Models

#### BotInterview Model
Updated to support multiple rounds with the following changes:

```javascript
{
  currentRound: Number (1 or 2),
  roundStatus: Map {
    'round1': { completed: Boolean, startedAt: Date, completedAt: Date },
    'round2': { completed: Boolean, startedAt: Date, completedAt: Date }
  },
  scores: {
    round1: { ... }, // Behavioral metrics
    round2: { ... }  // Technical metrics
  }
}
```

#### InterviewQuestion Model
Added support for technical-stack category:

```javascript
{
  category: "technical-stack" | "behavioral" | "technical" | ... ,
  round: 1 | 2
}
```

### Backend Controller

#### Bot Interview Controller (`botInterviewController.js`)

**startInterview()**
- Now accepts `round` parameter (1 or 2)
- Can accept existing `sessionId` to load Round 2 with the same session
- Generates different questions based on round:
  - **Round 1**: Tell me about yourself, technical questions, behavioral questions
  - **Round 2**: Technical stack deep-dive questions (5 questions from technical-stack category)

**finishInterview()**
- Calculates round-specific scores
- Returns `canContinueToNextRound` flag for Round 1
- Allows progression from Round 1 → Round 2

**evaluateInterview(session, round)**
- Round-specific evaluation criteria:
  - **Round 1**: Communication Skills, Problem Solving, Leadership Potential, Culture Fit, Technical Knowledge
  - **Round 2**: Technical Depth, Stack Knowledge, Architecture Understanding, Best Practices, Problem Solving

### Frontend Components

#### BotInterview Component (`interview-frontend/src/pages/interview/BotInterview.jsx`)

**State Management**
```javascript
const [currentRound, setCurrentRound] = useState(1);
const [roundSelection, setRoundSelection] = useState(true);
```

**New Functions**
- `initializeInterview(round, sessionId)` - Initialize interview for specific round
- `startRound1()` - Start behavioral round
- `startRound2()` - Start technical round (requires sessionId from Round 1)

**UI Screens**
1. **Round Selection Screen** - Shows overview of Round 1 & Round 2
2. **Interview Progress** - Displays current round number in header
3. **Results with Round Progression** - Shows "Proceed to Round 2" button after Round 1

## Round 2 Technical Stack Questions

### Question Categories

#### 1. Tech Stack Overview
- Q: "What is your preferred tech stack and why?"
- Evaluates: Understanding of architecture layers, technology choices, scalability

#### 2. Database Strategy
- Q: "SQL vs NoSQL - when would you use each?"
- Evaluates: ACID/BASE concepts, use case differentiation, trade-offs

#### 3. Architecture Patterns
- Q: "Explain microservices vs monolithic architecture"
- Evaluates: Service decomposition, scalability, distributed systems understanding

#### 4. Containerization & Orchestration
- Q: "Docker and Kubernetes - pros and cons?"
- Evaluates: Container concepts, orchestration knowledge, deployment strategies

#### 5. Performance & Caching
- Q: "Caching strategies in web applications"
- Evaluates: Multiple caching layers, invalidation strategies, performance impact

#### 6. API Design
- Q: "What makes a good REST API?"
- Evaluates: REST principles, HTTP methods, status codes, versioning

#### 7. Security Implementation
- Q: "How do you ensure security in your tech stack?"
- Evaluates: Authentication, authorization, encryption, vulnerability awareness

#### 8. CI/CD Pipeline
- Q: "What is CI/CD and how would you set it up?"
- Evaluates: Pipeline stages, testing strategy, deployment automation

#### 9. Cloud Platforms
- Q: "Experience with AWS/Azure/GCP - what services?"
- Evaluates: Platform familiarity, service knowledge, cost optimization

#### 10. Code Quality & Best Practices
- Q: "Key principles of clean code?"
- Evaluates: Code quality, maintainability, testing practices, team collaboration

## API Endpoints

### Start Interview with Round Selection
```
POST /api/bot-interview/start
Body: { 
  round: 1 | 2,
  sessionId?: "existing-session-id-for-round-2"
}
Response: {
  sessionId: "...",
  round: 1 | 2,
  totalQuestions: 5,
  questions: [...]
}
```

### Finish Interview Round
```
POST /api/bot-interview/finish
Body: {
  sessionId: "...",
  duration: 600
}
Response: {
  sessionId: "...",
  currentRound: 1 | 2,
  canContinueToNextRound: true/false,
  scores: {
    technicalDepth: 7.5,
    stackKnowledge: 8.2,
    architectureUnderstanding: 7.8,
    bestPractices: 7.2,
    problemSolving: 7.9,
    overall: 7.7
  },
  strengths: [...],
  improvements: [...],
  recommendation: "..."
}
```

## User Flow

### Round 1: Behavioral Interview
1. User clicks "Bot Interview" on dashboard
2. Sees round selection screen with Round 1 & Round 2 descriptions
3. Clicks "Start Round 1: Behavioral"
4. Answers 5 questions (Tell me about yourself + 4 related questions)
5. Receives Round 1 evaluation
6. If score >= 6.5: "Proceed to Round 2" button appears
7. If score < 6.5: "View Dashboard" button (Round 2 not recommended)

### Round 2: Technical Stack Interview
1. User clicks "Proceed to Round 2" (if eligible)
2. Answers 5 technical stack questions
3. Receives Round 2 evaluation with technical metrics
4. Clicks "Complete Interview" to finish
5. Can view combined results on dashboard

### Dashboard Integration
- Tracks both Round 1 and Round 2 completion status
- Displays separate scores for each round
- Shows overall recommendation combining both rounds

## Scoring Logic

### Round 1 Scores (Behavioral)
- **Communication Skills**: How clearly candidate explains themselves
- **Problem Solving**: Logical approach to challenges
- **Leadership Potential**: Initiative and influence
- **Culture Fit**: Values alignment and team orientation
- **Technical Knowledge**: Basic technical understanding

### Round 2 Scores (Technical)
- **Technical Depth**: Deep understanding of technologies
- **Stack Knowledge**: Familiarity with modern technologies
- **Architecture Understanding**: System design and scalability concepts
- **Best Practices**: Patterns, standards, optimization
- **Problem Solving**: Technical approach and trade-off analysis

## Database Seeding

Run the seed script to populate Round 2 questions:

```bash
cd ats-backend
node seed/interviewQuestionsSeed.js
```

This adds 10 new technical-stack questions with:
- Evaluation criteria for each question
- Suggested answer key points
- Time limits (120-180 seconds)
- Round indicator (2) and difficulty levels

## Session Management

### Session Lifecycle
1. **Round 1 Creation**: User starts Round 1 → new sessionId created
2. **Round 1 Completion**: Questions answered, evaluation stored
3. **Round 2 Initialization**: Reuse existing sessionId, load new questions
4. **Round 2 Completion**: Update roundStatus, calculate final score

### Data Persistence
- Single document per interview session
- Both round evaluations stored in `scores.round1` and `scores.round2`
- `roundStatus` tracks completion time for each round
- `answeredQuestions` updated for current round context

## Frontend Integration

### Updated BotInterview Component Features
- Round counter in header ("Round 1 of 2" / "Round 2 of 2")
- Dynamic button rendering based on round completion
- Smooth transition between rounds with progress indication
- Ability to restart and choose round again

### Navigation Flow
```
Dashboard
  ↓
Bot Interview Selection Screen
  ├─→ Start Round 1: Behavioral
  │   ├─→ Answer 5 questions
  │   └─→ Get Round 1 Evaluation
  │       ├─→ Score ≥ 6.5: "Proceed to Round 2" ✓
  │       └─→ Score < 6.5: "View Dashboard only"
  │
  └─→ (If Round 1 passed)
      Start Round 2: Technical
      ├─→ Answer 5 technical questions
      └─→ Get Round 2 Evaluation
          └─→ "Complete Interview"
              └─→ Dashboard

```

## Testing Round 2

### Manual Testing Steps
1. Start Bot Interview from Dashboard
2. Complete Round 1 with good answers
3. Verify "Proceed to Round 2" button appears
4. Click button and answer Round 2 questions
5. Verify Round 2 scores are calculated separately
6. Check database for both round scores in `scores.round1` and `scores.round2`

### Test Queries
```javascript
// Check Round 1 + Round 2 in database
db.botinterviews.findOne({ sessionId: "..." }).pretty()

// Verify scores structure
{
  scores: {
    round1: { communicationSkills, ... },
    round2: { technicalDepth, stackKnowledge, ... }
  },
  roundStatus: Map {
    'round1': { completed: true },
    'round2': { completed: true }
  }
}
```

## Configuration

### Environment Variables
- `OPENAI_API_KEY`: Required for AI-powered answer evaluation in both rounds
- `REACT_APP_API_URL`: Frontend API endpoint (e.g., http://localhost:5000)

### Round Parameters
- **Round 1**: 5 questions, focus on behavioral/general skills
- **Round 2**: 5 questions, focus on technical architecture and stack
- **Time limits**: 120-240 seconds per question depending on complexity

## Future Enhancements

1. **Round 3**: Coding problems specific to role
2. **Adaptive Questions**: Difficulty increases based on performance
3. **Detailed Feedback**: AI-generated personalized recommendations
4. **Interview Comparison**: Compare scores across multiple attempts
5. **Role-Specific Stacks**: Customize Round 2 questions by job title
6. **Live Interviewer Mode**: Real interviewer for Round 2
7. **Video Recording**: Record Round 2 for later review

## Dependencies

- **Backend**: Express, MongoDB, OpenAI API, Mongoose
- **Frontend**: React, Axios, React Router, TailwindCSS
- **Voice Features**: Web Speech API (browser native)

## Support

For issues or questions about Round 2 implementation:
1. Check database for sessionId and scores
2. Verify OpenAI API key is set
3. Check browser console for frontend errors
4. Review backend logs for API responses
5. Ensure InterviewQuestion collection has round 2 questions seeded
