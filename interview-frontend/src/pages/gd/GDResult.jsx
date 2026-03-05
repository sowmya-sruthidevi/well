import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import GDRadarChart from '../../components/GDRadarChart';

function GDResult() {
  const navigate = useNavigate();
  const location = useLocation();
  const evaluation = location.state?.evaluation || null;
  const session = location.state?.session || null;
  const stats = location.state?.stats || null;

  if (!evaluation) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center p-6">
        <div className="bg-gray-900 rounded-xl p-8 max-w-md text-center">
          <p className="text-xl mb-4">No evaluation data found</p>
          <button
            onClick={() => navigate('/gd')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
          >
            Start New GD
          </button>
        </div>
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-400';
    if (score >= 6) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getScoreLabel = (score) => {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Average';
    return 'Needs Improvement';
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Group Discussion Results</h1>
          <p className="text-gray-400">Topic: {session?.topic}</p>
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
        {/* Left: Scores and Metrics */}
        <div className="col-span-2">
          {/* Individual Scores */}
          <div className="bg-gray-900 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold mb-6 text-cyan-400">Performance Breakdown</h2>
            <div className="space-y-4">
              {[
                { label: 'Communication', score: evaluation.communication },
                { label: 'Confidence', score: evaluation.confidence },
                { label: 'Relevance', score: evaluation.relevance },
                { label: 'Participation', score: evaluation.participation },
                { label: 'Critical Thinking', score: evaluation.criticalThinking }
              ].map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold">{item.label}</span>
                    <span className={`font-bold ${getScoreColor(item.score)}`}>
                      {item.score}/10
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        item.score >= 8 ? 'bg-green-500' :
                        item.score >= 6 ? 'bg-yellow-500' :
                        'bg-orange-500'
                      }`}
                      style={{ width: `${(item.score / 10) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Session Statistics */}
          {stats && (
            <div className="bg-gray-900 rounded-xl p-6 mb-6">
              <h2 className="text-xl font-bold mb-4 text-cyan-400">Session Statistics</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Total Duration</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {Math.floor(stats.totalDuration / 60)}:{String(stats.totalDuration % 60).padStart(2, '0')}
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Speaking Time</p>
                  <p className="text-2xl font-bold text-green-400">
                    {stats.userSpeakingTime}s
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Participation %</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {stats.participationPercentage}%
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Messages Sent</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {stats.messageCount || session?.transcript?.filter(t => t.role === 'user').length || 0}
                  </p>
                </div>
              </div>
            </div>
          )}

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

        {/* Right: Radar Chart and Summary */}
        <div className="bg-gray-900 rounded-xl p-6">
          {/* Radar Chart */}
          <div className="mb-6">
            <GDRadarChart scores={evaluation} />
          </div>

          {/* Summary */}
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${
              evaluation.overallScore >= 7 ? 'bg-green-900 bg-opacity-20 border border-green-700' :
              evaluation.overallScore >= 5 ? 'bg-yellow-900 bg-opacity-20 border border-yellow-700' :
              'bg-red-900 bg-opacity-20 border border-red-700'
            }`}>
              <p className={`font-bold ${
                evaluation.overallScore >= 7 ? 'text-green-400' :
                evaluation.overallScore >= 5 ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {getScoreLabel(evaluation.overallScore)}
              </p>
              <p className="text-sm text-gray-300 mt-2">
                {evaluation.overallScore >= 7 && 'Excellent performance! You demonstrated strong communication and critical thinking skills.'}
                {evaluation.overallScore >= 5 && evaluation.overallScore < 7 && 'Good effort! Work on improving your confidence and providing more structured arguments.'}
                {evaluation.overallScore < 5 && 'Keep practicing! Focus on active listening and expressing your ideas more clearly.'}
              </p>
            </div>

            {/* Detailed AI Analysis */}
            {evaluation.aiAnalysis && (
              <div className="p-4 bg-blue-900 bg-opacity-20 border border-blue-700 rounded-lg">
                <p className="text-sm text-blue-300 font-semibold mb-2">📝 Detailed Feedback</p>
                <p className="text-sm text-gray-300">{evaluation.aiAnalysis}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-8 justify-center">
        <button
          onClick={() => navigate('/student-dashboard')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition shadow-lg"
        >
          📊 View Dashboard
        </button>
        <button
          onClick={() => navigate('/gd')}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition shadow-lg"
        >
          🔄 Start New GD
        </button>
      </div>
    </div>
  );
}

export default GDResult;
