import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import GDRadarChart from '../../components/GDRadarChart';
import './GDRoom.css'; // Import CSS for blinking animation

function GDRoom() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [input, setInput] = useState("");
  const [evaluation, setEvaluation] = useState(null);
  const [timeLeft, setTimeLeft] = useState(5 * 60); // 5 minutes in seconds
  const [speakingBot, setSpeakingBot] = useState(null);
  const [userSpeakingTime, setUserSpeakingTime] = useState(0); // User speaking duration in seconds
  const [isMicActive, setIsMicActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isBotsDiscussing, setIsBotsDiscussing] = useState(false);
  const [aiFeedback, setAiFeedback] = useState(null); // Store AI feedback
  const [showingFeedback, setShowingFeedback] = useState(false); // Show feedback UI
  const [startTimeStamp, setStartTimeStamp] = useState(null); // Store start time separately
  const recognitionRef = useRef(null);
  const sessionRef = useRef(null);
  const evaluationRef = useRef(null);
  const webcamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microStreamRef = useRef(null);
  const token = localStorage.getItem('token');
  const MIN_SPEAKING_TIME = 30; // 30 seconds minimum

  useEffect(() => {
    sessionRef.current = session;
    evaluationRef.current = evaluation;
  }, [session, evaluation]);

  // Initialize GD session on mount
  useEffect(() => {
    const initializeSession = async () => {
      try {
        setTimeLeft(5 * 60); // Reset to 5:00 for fresh start
        setUserSpeakingTime(0); // Reset speaking time
        const API_URL = process.env.REACT_APP_API_URL || "";
        const res = await axios.post(
          `${API_URL}/api/gd/start`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        const now = Date.now();
        setStartTimeStamp(now); // Store start time separately
        setSession(res.data);
      } catch (err) {
        console.error("Failed to start GD:", err);
      }
    };
    initializeSession();
  }, [token]);

  // INITIALIZE MICROPHONE FOR AUDIO DETECTION AND SPEECH-TO-TEXT
  useEffect(() => {
    const initMicrophone = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        microStreamRef.current = stream;

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioContextRef.current = audioContext;

        const analyser = audioContext.createAnalyser();
        analyserRef.current = analyser;
        analyser.fftSize = 256;

        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const checkAudioLevel = () => {
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;

          // If audio level is above threshold, user is speaking
          if (average > 30) {
            setIsMicActive(true);
          } else {
            setIsMicActive(false);
          }

          requestAnimationFrame(checkAudioLevel);
        };

        checkAudioLevel();
      } catch (err) {
        console.error("Microphone access denied:", err);
      }
    };

    // Initialize Web Speech API for speech-to-text
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          }
        }

        // Auto-send recognized speech only during active GD
        if (finalTranscript.trim() && !evaluationRef.current && sessionRef.current?.sessionId) {
          const recognizedMessage = finalTranscript.trim();
          setInput(recognizedMessage);
          const API_URL = process.env.REACT_APP_API_URL || "";

          axios.post(
            `${API_URL}/api/gd/message`,
            {
              sessionId: sessionRef.current.sessionId,
              message: recognizedMessage
            },
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          ).then(async (res) => {
            setSession(res.data.session);
            setInput("");
            // Wait a moment before triggering bot discussion
            setTimeout(() => {
              startBotDiscussion(sessionRef.current.sessionId);
            }, 1000);
          }).catch((err) => {
            console.error("Speech send failed", err);
          });
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }

    initMicrophone();

    return () => {
      if (microStreamRef.current) {
        microStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // TRACK USER SPEAKING TIME
  useEffect(() => {
    const interval = setInterval(() => {
      if (isMicActive && !evaluation) {
        setUserSpeakingTime(prev => prev + 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isMicActive, evaluation]);

  // Stop speech recognition when bots start discussing
  useEffect(() => {
    if (isBotsDiscussing && isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isBotsDiscussing, isListening]);

  /* ---------------- FINISH GD + EVALUATION & SAVE RESULT ---------------- */
  const finishGD = async () => {
    console.log("🎬 finishGD called, token:", token ? "✓ Present" : "✗ Missing");
    
    try {
      const durationInSeconds = startTimeStamp ? Math.round((Date.now() - startTimeStamp) / 1000) : 0;
      const API_URL = process.env.REACT_APP_API_URL || "";
      
      // Step 1: Get evaluation from AI
      console.log("📊 Getting AI evaluation...");
      const evalRes = await axios.post(
        `${API_URL}/api/gd/evaluate`,
        {
          sessionId: session.sessionId,
          speakingTime: userSpeakingTime,
          topic: session.topic,
          duration: durationInSeconds
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log("📊 Evaluation received:", evalRes.data);
      const evaluation = evalRes.data;
      setEvaluation(evaluation);

      // Step 2: Save result to database
      try {
        console.log("💾 Saving GD result...");
        await axios.post(
          `${API_URL}/api/gd/save-result`,
          {
            sessionId: session.sessionId,
            scores: evaluation,
            speakingTime: userSpeakingTime,
            topic: session.topic,
            duration: durationInSeconds
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        console.log("✅ GD result saved");
      } catch (err) {
        console.error("❌ Save result failed:", err.response?.data || err.message);
      }

      // Calculate stats and navigate to result page
      const stats = {
        totalDuration: durationInSeconds,
        userSpeakingTime: userSpeakingTime,
        messageCount: session.transcript?.filter(t => t.role === "user").length || 0,
        participationPercentage: durationInSeconds > 0 ? Math.min(
          100,
          Math.round((userSpeakingTime / durationInSeconds) * 100)
        ) : 0
      };

      setTimeout(() => {
        navigate('/gd-result', {
          state: {
            evaluation,
            session,
            stats
          }
        });
      }, 1500);

    } catch (err) {
      console.error("❌ Evaluation error:", err.response?.data || err.message);
      alert("Error getting evaluation. Please try again.");
    }
  };

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // SPEAK BOT DIALOGUE
  const speakText = (text, botName) => {
    return new Promise((resolve) => {
      setSpeakingBot(botName);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.onend = () => {
        setSpeakingBot(null);
        resolve();
      };
      window.speechSynthesis.speak(utterance);
    });
  };

  // BOT SPEAKING LOOP - LIMITED TO 2 BOTS
  const startBotDiscussion = async (sessionId) => {
    // Prevent overlapping bot discussions
    if (!sessionId || isBotsDiscussing || evaluationRef.current) return;
    
    setIsBotsDiscussing(true);
    
    const botCount = Math.floor(Math.random() * 2) + 1; // Random 1-2 bots will respond
    
    for (let i = 0; i < botCount; i++) {
      await new Promise(r => setTimeout(r, 2000)); // 2 second delay between bots

      // Check if session is still active
      if (evaluationRef.current) break;

      try {
        const API_URL = process.env.REACT_APP_API_URL || "";
        const res = await axios.post(
          `${API_URL}/api/gd/next`,
          { sessionId },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        setSession(res.data.session);
        
        // Get the last message in transcript for speaking
        const lastMsg = res.data.session.transcript[res.data.session.transcript.length - 1];
        if (lastMsg && lastMsg.role === "bot") {
          // Speak the bot's dialogue
          await speakText(lastMsg.content, lastMsg.name);
        }
      } catch (err) {
        console.error("Bot discussion error:", err);
        break;
      }
    }
    
    setIsBotsDiscussing(false);
  };

  // USER SEND MESSAGE
  const handleSend = async (messageOverride = null) => {
    // check session first
    if (!session || !session.sessionId) {
      console.log("Session not ready");
      return;
    }

    // Don't send if bots are currently discussing
    if (isBotsDiscussing) {
      console.log("Bots are discussing, please wait...");
      return;
    }

    const rawMessage = typeof messageOverride === "string" ? messageOverride : input;
    const messageToSend = (rawMessage || "").trim();

    // check empty message
    if (!messageToSend) return;

    try {
      const API_URL = process.env.REACT_APP_API_URL || "";
      // Step 1: Analyze message with AI first
      console.log("🤖 Analyzing message with AI...");
      setShowingFeedback(true);
      
      const feedbackRes = await axios.post(
        `${API_URL}/api/gd/analyze-message`,
        {
          sessionId: session.sessionId,
          message: messageToSend,
          topic: session.topic
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log("📊 AI Feedback received:", feedbackRes.data.feedback);
      setAiFeedback(feedbackRes.data.feedback);

      // Show feedback for 3 seconds before continuing
      await new Promise(r => setTimeout(r, 3000));

      // Step 2: Send message to API
      const res = await axios.post(
        `${API_URL}/api/gd/message`,
        {
          sessionId: session.sessionId,
          message: messageToSend
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // update session from backend
      setSession(res.data.session);

      // clear input and feedback
      setInput("");
      setShowingFeedback(false);
      setAiFeedback(null);

      // trigger bots with a slight delay
      setTimeout(() => {
        startBotDiscussion(session.sessionId);
      }, 1000);

    } catch (err) {
      console.error("SEND FAILED", err);
      setShowingFeedback(false);
      setAiFeedback(null);
    }
  };

  // Start/Stop speech recognition
  const toggleSpeechRecognition = () => {
    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
      } else {
        // Don't start if bots are discussing
        if (isBotsDiscussing) {
          console.log("Bots are discussing, please wait...");
          return;
        }
        recognitionRef.current.start();
        setIsListening(true);
      }
    }
  };

  // 5 MINUTE TIMER - Auto-finish when time ends
  useEffect(() => {
    if (evaluation || !session) return;
    
    if (timeLeft === 0) {
      finishGD();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [evaluation, session, timeLeft]);

  if (!session) return <div className="text-white p-6">Loading GD...</div>;

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Group Discussion</h1>
        <div className={`text-3xl font-bold px-6 py-2 rounded-lg ${
          timeLeft <= 60 ? 'bg-red-600' : 'bg-blue-600'
        }`}>
          ⏱️ {formatTime(timeLeft)}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* LEFT SIDE – PARTICIPANT GRID */}
        <div className="col-span-2 grid grid-cols-2 gap-4">
          {/* BOT1 */}
          <div className={`bg-gray-800 rounded-xl p-4 border 
            ${speakingBot === "Bot1" ? "border-cyan-400" : "border-gray-700"}`}>
            <p className="text-sm text-gray-300 mb-2">Bot1</p>
            <div className="flex justify-center items-center h-28">
              <div className={`w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center text-2xl ${
                speakingBot === "Bot1" ? "animate-blink" : ""
              }`}>
                🙂
              </div>
            </div>
          </div>

          {/* BOT2 */}
          <div className={`bg-gray-800 rounded-xl p-4 border 
            ${speakingBot === "Bot2" ? "border-cyan-400" : "border-gray-700"}`}>
            <p className="text-sm text-gray-300 mb-2">Bot2</p>
            <div className="flex justify-center items-center h-28">
              <div className={`w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center text-2xl ${
                speakingBot === "Bot2" ? "animate-blink" : ""
              }`}>
                🙂
              </div>
            </div>
          </div>

          {/* USER */}
          <div className={`bg-gray-800 rounded-xl p-4 border ${isMicActive ? "border-green-400" : "border-gray-700"}`}>
            <p className="text-sm text-gray-300 mb-2">You {isMicActive && <span className="text-green-400">🎤 Speaking</span>}</p>
            <div className="flex justify-center items-center h-28 relative">
              <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width={120}
                height={120}
                className="rounded-full"
              />
              {isMicActive && (
                <div className="absolute inset-0 border-4 border-green-400 rounded-full animate-pulse"></div>
              )}
              {isListening && (
                <div className="absolute top-0 right-0 px-2 py-1 bg-red-600 text-white text-xs rounded-full font-semibold animate-pulse">
                  🎙️ Listening...
                </div>
              )}
            </div>
          </div>

          {/* BOT3 */}
          <div className={`bg-gray-800 rounded-xl p-4 border 
            ${speakingBot === "Bot3" ? "border-cyan-400" : "border-gray-700"}`}>
            <p className="text-sm text-gray-300 mb-2">Bot3</p>
            <div className="flex justify-center items-center h-28">
              <div className={`w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center text-2xl ${
                speakingBot === "Bot3" ? "animate-blink" : ""
              }`}>
                🙂
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE – PERFORMANCE PANEL */}
        <div className="bg-gray-900 rounded-xl p-6">
          <h2 className="text-lg mb-4 text-yellow-300">
            Performance Analysis
          </h2>

          <div className="mb-4 p-3 bg-blue-900 rounded text-xs text-blue-200">
            ⏰ Timer: {formatTime(timeLeft)}
          </div>

          {/* SPEAKING TIME REQUIREMENT */}
          <div className={`mb-4 p-3 rounded text-xs ${
            userSpeakingTime >= MIN_SPEAKING_TIME ? "bg-green-900 text-green-200" : "bg-orange-900 text-orange-200"
          }`}>
            🎤 Speaking Time: {userSpeakingTime}s / {MIN_SPEAKING_TIME}s
            {userSpeakingTime < MIN_SPEAKING_TIME && (
              <p className="mt-2">ℹ️ Keep speaking to improve your score.</p>
            )}
            {userSpeakingTime >= MIN_SPEAKING_TIME && (
              <p className="mt-2">✅ You can finish the discussion now!</p>
            )}
          </div>

          {/* BOT DISCUSSION INDICATOR */}
          {isBotsDiscussing && (
            <div className="mb-4 p-3 bg-cyan-900 text-cyan-200 rounded text-xs animate-pulse">
              🤖 Bots are discussing... Please wait
            </div>
          )}

          {evaluation && <GDRadarChart scores={evaluation} />}

          {evaluation && (
            <div className="mt-6 text-sm">
              <p className="text-green-400 font-semibold">
                Verdict: Needs Improvement
              </p>

              <p className="mt-2">
                Overall Score: {evaluation?.overallScore || "3.4/10"}
              </p>

              <p className="mt-3 text-gray-300">
                Your discussion performance needs improvement.
                Work on clarity and presenting confident arguments.
              </p>

              <p className="mt-2 text-yellow-400">
                Improvement: Avoid repetition and improve vocabulary diversity.
              </p>

              {/* Dashboard Navigation Button */}
              <button
                onClick={() => navigate('/student-dashboard')}
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                View Dashboard
              </button>
            </div>
          )}
        </div>
      </div>

      {/* TOPIC */}
      <p className="text-cyan-400 mt-6">
        Topic: {session.topic}
      </p>

      {/* AI FEEDBACK PANEL */}
      {showingFeedback && aiFeedback && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border-2 border-purple-500 rounded-2xl p-8 max-w-lg shadow-2xl animate-in fade-in zoom-in">
            <h3 className="text-2xl font-bold text-purple-400 mb-6 text-center">
              🤖 AI Feedback on Your Point
            </h3>

            {/* Strength */}
            <div className="mb-4">
              <p className="text-green-400 font-semibold mb-1">✅ Strength:</p>
              <p className="text-gray-300">{aiFeedback.strength}</p>
            </div>

            {/* Scores */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-blue-600/20 rounded-lg p-3 border border-blue-600/40">
                <p className="text-blue-400 text-sm">Clarity</p>
                <p className="text-2xl font-bold text-blue-300">{aiFeedback.clarity}/10</p>
              </div>
              <div className="bg-cyan-600/20 rounded-lg p-3 border border-cyan-600/40">
                <p className="text-cyan-400 text-sm">Relevance</p>
                <p className="text-2xl font-bold text-cyan-300">{aiFeedback.relevance}/10</p>
              </div>
            </div>

            {/* Suggestion */}
            <div className="mb-4">
              <p className="text-yellow-400 font-semibold mb-1">💡 Suggestion:</p>
              <p className="text-gray-300">{aiFeedback.suggestion}</p>
            </div>

            {/* Insight */}
            <div className="bg-purple-600/20 rounded-lg p-3 border border-purple-600/40">
              <p className="text-purple-300 text-sm italic">{aiFeedback.insight}</p>
            </div>

            <p className="text-gray-400 text-center mt-6 text-sm">
              ⏳ Continuing discussion in a moment...
            </p>
          </div>
        </div>
      )}

      {/* TRANSCRIPT */}
      <div className="bg-gray-900 p-4 rounded-lg mt-4 h-40 overflow-y-auto text-sm">
        {session.transcript?.map((msg, i) => (
          <div key={i} className={speakingBot === msg.name ? "text-cyan-300 font-semibold" : ""}>
            {msg.role === "user" && <b>USER:</b>}
            {msg.role === "bot" && <b>{msg.name}:</b>}
            {msg.content}
          </div>
        ))}

        {speakingBot && (
          <div className="text-cyan-400 italic font-semibold">
            🔊 {speakingBot} is speaking...
          </div>
        )}
      </div>

      {/* INPUT */}
      {!evaluation && (
        <div className="flex gap-3 mt-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !isBotsDiscussing) handleSend() }}
            className="flex-1 p-2 bg-gray-800 rounded"
            placeholder="Speak or type your point..."
            disabled={isBotsDiscussing}
          />

          <button
            onClick={toggleSpeechRecognition}
            disabled={isBotsDiscussing}
            className={`px-4 rounded font-semibold ${
              isListening
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-purple-600 text-white hover:bg-purple-700"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isListening ? "🛑 Stop" : "🎤 Speak"}
          </button>

          <button
            onClick={() => handleSend()}
            disabled={!session || isBotsDiscussing}
            className="bg-cyan-400 text-black px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isBotsDiscussing ? "Bots Speaking..." : "Send"}
          </button>

          <button
            onClick={finishGD}
            disabled={isBotsDiscussing}
            className="px-4 rounded font-semibold bg-yellow-500 text-black hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Finish GD
          </button>
        </div>
      )}

      {/* EVALUATION COMPLETE - NAVIGATION OPTIONS */}
      {evaluation && (
        <div className="flex gap-4 mt-6 justify-center">
          <button
            onClick={() => navigate('/student-dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition shadow-lg"
          >
            📊 View Dashboard
          </button>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition shadow-lg"
          >
            🔄 Start New GD
          </button>
        </div>
      )}
    </div>
  );
}

export default GDRoom;