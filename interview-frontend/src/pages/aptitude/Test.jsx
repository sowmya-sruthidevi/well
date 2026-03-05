import { useEffect, useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";

export default function Test() {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const storedDuration = parseInt(localStorage.getItem("duration"));
  const [timeLeft, setTimeLeft] = useState(
    isNaN(storedDuration) ? 0 : storedDuration
  );

  // Load questions
  useEffect(() => {
    const storedQuestions = localStorage.getItem("questions");
    if (!storedQuestions) {
      navigate("/aptitude/start");
    } else {
      setQuestions(JSON.parse(storedQuestions));
    }
  }, [navigate]);

  // Timer
  useEffect(() => {
    if (submitted || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [submitted, timeLeft]);

  const handleSelect = (questionId, option) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const handleSubmit = async (auto = false) => {
    console.log("🎯 Submit button clicked, submitted status:", submitted);
    
    if (submitted) {
      console.log("⚠️ Already submitted, ignoring...");
      return;
    }

    const sessionId = localStorage.getItem("sessionId");
    console.log("📝 SessionId:", sessionId);
    
    if (!sessionId) {
      alert("Session expired. Restart test.");
      navigate("/aptitude/start");
      return;
    }

    console.log("📊 Answers:", answers);
    console.log("📊 Answered count:", Object.keys(answers).length);

    if (!auto && Object.keys(answers).length === 0) {
      alert("Answer at least one question.");
      return;
    }

    if (!auto) {
      const confirmSubmit = window.confirm(
        "Are you sure you want to submit?"
      );
      if (!confirmSubmit) {
        console.log("❌ User cancelled submission");
        return;
      }
    }

    console.log("🚀 Starting submission process...");
    setSubmitted(true);

    try {
      const formattedAnswers = Object.keys(answers).map((qid) => ({
        questionId: qid,
        selectedAnswer: answers[qid],
      }));

      console.log("📤 Sending to API:", { sessionId, answers: formattedAnswers });

      const res = await api.post("/api/questions/submit-test", {
        sessionId,
        answers: formattedAnswers,
      });

      console.log("📥 API Response:", res.data);

      localStorage.setItem("result", JSON.stringify(res.data));
      
      console.log("✅ Aptitude test submitted, redirecting to results...");
      
      // Redirect to results page immediately
      navigate('/aptitude/result');
    } catch (err) {
      console.error("❌ Submission error:", err);
      console.error("❌ Error response:", err.response?.data);
      console.error("❌ Error message:", err.message);
      alert("Submission failed: " + (err.response?.data?.error || err.message));
      setSubmitted(false);
    }
  };

  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;

  if (!questions.length) return null;

  const currentQuestion = questions[currentIndex];

  return (
    <Layout>
      <div className="flex gap-8 px-10 py-12">

        {/* Side Navigation */}
        <div className="w-64 bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/20 h-fit">

          <div className="grid grid-cols-5 gap-3 mb-6">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`rounded-lg py-2 text-sm font-medium 
                  ${
                    answers[questions[i]._id]
                      ? "bg-green-500 text-white"
                      : "bg-white/20 text-white"
                  }
                  ${
                    currentIndex === i
                      ? "ring-2 ring-blue-400"
                      : ""
                  }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => document.documentElement.requestFullscreen()}
            className="w-full bg-blue-600 py-2 rounded-lg text-white hover:bg-blue-700 transition"
          >
            Full Screen
          </button>

        </div>

        {/* Main Question Area */}
        <div className="flex-1">

          {/* Sticky Header */}
          <div className="sticky top-0 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-xl mb-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  if (window.confirm("Are you sure you want to exit the test? Your progress will be lost.")) {
                    navigate("/dashboard");
                  }
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
              >
                ← Back
              </button>
              <h2 className="text-2xl font-bold text-white">
                Aptitude Test
              </h2>
            </div>

            <div className="text-red-400 font-bold text-lg">
              Time Left: {timeLeft}s
            </div>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <p className="text-gray-300">
              Progress: {answeredCount} / {totalQuestions}
            </p>

            <div className="w-full bg-white/20 rounded-full h-3 mt-2">
              <div
                className="bg-blue-500 h-3 rounded-full transition-all"
                style={{
                  width: `${
                    (answeredCount / totalQuestions) * 100
                  }%`,
                }}
              ></div>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white/10 backdrop-blur-xl p-8 rounded-2xl border border-white/20 shadow-xl">

            <p className="text-white font-semibold mb-6 text-lg">
              {currentIndex + 1}. {currentQuestion.question}
            </p>

            {currentQuestion.options.map((option, i) => (
              <label
                key={i}
                className="block mb-4 cursor-pointer p-4 rounded-xl 
                bg-white/5 hover:bg-white/10 
                text-white border border-white/10 transition"
              >
                <input
                  type="radio"
                  name={currentQuestion._id}
                  value={option}
                  checked={
                    answers[currentQuestion._id] === option
                  }
                  onChange={() =>
                    handleSelect(currentQuestion._id, option)
                  }
                  className="mr-3 accent-blue-500"
                />
                {option}
              </label>
            ))}

          </div>

          {/* Submit */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={() => handleSubmit(false)}
              disabled={submitted}
              className="bg-green-600 px-8 py-3 rounded-xl text-white 
              shadow-[0_0_25px_rgba(34,197,94,0.5)] 
              hover:bg-green-700 transition disabled:opacity-50"
            >
              Submit Test
            </button>
          </div>

        </div>

      </div>
    </Layout>
  );
}