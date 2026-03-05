import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../../components/Layout";

export default function StudentDashboard() {

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedAptitude, setExpandedAptitude] = useState(null);

  useEffect(() => {

    const fetchDashboard = async () => {

      const token = localStorage.getItem("token");

      console.log("📊 StudentDashboard: Fetching dashboard..., token:", token ? "✓ Present" : "✗ Missing");

      try {

        // Dashboard API
        const dashboard = await axios.get(
          "http://localhost:5000/api/dashboard",
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        console.log("✅ Dashboard data received:", dashboard.data);
        setData(dashboard.data);

      } catch (err) {

        console.error("❌ Dashboard fetch error:", err.response?.data || err.message);
        setError("Failed to load dashboard.");

      }

      setLoading(false);

    };

    fetchDashboard();

  }, []);


  // Loading state
  if (loading) {
    return <div className="p-10 text-lg text-white">Loading dashboard...</div>;
  }

  // Error state
  if (error) {
    return <div className="p-10 text-red-500">{error}</div>;
  }

  const gdAttempts = data?.gdAttempts || [];
  const gdCount = data?.gdAttemptCount || 0;
  const gdBestScore = data?.gdBestScore || 0;
  const gdLatestScore = data?.gdLatestScore || 0;

  const aptitudeAttempts = data?.aptitudeAttempts || [];
  const aptitudeCount = data?.aptitudeAttemptCount || 0;
  const aptitudeBestScore = data?.aptitudeBestScore || 0;
  const aptitudeLatestScore = data?.aptitudeLatestScore || 0;

  const atsResults = data?.atsResults || [];
  const atsCount = data?.atsAttemptCount || 0;
  const atsBestScore = data?.atsBestScore || 0;
  const atsLatestScore = data?.atsLatestScore || 0;

  const technicalAttempts = data?.technicalAttempts || [];
  const technicalCount = data?.technicalAttemptCount || 0;
  const technicalBestScore = data?.technicalBestScore || 0;
  const technicalLatestScore = data?.technicalLatestScore || 0;

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const user = data?.user || {};
  const profileName = user.fullName || storedUser.fullName || "Student";
  const profileEmail = user.email || storedUser.email || "No email available";
  const profilePhoto = user.photoUrl || storedUser.photoUrl || "";
  const initials = profileName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "S";

  return (

    <Layout>
    <div className="min-h-screen bg-[#0f172a] text-white p-10">

      <h1 className="text-4xl font-bold mb-12">
        Student Dashboard
      </h1>

      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 mb-10 flex items-center gap-5">
        {profilePhoto ? (
          <img
            src={profilePhoto}
            alt="Profile"
            className="w-16 h-16 rounded-full object-cover border border-gray-600"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-blue-700 flex items-center justify-center text-xl font-bold">
            {initials}
          </div>
        )}
        <div>
          <p className="text-2xl font-semibold text-white">{profileName}</p>
          <p className="text-gray-300">{profileEmail}</p>
        </div>
      </div>


      {/* ATTEMPT STATS - 4x4 GRID */}

      <div className="grid grid-cols-4 gap-6 mb-10">

        {/* GD STATS */}
        <div className="bg-gradient-to-br from-blue-900 to-blue-800 shadow-lg p-8 rounded-xl border border-blue-700">
          <h3 className="text-lg font-semibold text-blue-200 mb-4">📊 Group Discussion</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-blue-300">Attempts</p>
              <p className="text-3xl font-bold text-blue-400">{gdCount}</p>
            </div>
            <div>
              <p className="text-xs text-blue-300">Best Score</p>
              <p className="text-2xl font-bold text-green-400">{gdBestScore.toFixed(1)}/10</p>
            </div>
            <div>
              <p className="text-xs text-blue-300">Latest Score</p>
              <p className="text-2xl font-bold text-yellow-400">{gdLatestScore.toFixed(1)}/10</p>
            </div>
          </div>
        </div>

        {/* APTITUDE STATS */}
        <div className="bg-gradient-to-br from-purple-900 to-purple-800 shadow-lg p-8 rounded-xl border border-purple-700">
          <h3 className="text-lg font-semibold text-purple-200 mb-4">📈 Aptitude Test</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-purple-300">Attempts</p>
              <p className="text-3xl font-bold text-purple-400">{aptitudeCount}</p>
            </div>
            <div>
              <p className="text-xs text-purple-300">Best Score</p>
              <p className="text-2xl font-bold text-green-400">{aptitudeBestScore.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-xs text-purple-300">Latest Score</p>
              <p className="text-2xl font-bold text-yellow-400">{aptitudeLatestScore.toFixed(1)}</p>
            </div>
          </div>
        </div>

        {/* ATS STATS */}
        <div className="bg-gradient-to-br from-green-900 to-green-800 shadow-lg p-8 rounded-xl border border-green-700">
          <h3 className="text-lg font-semibold text-green-200 mb-4">📄 ATS Resume Check</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-green-300">Attempts</p>
              <p className="text-3xl font-bold text-green-400">{atsCount}</p>
            </div>
            <div>
              <p className="text-xs text-green-300">Best Score</p>
              <p className="text-2xl font-bold text-green-400">{atsBestScore.toFixed(1)}/100</p>
            </div>
            <div>
              <p className="text-xs text-green-300">Latest Score</p>
              <p className="text-2xl font-bold text-yellow-400">{atsLatestScore.toFixed(1)}/100</p>
            </div>
          </div>
        </div>

        {/* TECHNICAL STATS */}
        <div className="bg-gradient-to-br from-orange-900 to-orange-800 shadow-lg p-8 rounded-xl border border-orange-700">
          <h3 className="text-lg font-semibold text-orange-200 mb-4">💻 Technical Round</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-orange-300">Attempts</p>
              <p className="text-3xl font-bold text-orange-400">{technicalCount}</p>
            </div>
            <div>
              <p className="text-xs text-orange-300">Best Score</p>
              <p className="text-2xl font-bold text-green-400">{technicalBestScore.toFixed(1)}/100</p>
            </div>
            <div>
              <p className="text-xs text-orange-300">Latest Score</p>
              <p className="text-2xl font-bold text-yellow-400">{technicalLatestScore.toFixed(1)}/100</p>
            </div>
          </div>
        </div>

      </div>


      {/* GD SESSION RESULTS */}

      <div className="bg-gray-900 rounded-xl p-8 border border-gray-700 mb-10">

        <h2 className="text-2xl font-bold mb-6 text-cyan-400">
          📊 Group Discussion History
        </h2>

        {gdAttempts.length === 0 && (

          <p className="text-gray-400 text-center py-8">
            No GD sessions completed yet.
          </p>

        )}

        {gdAttempts.map((gd, index) => (

          <div
            key={index}
            className="border border-gray-700 bg-gray-800 p-6 mb-4 rounded-lg hover:border-cyan-500 transition"
          >

            <div className="grid grid-cols-5 gap-4 mb-4">
              <div>
                <p className="text-gray-400 text-sm">Topic</p>
                <p className="text-white font-semibold text-base">{gd.topic}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Overall Score</p>
                <p className={`text-2xl font-bold ${gd.overallScore >= 6 ? "text-green-400" : gd.overallScore >= 4 ? "text-yellow-400" : "text-red-400"}`}>
                  {gd.overallScore || "N/A"}/10
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Speaking Time</p>
                <p className="text-white font-semibold">{gd.speakingTime}s</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Date</p>
                <p className="text-white font-semibold">{new Date(gd.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Time</p>
                <p className="text-white font-semibold">{new Date(gd.createdAt).toLocaleTimeString()}</p>
              </div>
            </div>

            {gd.scores && (

              <div className="grid grid-cols-5 gap-3 mt-4 p-4 bg-gray-700 rounded">

                <div className="text-center">
                  <p className="text-gray-300 text-xs">Communication</p>
                  <p className="text-cyan-400 font-bold text-lg">{gd.scores.communication || 0}</p>
                </div>

                <div className="text-center">
                  <p className="text-gray-300 text-xs">Confidence</p>
                  <p className="text-cyan-400 font-bold text-lg">{gd.scores.confidence || 0}</p>
                </div>

                <div className="text-center">
                  <p className="text-gray-300 text-xs">Relevance</p>
                  <p className="text-cyan-400 font-bold text-lg">{gd.scores.relevance || 0}</p>
                </div>

                <div className="text-center">
                  <p className="text-gray-300 text-xs">Participation</p>
                  <p className="text-cyan-400 font-bold text-lg">{gd.scores.participation || 0}</p>
                </div>

                <div className="text-center">
                  <p className="text-gray-300 text-xs">Critical Thinking</p>
                  <p className="text-cyan-400 font-bold text-lg">{gd.scores.criticalThinking || 0}</p>
                </div>

              </div>

            )}

          </div>

        ))}

      </div>


      {/* APTITUDE TEST RESULTS */}

      <div className="bg-gray-900 rounded-xl p-8 border border-gray-700 mb-10">

        <h2 className="text-2xl font-bold mb-6 text-purple-400">
          📈 Aptitude Test History
        </h2>

        {aptitudeAttempts.length === 0 && (

          <p className="text-gray-400 text-center py-8">
            No aptitude tests completed yet.
          </p>

        )}

        {aptitudeAttempts.map((apt, index) => (

          <div
            key={index}
            className="border border-gray-700 bg-gray-800 p-6 mb-4 rounded-lg hover:border-purple-500 transition"
          >

            <div className="grid grid-cols-5 gap-4 mb-4">
              <div>
                <p className="text-gray-400 text-sm">Attempt #{aptitudeAttempts.length - index}</p>
                <p className="text-white font-semibold text-lg">{apt.score || 0} / {apt.evaluation?.totalQuestions || 10}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Accuracy</p>
                <p className="text-purple-400 font-bold">
                  {apt.evaluation?.accuracy ? apt.evaluation.accuracy.toFixed(1) : 0}%
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Status</p>
                <p className={`font-semibold ${apt.score >= 7 ? "text-green-400" : apt.score >= 5 ? "text-yellow-400" : "text-red-400"}`}>
                  {apt.score >= 7 ? "✅ Excellent" : apt.score >= 5 ? "⚠️ Good" : "❌ Needs Work"}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Date</p>
                <p className="text-white font-semibold">{new Date(apt.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Time</p>
                <p className="text-white font-semibold">{new Date(apt.createdAt).toLocaleTimeString()}</p>
              </div>
            </div>

            {/* Toggle Details Button */}
            {apt.evaluation?.detailedResults && apt.evaluation.detailedResults.length > 0 && (
              <div className="mt-4">
                <button
                  onClick={() => setExpandedAptitude(expandedAptitude === index ? null : index)}
                  className="text-purple-400 hover:text-purple-300 font-semibold text-sm flex items-center gap-2"
                >
                  {expandedAptitude === index ? "▼ Hide Details" : "▶ View Detailed Results"}
                </button>

                {expandedAptitude === index && (
                  <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
                    {apt.evaluation.detailedResults.map((result, rIndex) => (
                      <div
                        key={rIndex}
                        className={`p-4 rounded-lg ${
                          result.isCorrect
                            ? "bg-green-900/20 border border-green-700/30"
                            : "bg-red-900/20 border border-red-700/30"
                        }`}
                      >
                        <p className="text-white font-medium mb-2">
                          Q{rIndex + 1}: {result.question}
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-400">Your Answer: </span>
                            <span className={`font-semibold ${result.selectedAnswer ? "text-white" : "text-gray-500"}`}>
                              {result.selectedAnswer || "Not Answered"}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">Correct Answer: </span>
                            <span className="text-green-400 font-semibold">
                              {result.correctAnswer}
                            </span>
                          </div>
                        </div>
                        <p className={`mt-2 text-sm font-semibold ${result.isCorrect ? "text-green-400" : "text-red-400"}`}>
                          {result.isCorrect ? "✓ Correct" : "✗ Incorrect"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

        ))}

      </div>


      {/* ATS RESULTS */}

      <div className="bg-gray-900 rounded-xl p-8 border border-gray-700">

        <h2 className="text-2xl font-bold mb-6 text-green-400">
          📄 ATS Resume Check History
        </h2>

        {atsResults.length === 0 && (

          <p className="text-gray-400 text-center py-8">
            No ATS checks completed yet.
          </p>

        )}

        {atsResults.map((ats, index) => (

          <div
            key={index}
            className="border border-gray-700 bg-gray-800 p-6 mb-4 rounded-lg hover:border-green-500 transition"
          >

            <div className="grid grid-cols-6 gap-4 mb-4">
              <div>
                <p className="text-gray-400 text-sm">Job Title</p>
                <p className="text-white font-semibold">{ats.jobTitle || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Overall Score</p>
                <p className={`text-2xl font-bold ${ats.overallScore >= 7 ? "text-green-400" : ats.overallScore >= 5 ? "text-yellow-400" : "text-red-400"}`}>
                  {ats.overallScore || "N/A"}/100
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Skill Score</p>
                <p className="text-cyan-400 font-bold">{ats.skillScore || 0}/100</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Format Score</p>
                <p className="text-cyan-400 font-bold">{Math.round((ats.skillScore + ats.keywordScore) / 2) || 0}/100</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Keyword Score</p>
                <p className="text-cyan-400 font-bold">{ats.keywordScore || 0}/100</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Date</p>
                <p className="text-white font-semibold">{new Date(ats.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {ats.matchedSkills && ats.matchedSkills.length > 0 && (
              <div className="mt-4 p-4 bg-green-900 rounded">
                <p className="text-green-200 text-sm font-semibold mb-2">✅ Matched Skills</p>
                <div className="flex flex-wrap gap-2">
                  {ats.matchedSkills.map((skill, i) => (
                    <span key={i} className="bg-green-700 text-green-100 text-xs px-2 py-1 rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}


      {/* TECHNICAL ROUND RESULTS */}

      <div className="bg-gray-900 rounded-xl p-8 border border-gray-700 mb-10">

        <h2 className="text-2xl font-bold mb-6 text-orange-400">
          💻 Technical Round History
        </h2>

        {technicalAttempts.length === 0 && (

          <p className="text-gray-400 text-center py-8">
            No technical rounds completed yet.
          </p>

        )}

        {technicalAttempts.map((tech, index) => (

          <div
            key={index}
            className="border border-gray-700 bg-gray-800 p-6 mb-4 rounded-lg hover:border-orange-500 transition"
          >

            <div className="grid grid-cols-6 gap-4 mb-4">
              <div>
                <p className="text-gray-400 text-sm">Problem</p>
                <p className="text-white font-semibold">{tech.problemTitle || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Language</p>
                <p className="text-orange-400 font-bold uppercase">{tech.language || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Score</p>
                <p className={`text-2xl font-bold ${tech.score >= 70 ? "text-green-400" : tech.score >= 50 ? "text-yellow-400" : "text-red-400"}`}>
                  {tech.score || 0}/100
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Test Cases</p>
                <p className="text-cyan-400 font-bold">{tech.testsPassed || 0}/{tech.totalTests || 0}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Execution Time</p>
                <p className="text-white font-semibold">{tech.executionTime || 0}ms</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Date</p>
                <p className="text-white font-semibold">{new Date(tech.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {tech.feedback && (
              <div className="mt-4 p-4 bg-gray-700 rounded">
                <p className="text-gray-300 text-sm font-semibold mb-2">💬 Feedback</p>
                <p className="text-gray-200 text-sm">{tech.feedback}</p>
              </div>
            )}

            {tech.finalCode && (
              <div className="mt-4">
                <details className="cursor-pointer">
                  <summary className="text-orange-400 hover:text-orange-300 font-semibold text-sm">
                    📝 View Submitted Code
                  </summary>
                  <pre className="mt-2 p-4 bg-gray-950 rounded overflow-x-auto text-xs text-gray-300 border border-gray-600">
                    {tech.finalCode}
                  </pre>
                </details>
              </div>
            )}

          </div>

        ))}

      </div>

            {ats.missingSkills && ats.missingSkills.length > 0 && (
              <div className="mt-4 p-4 bg-red-900 rounded">
                <p className="text-red-200 text-sm font-semibold mb-2">❌ Missing Skills</p>
                <div className="flex flex-wrap gap-2">
                  {ats.missingSkills.map((skill, i) => (
                    <span key={i} className="bg-red-700 text-red-100 text-xs px-2 py-1 rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>

        ))}

      </div>

    </div>
    </Layout>

  );

}