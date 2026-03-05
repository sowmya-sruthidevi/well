# 🎯 Quick Reference - Bot Interview Feature

## 🚀 Quick Start Guide

### **1. Access the Bot Interview**
```
URL: http://localhost:3000/bot-interview
Route: `/bot-interview` (Protected - requires login)
```

### **2. Start the Application**

**Backend (Terminal 1):**
```bash
cd ats-backend
npm install  # if needed
npm start
# Runs on: http://localhost:5000
```

**Frontend (Terminal 2):**
```bash
cd interview-frontend
npm install  # if needed
npm start
# Runs on: http://localhost:3000
```

### **3. Login & Access Interview**
1. Navigate to `http://localhost:3000`
2. Login with your credentials
3. Click on "Bot Interview" or go to `/bot-interview`
4. Click "Start Interview" to begin

---

## 📋 Interview Process

### **Stage 1: Interview Start**
- System loads 5 random questions
- Session ID created
- Questions displayed with time limits

### **Stage 2: Answer Questions**
- Read question on screen
- **Answer Method (Choose One):**
  - 🎤 Speak into microphone (Web Speech API)
  - ⌨️ Type your answer
  - 📹 Optional: Enable webcam

### **Stage 3: Real-time Evaluation**
- Click "Submit Answer"
- AI (GPT-4) evaluates response in seconds
- Immediate feedback shown
- Score displayed (0-10)

### **Stage 4: Interview Results**
- After all 5 questions answered
- System generates comprehensive evaluation
- **Results Include:**
  - 5 Competency Scores (0-10 each)
  - Overall Score (0-100)
  - Top Strengths
  - Areas for Improvement
  - Hiring Recommendation

---

## 📊 Evaluation Metrics

```
┌─────────────────────────────────────┐
│     INTERVIEW EVALUATION SCORES     │
├─────────────────────────────────────┤
│ Communication Skills:      8.5/10   │
│ Problem Solving:           7.8/10   │
│ Leadership Potential:      7.2/10   │
│ Culture Fit:               8.0/10   │
│ Technical Knowledge:       8.3/10   │
├─────────────────────────────────────┤
│ OVERALL SCORE:            79% ⭐⭐  │
├─────────────────────────────────────┤
│ Recommendation:                     │
│ "Good Fit - Recommended"            │
└─────────────────────────────────────┘
```

---

## 🔌 API Endpoints

### **1. Start Interview Session**
```bash
POST http://localhost:5000/api/bot-interview/start
Headers: Authorization: Bearer {token}
Response:
{
  "sessionId": "uuid",
  "totalQuestions": 5,
  "questions": [...]
}
```

### **2. Submit Answer**
```bash
POST http://localhost:5000/api/bot-interview/submit-answer
Headers: Authorization: Bearer {token}
Body: {
  "sessionId": "uuid",
  "questionId": "id",
  "answer": "user's answer text"
}
Response:
{
  "answerQuality": 8,
  "feedback": "Clear and concise answer...",
  "answeredQuestions": 1,
  "totalQuestions": 5
}
```

### **3. Finish Interview**
```bash
POST http://localhost:5000/api/bot-interview/finish
Headers: Authorization: Bearer {token}
Body: {
  "sessionId": "uuid",
  "duration": 300  // seconds
}
Response:
{
  "scores": {
    "communicationSkills": 8.5,
    "problemSolving": 7.8,
    "leadershipPotential": 7.2,
    "cultureFit": 8.0,
    "technicalKnowledge": 8.3
  },
  "overallScore": 79,
  "strengths": [...],
  "improvements": [...],
  "recommendation": "Good Fit..."
}
```

### **4. Get Session Details**
```bash
GET http://localhost:5000/api/bot-interview/session/{sessionId}
Headers: Authorization: Bearer {token}
```

---

## 🛠️ Environment Setup

### **.env Configuration** (ats-backend)
```env
# MongoDB
MONGO_URI=mongodb://localhost:27017/ats_db

# OpenAI (Optional but recommended)
OPENAI_API_KEY=sk-your-api-key-here
```

### **Get OpenAI API Key**
1. Go to https://platform.openai.com/api-keys
2. Create new secret key
3. Copy and paste in `.env`

---

## ⚙️ Technology Stack

### **Frontend**
- React 19.2.4
- React Router DOM 7.13.1
- Axios 1.13.6 (API calls)
- React Webcam 7.2.0 (Video capture)
- Web Speech API (Voice input/output)
- Tailwind CSS

### **Backend**
- Node.js + Express
- MongoDB + Mongoose
- OpenAI GPT-4o-mini
- Jsonwebtoken (Authentication)
- CORS enabled

---

## 🎤 Voice Features

### **Speech-to-Text (Input)**
- Uses Web Speech API
- Browser support: Chrome, Edge, Safari
- Supported languages: English (en-US)
- Real-time transcription

### **Text-to-Speech (Output)**
- Browser native Speech Synthesis API
- Questions read aloud automatically
- Adjustable speech rate/pitch

---

## 📁 Key Files

### **Frontend**
- [App.js](interview-frontend/src/App.js) - Routes
- [BotInterview.jsx](interview-frontend/src/pages/interview/BotInterview.jsx) - Main component
- [BotInterview.css](interview-frontend/src/pages/interview/BotInterview.css) - Styling

### **Backend**
- [botInterviewController.js](ats-backend/controllers/botInterviewController.js) - Business logic
- [botInterview.js (Route)](ats-backend/routes/botInterview.js) - API routes
- [BotInterview.js (Model)](ats-backend/models/BotInterview.js) - Schema
- [InterviewQuestion.js](ats-backend/models/InterviewQuestion.js) - Questions

---

## 🐛 Troubleshooting

### **Issue: Microphone not working**
- ✅ Check browser permissions
- ✅ Ensure HTTPS in production
- ✅ Try Chrome/Edge (best support)

### **Issue: No AI feedback**
- ✅ Check `OPENAI_API_KEY` in `.env`
- ✅ Verify API key is active
- ✅ System works without it (fallback scoring)

### **Issue: Questions not loading**
- ✅ Ensure MongoDB is running
- ✅ Check database connection string
- ✅ Seed questions: `node seedQuestions.js`

### **Issue: Webcam permission denied**
- ✅ Grant camera access when prompted
- ✅ Webcam is optional (can use text input)

---

## 📊 Example Evaluation Results

```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "scores": {
    "communicationSkills": 8.5,
    "problemSolving": 7.8,
    "leadershipPotential": 7.2,
    "cultureFit": 8.0,
    "technicalKnowledge": 8.3
  },
  "overallScore": 79,
  "strengths": [
    "Clear and articulate communication",
    "Structured problem-solving approach",
    "Strong technical foundation"
  ],
  "improvements": [
    "Provide more specific examples",
    "Demonstrate more leadership initiative",
    "Elaborate on complex concepts"
  ],
  "recommendation": "Good Fit - Recommended",
  "answeredQuestions": 5,
  "totalQuestions": 5
}
```

---

## 💡 Tips for Better Performance

1. **Answer Clearly** - Speak directly into microphone
2. **Be Specific** - Provide examples and details
3. **Show Thinking** - Explain your reasoning
4. **Stay Confident** - Project confidence in voice
5. **Use Time** - Don't rush through answers
6. **Check Setup** - Ensure audio is working before start

---

## 🔐 Security Features

- ✅ JWT Authentication required
- ✅ Protected routes
- ✅ User-specific session tracking
- ✅ Secure API endpoints
- ✅ CORS configured

---

## 📞 Support

For issues or feature requests, check:
1. Backend console logs
2. Browser console (F12)
3. Network tab for API calls
4. Environment configuration

---

**Bot Interview Ready!** 🚀

Navigate to `http://localhost:3000/bot-interview` to start.
