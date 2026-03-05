import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import Editor from '@monaco-editor/react';
import AnimatedBot from '../../components/AnimatedBot';

function BotInterview() {
  const navigate = useNavigate();
  const [currentRound, setCurrentRound] = useState(1);
  const [roundSelection, setRoundSelection] = useState(true); // Show round selection screen
  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingText, setRecordingText] = useState("");
  const [isBotSpeaking, setIsBotSpeaking] = useState(false);
  const [isBotMuted, setIsBotMuted] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const webcamRef = useRef(null);
  const recognitionRef = useRef(null);
  const speechSynthesisRef = useRef(null);
  const sessionStartTime = useRef(null);
  const token = localStorage.getItem('token');

  // Initialize component - show round selection screen
  useEffect(() => {
    setLoading(false);
  }, []);

  // Initialize interview session
  const initializeInterview = async (round = 1, existingSessionId = null) => {
    try {
      setLoading(true);
      const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
      const payload = { round };
      if (existingSessionId) {
        payload.sessionId = existingSessionId;
      }

      const res = await axios.post(
        `${API_URL}/api/bot-interview/start`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSessionId(res.data.sessionId);
      setQuestions(res.data.questions);
      setCurrentRound(res.data.round || round);
      setRoundSelection(false);
      sessionStartTime.current = new Date();
      
      // Speak the first question
      if (res.data.questions.length > 0) {
        setTimeout(() => {
          speakQuestion(res.data.questions[0].question);
        }, 1000);
      }
    } catch (err) {
      console.error("Failed to start interview:", err);
      alert("Failed to start interview. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Start Round 1
  const startRound1 = () => {
    initializeInterview(1);
  };

  // Start Round 2 (after completing Round 1)
  const startRound2 = () => {
    if (!sessionId) {
      alert("Please complete Round 1 first");
      return;
    }
    initializeInterview(2, sessionId);
  };

  // Timer for current question
  useEffect(() => {
    if (!questions.length || evaluation || !sessionId) return;

    const currentQuestion = questions[currentQuestionIndex];
    const timeLimit = currentQuestion.timeLimit || 120;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          moveToNextQuestion();
          return timeLimit;
        }
        return prev - 1;
      });
    }, 1000);

    setTimeLeft(timeLimit);
    return () => clearInterval(interval);
  }, [currentQuestionIndex, questions, evaluation, sessionId]);

  // Initialize speech synthesis for bot
  useEffect(() => {
    speechSynthesisRef.current = window.speechSynthesis;
  }, []);

  // Speak question when it changes
  useEffect(() => {
    if (questions.length && !evaluation && currentQuestionIndex < questions.length) {
      const currentQuestion = questions[currentQuestionIndex];
      if (currentQuestion && !feedback) {
        speakQuestion(currentQuestion.question);
      }
    }
  }, [currentQuestionIndex, questions, evaluation]);

  // Function to make bot speak
  const speakQuestion = (text) => {
    if (isBotMuted) return; // Don't speak if muted
    
    if (speechSynthesisRef.current) {
      // Cancel any ongoing speech
      speechSynthesisRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;  // Slightly slower for clarity
      utterance.pitch = 1.1; // Slightly higher pitch
      utterance.volume = 1;

      utterance.onstart = () => setIsBotSpeaking(true);
      utterance.onend = () => setIsBotSpeaking(false);

      speechSynthesisRef.current.speak(utterance);
    }
  };

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsRecording(true);
      };

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        setRecordingText(finalTranscript || interimTranscript);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  // Toggle speech recording
  const toggleSpeechRecording = () => {
    if (recognitionRef.current) {
      if (isRecording) {
        recognitionRef.current.stop();
      } else {
        setRecordingText("");
        recognitionRef.current.start();
      }
    }
  };

  // Handle answer change
  const handleAnswerChange = (text) => {
    const currentQuestion = questions[currentQuestionIndex];
    setUserAnswers({
      ...userAnswers,
      [currentQuestion.questionId]: text
    });
  };

  // Submit answer to current question
  const submitAnswer = async () => {
    const currentQuestion = questions[currentQuestionIndex];
    const answer = userAnswers[currentQuestion.questionId] || recordingText;

    if (!answer.trim()) {
      alert("Please provide an answer before submitting.");
      return;
    }

    try {
      setSubmitting(true);
      const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
      const res = await axios.post(
        `${API_URL}/api/bot-interview/submit-answer`,
        {
          sessionId,
          questionId: currentQuestion.questionId,
          answer: answer.trim()
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setFeedback(res.data.feedback);
      setRecordingText("");
      setIsRecording(false);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      // Speak the feedback
      if (res.data.feedback) {
        speakQuestion(res.data.feedback);
      }

      // Auto-move to next question after 3 seconds
      setTimeout(() => {
        moveToNextQuestion();
      }, 3000);
    } catch (err) {
      console.error("Failed to submit answer:", err);
      alert("Failed to submit answer. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Move to next question
  const moveToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setFeedback(null);
      setRecordingText("");
    } else {
      finishInterview();
    }
  };

  // Finish interview and get evaluation
  const finishInterview = async () => {
    try {
      setSubmitting(true);
      const duration = sessionStartTime.current ? 
        Math.round((new Date() - sessionStartTime.current) / 1000) : 0;
      const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

      const res = await axios.post(
        `${API_URL}/api/bot-interview/finish`,
        {
          sessionId,
          duration
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setEvaluation(res.data);
    } catch (err) {
      console.error("Failed to finish interview:", err);
      alert("Failed to finish interview. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin mb-4">⏳</div>
          <p className="text-xl">Initializing your interview...</p>
        </div>
      </div>
    );
  }

  // Round Selection Screen
  if (roundSelection) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 p-12 text-center">
            <div className="text-6xl mb-6">🤖</div>
            <h1 className="text-4xl font-bold mb-4">Bot Interview</h1>
            <p className="text-gray-300 mb-2 text-lg">Two-Round Technical Interview Process</p>
            <p className="text-amber-400 font-semibold mb-8">✓ Both rounds required for all candidates</p>
            
            <div className="space-y-4 mb-12">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6 text-left">
                <h2 className="text-xl font-semibold text-blue-400 mb-2">📋 Round 1: Behavioral & General</h2>
                <p className="text-gray-300">Answer general questions about yourself, leadership, problem-solving, and professional experience. Duration: ~10 minutes</p>
                <p className="text-blue-300 text-sm mt-3">→ 5 questions covering communication, leadership, and cultural fit</p>
              </div>
              
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-6 text-left">
                <h2 className="text-xl font-semibold text-purple-400 mb-2">💻 Round 2: Technical (Q&A + Coding)</h2>
                <p className="text-gray-300">Answer in-depth questions about technical architecture, databases, microservices, and write actual code to solve coding challenges. Duration: ~15 minutes</p>
                <p className="text-purple-300 text-sm mt-3">→ Mix of technical stack questions and coding problems to test your practical skills</p>
              </div>
            </div>

            <button
              onClick={startRound1}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-4 px-8 rounded-lg transition duration-300 shadow-lg hover:shadow-xl"
            >
              ▶️ Start Round 1: Behavioral
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Interview in progress
  if (!evaluation && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex];
    const currentAnswer = userAnswers[currentQuestion.questionId] || recordingText;

    return (
      <div className="min-h-screen bg-[#0f172a] text-white p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Bot Interview - Round {currentRound}</h1>
            <p className="text-gray-400 mt-1">Question {currentQuestionIndex + 1} of {questions.length}</p>
          </div>
          <div className="flex gap-3 items-center">
            <button
              onClick={() => {
                setIsBotMuted(!isBotMuted);
                if (!isBotMuted && speechSynthesisRef.current) {
                  speechSynthesisRef.current.cancel();
                }
              }}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                isBotMuted ? 'bg-gray-600 hover:bg-gray-700' : 'bg-green-600 hover:bg-green-700'
              }`}
              title={isBotMuted ? "Unmute bot" : "Mute bot"}
            >
              {isBotMuted ? '🔇 Muted' : '🔊 Sound On'}
            </button>
            <div className={`text-2xl font-bold px-6 py-2 rounded-lg ${
              timeLeft <= 30 ? 'bg-red-600' : 'bg-blue-600'
            }`}>
              ⏱️ {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Main interview area */}
          <div className="col-span-2">
            {/* Webcam and Bot Intro */}
            <div className="bg-gray-900 rounded-xl p-8 mb-6">
              <div className="flex gap-6 items-start">
                {/* Webcam */}
                <div className="flex-1">
                  <p className="text-sm text-gray-400 mb-3">You</p>
                  <Webcam
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="rounded-lg w-full"
                  />
                </div>

                {/* Bot Interviewer */}
                <div className="flex-1">
                  <p className="text-sm text-gray-400 mb-3">Bot Interviewer</p>
                  <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg p-8 text-center relative">
                    <AnimatedBot isSpeaking={isBotSpeaking} />
                    <p className="text-sm mt-4">
                      {isBotSpeaking ? '🔊 Speaking...' : '🎤 Listening...'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Question */}
            <div className="bg-gray-900 rounded-xl p-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-cyan-400">
                  Question {currentQuestionIndex + 1}
                </h2>
                <button
                  onClick={() => speakQuestion(currentQuestion.question)}
                  disabled={isBotSpeaking}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 rounded-lg text-sm font-semibold transition flex items-center gap-2"
                  title="Hear question again"
                >
                  🔊 Repeat
                </button>
              </div>
              <p className="text-lg">{currentQuestion.question}</p>
            </div>

            {/* Answer Input */}
            <div className="bg-gray-900 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-bold mb-4">Your Answer</h3>
              
              {(currentQuestion.category === 'technical' || currentQuestion.category === 'technical-coding') ? (
                <>
                  {/* Code Editor for Technical & Coding Questions */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold mb-2">Select Programming Language:</label>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="w-full md:w-48 bg-gray-800 text-white p-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                      <option value="cpp">C++</option>
                      <option value="csharp">C#</option>
                      <option value="typescript">TypeScript</option>
                      <option value="go">Go</option>
                      <option value="rust">Rust</option>
                      <option value="sql">SQL</option>
                    </select>
                  </div>
                  
                  <div className="border border-gray-700 rounded-lg overflow-hidden mb-4 bg-gray-800">
                    <Editor
                      height="300px"
                      language={selectedLanguage}
                      value={currentAnswer}
                      onChange={(value) => handleAnswerChange(value || "")}
                      theme="vs-dark"
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        wordWrap: 'on',
                        scrollBeyondLastLine: false,
                        tabSize: 2
                      }}
                    />
                  </div>
                  <p className="text-sm text-gray-400 mb-4">💡 Write your solution in the language selected above</p>
                </>
              ) : (
                <>
                  {/* Text Answer for Behavioral Questions */}
                  <textarea
                    value={currentAnswer}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    placeholder="Type your answer here or use voice recording..."
                    className="w-full bg-gray-800 text-white p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 mb-4"
                    rows={5}
                  />

                  {/* Voice Recording */}
                  <div className="flex gap-3 items-center">
                    <button
                      onClick={toggleSpeechRecording}
                      disabled={submitting}
                      className={`px-6 py-2 rounded-lg font-semibold transition ${
                        isRecording
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-purple-600 hover:bg-purple-700"
                      } disabled:opacity-50`}
                    >
                      {isRecording ? "🛑 Stop Recording" : "🎤 Start Recording"}
                    </button>
                    {isRecording && (
                      <span className="text-red-400 font-semibold animate-pulse">● Recording...</span>
                    )}
                  </div>
                </>
              )}

              {/* Feedback from previous answer */}
              {feedback && (
                <div className="mt-4 p-4 bg-green-900 bg-opacity-30 border border-green-700 rounded-lg">
                  <p className="text-green-400 font-semibold">Feedback:</p>
                  <p className="text-green-200 mt-2">{feedback}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={submitAnswer}
                disabled={submitting || !currentAnswer.trim()}
                className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting..." : "Submit Answer"}
              </button>
              {currentQuestionIndex === questions.length - 1 && (
                <button
                  onClick={finishInterview}
                  disabled={submitting}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 rounded-lg transition disabled:opacity-50"
                >
                  {submitting ? "Finishing..." : "Finish Interview"}
                </button>
              )}
            </div>
          </div>

          {/* Right Sidebar - Progress */}
          <div className="bg-gray-900 rounded-xl p-6 h-fit sticky top-6">
            <h3 className="text-lg font-bold mb-4 text-yellow-300">Progress</h3>
            
            {/* Question List */}
            <div className="space-y-2 mb-6">
              {questions.map((q, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg cursor-pointer transition ${
                    idx === currentQuestionIndex
                      ? "bg-cyan-500 bg-opacity-20 border border-cyan-500"
                      : userAnswers[q.questionId]
                      ? "bg-green-500 bg-opacity-20 border border-green-600"
                      : "bg-gray-800 border border-gray-700"
                  }`}
                  onClick={() => !submitting && setCurrentQuestionIndex(idx)}
                >
                  <p className="text-sm font-semibold">Q{idx + 1}</p>
                  {userAnswers[q.questionId] && (
                    <p className="text-xs text-green-400 mt-1">✅ Answered</p>
                  )}
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-400">Questions Answered</p>
              <p className="text-2xl font-bold text-cyan-400">
                {Object.keys(userAnswers).length}/{questions.length}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Results page
  if (evaluation) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Interview Results</h1>
            <p className="text-gray-400 mt-1">Your performance evaluation</p>
          </div>
          <div className={`text-4xl font-bold px-8 py-4 rounded-lg ${
            evaluation.overallScore >= 7 ? 'bg-green-900 text-green-400' :
            evaluation.overallScore >= 5 ? 'bg-yellow-900 text-yellow-400' :
            'bg-red-900 text-red-400'
          }`}>
            {evaluation.overallScore?.toFixed(1)}/10
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left: Scores */}
          <div className="col-span-2">
            <div className="bg-gray-900 rounded-xl p-6 mb-6">
              <h2 className="text-xl font-bold mb-6 text-cyan-400">Performance Scores</h2>
              <div className="space-y-4">
                {Object.entries(evaluation.scores || {})
                  .filter(([key, value]) => key !== 'overall' && typeof value === 'number')
                  .map(([key, score]) => (
                  <div key={key}>
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className={`font-bold ${
                        score >= 8 ? 'text-green-400' :
                        score >= 6 ? 'text-yellow-400' :
                        'text-orange-400'
                      }`}>
                        {score.toFixed(1)}/10
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          score >= 8 ? 'bg-green-500' :
                          score >= 6 ? 'bg-yellow-500' :
                          'bg-orange-500'
                        }`}
                        style={{ width: `${(score / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths */}
            {evaluation.strengths && evaluation.strengths.length > 0 && (
              <div className="bg-green-900 bg-opacity-30 border border-green-700 rounded-xl p-6 mb-6">
                <h2 className="text-lg font-bold text-green-400 mb-4">✅ Strengths</h2>
                <ul className="space-y-2">
                  {evaluation.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green-400 mr-3">•</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Areas for Improvement */}
            {evaluation.improvements && evaluation.improvements.length > 0 && (
              <div className="bg-orange-900 bg-opacity-30 border border-orange-700 rounded-xl p-6">
                <h2 className="text-lg font-bold text-orange-400 mb-4">🎯 Areas for Improvement</h2>
                <ul className="space-y-2">
                  {evaluation.improvements.map((improvement, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-orange-400 mr-3">•</span>
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right: Summary */}
          <div className="bg-gray-900 rounded-xl p-6 h-fit">
            {/* Recommendation */}
            <div className={`p-4 rounded-lg mb-6 ${
              evaluation.overallScore >= 8 ? 'bg-green-900 bg-opacity-20 border border-green-700' :
              evaluation.overallScore >= 6 ? 'bg-yellow-900 bg-opacity-20 border border-yellow-700' :
              'bg-red-900 bg-opacity-20 border border-red-700'
            }`}>
              <p className={`font-bold ${
                evaluation.overallScore >= 8 ? 'text-green-400' :
                evaluation.overallScore >= 6 ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {evaluation.recommendation}
              </p>
            </div>

            {/* Analysis */}
            {evaluation.aiAnalysis && (
              <div className="p-4 bg-blue-900 bg-opacity-20 border border-blue-700 rounded-lg">
                <p className="text-sm text-blue-300 font-semibold mb-2">📝 Analysis</p>
                <p className="text-sm text-gray-300">{evaluation.aiAnalysis}</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8 justify-center flex-wrap">
          {currentRound === 1 && (
            <button
              onClick={startRound2}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition shadow-lg"
            >
              ➜ Proceed to Round 2 (Technical Q&A + Coding)
            </button>
          )}
          
          {currentRound === 2 && (
            <button
              onClick={() => navigate('/student-dashboard')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition shadow-lg"
            >
              ✅ Complete Interview
            </button>
          )}
          
          <button
            onClick={() => {
              setRoundSelection(true);
              setEvaluation(null);
              setQuestions([]);
              setCurrentQuestionIndex(0);
            }}
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-8 rounded-lg transition shadow-lg"
          >
            🔄 Start Over
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default BotInterview;
