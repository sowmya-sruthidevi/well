import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../../components/Layout";
import Webcam from "react-webcam";
import Editor from "@monaco-editor/react";

export default function TechnicalRound() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [problems, setProblems] = useState([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [problemStates, setProblemStates] = useState({});
  const [output, setOutput] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45 * 60); // 45 minutes
  const [result, setResult] = useState(null);
  const webcamRef = useRef(null);
  const token = localStorage.getItem("token");

  const currentProblem = problems[currentProblemIndex];
  const currentState = problemStates[currentProblemIndex] || { code: "", language: "javascript" };

  // Stop webcam when result is shown
  useEffect(() => {
    if (result && webcamRef.current?.video) {
      const stream = webcamRef.current.video.srcObject;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    }
  }, [result]);

  // Initialize session
  useEffect(() => {
    startTechnical();
  }, []);

  // Timer
  useEffect(() => {
    if (result || !session) return;

    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, result, session]);

  const startTechnical = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/technical/start",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSession(res.data);
      setProblems(res.data.problems || [res.data.problem]); // Support both old and new API
      
      // Initialize problem states
      const initialStates = {};
      (res.data.problems || [res.data.problem]).forEach((prob, idx) => {
        const lang = "javascript";
        const starterCode = prob.starterCode?.get ? prob.starterCode.get(lang) : prob.starterCode?.[lang] || "";
        initialStates[idx] = { code: starterCode, language: lang };
      });
      setProblemStates(initialStates);
      
      const expiresAt = new Date(res.data.expiresAt);
      const now = new Date();
      const seconds = Math.floor((expiresAt - now) / 1000);
      setTimeLeft(seconds);
    } catch (err) {
      console.error("Start technical error:", err);
      alert("Failed to start technical round");
    }
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput("");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/technical/run",
        {
          sessionId: session.sessionId,
          code: currentState.code,
          language: currentState.language,
          input: customInput,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        setOutput(`✅ Success\n\nOutput:\n${res.data.output}\n\nExecution Time: ${res.data.executionTime}ms`);
      } else {
        setOutput(`❌ Error\n\n${res.data.error}`);
      }
    } catch (err) {
      setOutput(`❌ Error\n\n${err.response?.data?.error || err.message}`);
    }

    setIsRunning(false);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const confirmSubmit = window.confirm(
      `Are you sure you want to submit your solution for "${currentProblem?.title}"? You cannot change it after submission.`
    );
    if (!confirmSubmit) return;

    setIsSubmitting(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/technical/submit",
        {
          sessionId: session.sessionId,
          code: currentState.code,
          language: currentState.language,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setResult(res.data);
    } catch (err) {
      alert("Submission failed: " + (err.response?.data?.error || err.message));
      setIsSubmitting(false);
    }
  };

  const updateCurrentCode = (newCode) => {
    setProblemStates(prev => ({
      ...prev,
      [currentProblemIndex]: { ...prev[currentProblemIndex], code: newCode }
    }));
  };

  const handleLanguageChange = (newLang) => {
    if (currentProblem?.starterCode) {
      const starterCode = currentProblem.starterCode.get ? currentProblem.starterCode.get(newLang) : currentProblem.starterCode[newLang];
      setProblemStates(prev => ({
        ...prev,
        [currentProblemIndex]: { code: starterCode || "", language: newLang }
      }));
    }
  };

  const switchProblem = (index) => {
    setCurrentProblemIndex(index);
    setOutput("");
    setCustomInput("");
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (!session || problems.length === 0) {
    return (
      <Layout>
        <div className="p-10 text-lg text-white">Loading technical round...</div>
      </Layout>
    );
  }

  if (result) {
    return (
      <Layout>
        <div className="px-10 py-16">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">
              {result.score}/100
            </h1>
            <p className="text-2xl text-blue-400 mb-4">
              Test Cases: {result.passedTests}/{result.totalTests} Passed
            </p>
            <p className="text-gray-300 max-w-xl mx-auto mb-6">
              {result.feedback}
            </p>
            <p className="text-gray-400">
              Execution Time: {result.executionTime}ms
            </p>
          </div>

          {/* AI Analysis */}
          {result.aiFeedback && (
            <div className="mb-8 max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-purple-300 mb-4 flex items-center gap-2">
                  🤖 AI Code Analysis
                </h2>
                <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {result.aiFeedback}
                </div>
              </div>
            </div>
          )}

          {/* Test Results */}
          <div className="space-y-4 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Test Results</h2>
            {result.testResults.map((test, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-2xl backdrop-blur-xl border ${
                  test.passed
                    ? "bg-green-500/10 border-green-500/30"
                    : "bg-red-500/10 border-red-500/30"
                }`}
              >
                <p className="text-white font-semibold mb-2">
                  Test Case {idx + 1}: {test.passed ? "✅ Passed" : "❌ Failed"}
                </p>
                <div className="text-sm text-gray-300 space-y-1">
                  <p>
                    <span className="text-gray-400">Input:</span> {test.input}
                  </p>
                  <p>
                    <span className="text-gray-400">Expected:</span>{" "}
                    {test.expectedOutput}
                  </p>
                  <p>
                    <span className="text-gray-400">Actual:</span>{" "}
                    {test.actualOutput}
                  </p>
                  {test.error && (
                    <p className="text-red-400">
                      <span className="text-gray-400">Error:</span> {test.error}
                    </p>
                  )}
                  <p className="text-gray-400">
                    Execution Time: {test.executionTime}ms
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate("/student-dashboard")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition shadow-lg"
            >
              📊 View Dashboard
            </button>
            <button
              onClick={() => window.location.href = '/technical'}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition shadow-lg"
            >
              🔄 Try Another Problem
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-[#0f172a] text-white p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Technical Interview</h1>
            {problems.length > 1 && (
              <div className="flex gap-2">
                {problems.map((prob, idx) => (
                  <button
                    key={idx}
                    onClick={() => switchProblem(idx)}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                      currentProblemIndex === idx
                        ? "bg-cyan-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    Q{idx + 1}: {prob.difficulty}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div
            className={`text-3xl font-bold px-6 py-2 rounded-lg ${
              timeLeft <= 300 ? "bg-red-600" : "bg-blue-600"
            }`}
          >
            ⏱️ {formatTime(timeLeft)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Left: Problem Description */}
          <div className="bg-gray-900 rounded-xl p-6 overflow-y-auto" style={{ maxHeight: "80vh" }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-cyan-400">
                {currentProblem.title}
              </h2>
              <span
                className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                  currentProblem.difficulty === "easy"
                    ? "bg-green-600"
                    : currentProblem.difficulty === "medium"
                    ? "bg-yellow-600"
                    : "bg-red-600"
                }`}
              >
                {currentProblem.difficulty.toUpperCase()}
              </span>
            </div>

            <div className="mb-6">
              <span className="px-3 py-1 bg-purple-600 rounded-lg text-sm">
                {currentProblem.category}
              </span>
            </div>

            <div className="prose prose-invert max-w-none mb-6">
              <pre className="whitespace-pre-wrap text-gray-300">
                {currentProblem.description}
              </pre>
            </div>

            {/* Test Cases */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">Sample Test Cases</h3>
              {currentProblem.testCases.map((tc, idx) => (
                <div
                  key={idx}
                  className="bg-gray-800 p-4 rounded-lg mb-3"
                >
                  <p className="text-sm text-gray-400">Input:</p>
                  <pre className="text-sm text-white mb-2">{tc.input}</pre>
                  <p className="text-sm text-gray-400">Expected Output:</p>
                  <pre className="text-sm text-white">{tc.expectedOutput}</pre>
                </div>
              ))}
            </div>

            {/* Constraints */}
            {currentProblem.constraints && currentProblem.constraints.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3">Constraints</h3>
                <ul className="list-disc list-inside text-gray-300">
                  {currentProblem.constraints.map((c, idx) => (
                    <li key={idx}>{c}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Hints */}
            {currentProblem.hints && currentProblem.hints.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-3">Hints 💡</h3>
                <ul className="list-disc list-inside text-gray-300">
                  {currentProblem.hints.map((h, idx) => (
                    <li key={idx}>{h}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Webcam */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Proctoring</h3>
              <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="rounded-lg w-48 h-36"
              />
            </div>
          </div>

          {/* Right: Code Editor */}
          <div className="flex flex-col">
            {/* Language Selector */}
            <div className="bg-gray-900 rounded-t-xl p-4 flex gap-2">
              {["javascript", "python", "java"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    currentState.language === lang
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </button>
              ))}
            </div>

            {/* Monaco Editor */}
            <div className="flex-1 bg-gray-900">
              <Editor
                height="50vh"
                language={currentState.language}
                value={currentState.code}
                onChange={(value) => updateCurrentCode(value || "")}
                theme="vs-dark"
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </div>

            {/* Custom Input */}
            <div className="bg-gray-900 p-4">
              <label className="block text-sm text-gray-400 mb-2">
                Custom Input (Optional)
              </label>
              <textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                className="w-full p-2 bg-gray-800 rounded text-white text-sm"
                rows={3}
                placeholder="Enter custom test input..."
              />
            </div>

            {/* Output */}
            {output && (
              <div className="bg-gray-900 p-4">
                <h3 className="text-sm text-gray-400 mb-2">Output:</h3>
                <pre className="text-sm text-white bg-gray-800 p-3 rounded overflow-auto max-h-40">
                  {output}
                </pre>
              </div>
            )}

            {/* Action Buttons */}
            <div className="bg-gray-900 rounded-b-xl p-4 flex gap-3">
              <button
                onClick={handleRunCode}
                disabled={isRunning}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50 transition"
              >
                {isRunning ? "Running..." : "▶️ Run Code"}
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50 transition"
              >
                {isSubmitting ? "Submitting..." : "✅ Submit"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
