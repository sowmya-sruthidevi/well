import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="px-10 py-16">
        <h1 className="text-4xl font-bold mb-12 text-white">
          AI Interview Dashboard
        </h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

          {/* ATS */}
          <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-xl">
            <h2 className="text-xl font-semibold mb-3 text-white">
              ATS Round
            </h2>
            <p className="text-gray-300 mb-6">
              Analyze resume vs job description.
            </p>

            <button
              onClick={() => navigate("/ats")}
              className="bg-blue-600 px-6 py-3 rounded-xl 
              shadow-[0_0_25px_rgba(59,130,246,0.5)] 
              hover:bg-blue-700 transition text-white"
            >
              Start ATS
            </button>
          </div>

          {/* Aptitude */}
          <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-xl">
            <h2 className="text-xl font-semibold mb-3 text-white">
              Aptitude Round
            </h2>
            <p className="text-gray-300 mb-6">
              Test quantitative & reasoning skills.
            </p>

            <button
              onClick={() => navigate("/aptitude/start")}
              className="bg-green-600 px-6 py-3 rounded-xl 
              shadow-[0_0_25px_rgba(34,197,94,0.5)] 
              hover:bg-green-700 transition text-white"
            >
              Start Test
            </button>
          </div>

          {/* Group Discussion */}
          <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-xl">
            <h2 className="text-xl font-semibold mb-3 text-white">
              Group Discussion
            </h2>
            <p className="text-gray-300 mb-6">
              Collaborate in a simulated group discussion.
            </p>

            <button
              onClick={() => navigate("/gd")}
              className="bg-purple-600 px-6 py-3 rounded-xl 
              shadow-[0_0_25px_rgba(147,51,234,0.5)] 
              hover:bg-purple-700 transition text-white"
            >
              Start GD
            </button>
          </div>

          {/* Technical Round */}
          <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-xl">
            <h2 className="text-xl font-semibold mb-3 text-white">
              Technical Round
            </h2>
            <p className="text-gray-300 mb-6">
              Code interview with live execution.
            </p>

            <button
              onClick={() => navigate("/technical")}
              className="bg-orange-600 px-6 py-3 rounded-xl 
              shadow-[0_0_25px_rgba(249,115,22,0.5)] 
              hover:bg-orange-700 transition text-white"
            >
              Start Coding
            </button>
          </div>

          {/* Bot Interview */}
          <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-xl">
            <h2 className="text-xl font-semibold mb-3 text-white">
              🤖 Bot Interview
            </h2>
            <p className="text-gray-300 mb-6">
              AI-powered behavioral interview with voice.
            </p>

            <button
              onClick={() => navigate("/bot-interview")}
              className="bg-pink-600 px-6 py-3 rounded-xl 
              shadow-[0_0_25px_rgba(236,72,153,0.5)] 
              hover:bg-pink-700 transition text-white"
            >
              Start Interview
            </button>
          </div>

          {/* Student Dashboard */}
          <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-xl">
            <h2 className="text-xl font-semibold mb-3 text-white">
              Student Dashboard
            </h2>
            <p className="text-gray-300 mb-6">
              View your attempts, scores and performance history.
            </p>

            <button
              onClick={() => navigate("/student-dashboard")}
              className="bg-cyan-600 px-6 py-3 rounded-xl 
              shadow-[0_0_25px_rgba(34,211,238,0.5)] 
              hover:bg-cyan-700 transition text-white"
            >
              View Dashboard
            </button>
          </div>

        </div>
      </div>
    </Layout>
  );
}