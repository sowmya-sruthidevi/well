import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import Navbar from "../../components/Navbar";

export default function Result() {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [showOnlyWrong, setShowOnlyWrong] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("result");
    console.log("📊 Result page loaded");
    console.log("📦 Stored result:", stored);
    
    if (!stored) {
      console.log("❌ No result found, redirecting to start...");
      navigate("/aptitude/start");
    } else {
      const parsedResult = JSON.parse(stored);
      console.log("✅ Parsed result:", parsedResult);
      setResult(parsedResult);
    }
  }, [navigate]);

  if (!result) return null;

  const percentage = Math.round(
    (result.score / result.totalQuestions) * 100
  );

  const filteredResults = showOnlyWrong 
    ? (result.results || []).filter(item => !item.isCorrect)
    : (result.results || []);

  const wrongCount = (result.results || []).filter(item => !item.isCorrect).length;

  return (
    <Layout>
      <Navbar />
      <div className="px-10 py-16">

        {/* Score Summary */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            {result.score} / {result.totalQuestions}
          </h1>

          <p className="text-2xl text-blue-400 mb-4">
            {percentage}% Score
          </p>

          <p className="text-gray-300 max-w-xl mx-auto mb-6">
            {result.feedback}
          </p>

          <div className="flex justify-center gap-4 items-center">
            <span className="text-green-400 font-semibold">
              ✓ Correct: {result.score}
            </span>
            <span className="text-red-400 font-semibold">
              ✗ Wrong: {wrongCount}
            </span>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setShowOnlyWrong(false)}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              !showOnlyWrong
                ? "bg-blue-600 text-white"
                : "bg-white/10 text-gray-300 hover:bg-white/20"
            }`}
          >
            All Questions
          </button>
          <button
            onClick={() => setShowOnlyWrong(true)}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              showOnlyWrong
                ? "bg-red-600 text-white"
                : "bg-white/10 text-gray-300 hover:bg-white/20"
            }`}
          >
            Wrong Answers Only ({wrongCount})
          </button>
        </div>

        {/* Breakdown */}
        <div className="space-y-6">
          {filteredResults.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">
                {showOnlyWrong ? "🎉 No wrong answers! Perfect score!" : "No questions to display."}
              </p>
            </div>
          ) : (
            filteredResults.map((item, index) => (
              <div
                key={item.questionId}
                className={`p-6 rounded-2xl backdrop-blur-xl border shadow-xl
                  ${
                    item.isCorrect
                      ? "bg-green-500/10 border-green-500/30"
                      : "bg-red-500/10 border-red-500/30"
                  }`}
              >
                <p className="text-white font-semibold mb-3">
                  {(result.results || []).indexOf(item) + 1}. {item.question}
                </p>

                <p className="text-gray-300">
                  Your Answer:{" "}
                  <span className={`font-semibold ${item.selectedAnswer ? "text-white" : "text-gray-500"}`}>
                    {item.selectedAnswer || "Not Answered"}
                  </span>
                </p>

                <p className="text-gray-300">
                  Correct Answer:{" "}
                  <span className="text-green-400 font-semibold">
                    {item.correctAnswer}
                  </span>
                </p>

                <p
                  className={`mt-2 font-semibold ${
                    item.isCorrect
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {item.isCorrect ? "✓ Correct" : "✗ Incorrect"}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="mt-12 text-center flex gap-4 justify-center">
          <button
            onClick={() => navigate("/student-dashboard")}
            className="bg-blue-600 px-8 py-3 rounded-xl text-white 
            shadow-[0_0_25px_rgba(59,130,246,0.5)] 
            hover:bg-blue-700 transition"
          >
            View Dashboard
          </button>
          <button
            onClick={() => navigate("/aptitude/start")}
            className="bg-green-600 px-8 py-3 rounded-xl text-white 
            shadow-[0_0_25px_rgba(34,197,94,0.5)] 
            hover:bg-green-700 transition"
          >
            Take Another Test
          </button>
        </div>

      </div>
    </Layout>
  );
}