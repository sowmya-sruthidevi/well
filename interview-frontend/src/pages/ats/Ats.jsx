import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import Navbar from "../../components/Navbar";
import GlassCard from "../../components/GlassCard";
import { motion } from "framer-motion";
import api from "../../services/api";
import Webcam from "react-webcam";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Cell
} from "recharts";

export default function ATS() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [improvedResume, setImprovedResume] = useState(null);
  const [improvingResume, setImprovingResume] = useState(false);

  const webcamRef = useRef(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const captureImage = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    const blob = await fetch(imageSrc).then((res) => res.blob());

    const capturedFile = new File([blob], "captured_resume.png", {
      type: "image/png",
    });

    setFile(capturedFile);
    setShowCamera(false);
  };

  const handleAnalyze = async () => {
    if (!file || !jobDescription) {
      alert("Resume and Job Description required.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobDescription", jobDescription);

    setLoading(true);

    try {
      const res = await api.post("/api/ats/analyze", formData);
      setResult(res.data);
      
      console.log("✅ ATS analysis completed - results ready to view");
      
      // Results will stay visible until user manually navigates
    } catch (error) {
      console.error(error);
      alert("ATS analysis failed.");
    }

    setLoading(false);
  };

  const handleGenerateImprovedResume = async () => {
    if (!file || !result || !result._id) {
      alert("Please analyze your resume first.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("resultId", result._id);

    setImprovingResume(true);

    try {
      const res = await api.post("/api/ats/improve-resume", formData);
      setImprovedResume(res.data.improvedResume);
      
      console.log("✅ Improved resume generated successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to generate improved resume. Please try again.");
    }

    setImprovingResume(false);
  };

  const downloadImprovedResume = () => {
    if (!improvedResume) return;

    const blob = new Blob([improvedResume], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "improved-resume.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyImprovedResume = () => {
    if (!improvedResume) return;

    navigator.clipboard.writeText(improvedResume);
    alert("✅ Improved resume copied to clipboard!");
  };

  const scoreData = result
    ? [
        { name: "Skill", value: result.skillScore },
        { name: "Experience", value: result.experienceScore },
        { name: "Keyword", value: result.keywordScore }
      ]
    : [];

  const overallData = result
    ? [{ name: "Overall", value: result.overallScore }]
    : [];

  const getColor = (value) => {
    if (value < 50) return "#ef4444";
    if (value < 75) return "#f59e0b";
    return "#22c55e";
  };

  return (
    <Layout>
      <Navbar />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-16 py-12"
      >
        <h2 className="text-4xl font-bold mb-12">
          ATS Resume Analyzer
        </h2>

        <div className="grid grid-cols-2 gap-10">

          {/* Upload Section */}
          <GlassCard>
            <h3 className="text-xl font-semibold mb-6">
              Upload Resume
            </h3>

            <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/30 rounded-2xl p-10 cursor-pointer hover:bg-white/5 transition">
              <input
                type="file"
                accept=".doc,.docx,.pdf,.png,.jpg,.jpeg"
                className="hidden"
                onChange={handleFileChange}
              />
              <p className="text-gray-300">
                {file ? file.name : "Upload file or capture image"}
              </p>
            </label>

            {/* Camera Button */}
            <button
              onClick={() => setShowCamera(!showCamera)}
              className="mt-4 bg-purple-600 px-4 py-2 rounded-lg hover:bg-purple-700 transition"
            >
              {showCamera ? "Close Camera" : "Capture Resume Image"}
            </button>

            {/* Camera View */}
            {showCamera && (
              <div className="mt-4">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/png"
                  className="rounded-lg"
                />
                <button
                  onClick={captureImage}
                  className="mt-2 bg-green-600 px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  Capture
                </button>
              </div>
            )}
          </GlassCard>

          {/* Job Description */}
          <GlassCard>
            <h3 className="text-xl font-semibold mb-4">
              Job Description
            </h3>

            <textarea
              rows={10}
              placeholder="Paste job description here..."
              className="w-full p-4 rounded-xl bg-white/20 border border-white/30 text-white resize-none"
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </GlassCard>

        </div>

        <div className="mt-10">
          <button
            onClick={handleAnalyze}
            className="bg-blue-600 px-8 py-3 rounded-xl shadow-[0_0_25px_rgba(59,130,246,0.6)] hover:bg-blue-700 transition"
          >
            {loading ? "Analyzing..." : "Analyze Resume"}
          </button>
        </div>

        {result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-16"
          >
            <GlassCard>

              <h3
                className="text-2xl font-semibold mb-6 text-center"
                style={{ color: getColor(result.overallScore) }}
              >
                Overall Score: {result.overallScore}%
              </h3>

              <div className="w-full h-72 mb-12">
                <ResponsiveContainer>
                  <RadialBarChart
                    innerRadius="70%"
                    outerRadius="100%"
                    data={overallData}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <RadialBar
                      minAngle={15}
                      background={{ fill: "#1e293b" }}
                      clockWise
                      dataKey="value"
                      fill={getColor(result.overallScore)}
                    />
                    <Tooltip />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>

              <h4 className="text-xl font-semibold mb-4">
                Score Breakdown
              </h4>

              <div className="w-full h-72 mb-12">
                <ResponsiveContainer>
                  <BarChart data={scoreData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#cbd5e1" />
                    <YAxis domain={[0, 100]} stroke="#cbd5e1" />
                    <Tooltip />
                    <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                      {scoreData.map((entry, index) => (
                        <Cell
                          key={index}
                          fill={getColor(entry.value)}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Matched Skills */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold mb-2">Matched Skills</h4>
                <ul>
                  {result.matchedSkills.map((skill, i) => (
                    <li key={i} className="text-green-400">• {skill}</li>
                  ))}
                </ul>
              </div>

              {/* Missing Skills */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold mb-2">Missing Skills</h4>
                <ul>
                  {result.missingSkills.map((skill, i) => (
                    <li key={i} className="text-red-400">• {skill}</li>
                  ))}
                </ul>
              </div>

              {/* Strengths */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold mb-2">Strengths</h4>
                <ul>
                  {result.strengths.map((s, i) => (
                    <li key={i}>• {s}</li>
                  ))}
                </ul>
              </div>

              {/* Improvements */}
              <div>
                <h4 className="text-lg font-semibold mb-2">Improvement Areas</h4>
                <ul>
                  {result.improvementAreas.map((s, i) => (
                    <li key={i} className="text-yellow-400">• {s}</li>
                  ))}
                </ul>
              </div>

              {/* AI Resume Generation CTA */}
              <div className="mt-10 p-6 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-2 border-purple-500/40 rounded-2xl">
                <div className="flex items-start gap-4">
                  <div className="text-5xl">✨</div>
                  <div className="flex-1">
                    <h4 className="text-2xl font-bold text-purple-300 mb-2">
                      Want an Optimized Resume?
                    </h4>
                    <p className="text-gray-300 mb-4 leading-relaxed">
                      Our AI can create an <span className="text-white font-semibold">enhanced, ATS-optimized resume</span> 
                      {" "}tailored specifically for this job. It will:
                    </p>
                    <ul className="text-sm text-gray-300 space-y-2 mb-4 ml-4">
                      <li>✅ Incorporate all missing skills identified above</li>
                      <li>✅ Address improvement areas with better phrasing</li>
                      <li>✅ Optimize keywords for ATS systems</li>
                      <li>✅ Format professionally for maximum impact</li>
                      <li>✅ Ready to copy-paste or download</li>
                    </ul>
                    <button
                      onClick={handleGenerateImprovedResume}
                      disabled={improvingResume}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-10 rounded-xl transition shadow-[0_0_30px_rgba(168,85,247,0.5)] disabled:opacity-50 text-lg"
                    >
                      {improvingResume ? "🔄 Generating Your Resume..." : "🚀 Create My Optimized Resume"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-4 mt-10 justify-center flex-wrap">
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
                  🔄 Analyze Another Resume
                </button>
              </div>

            </GlassCard>
          </motion.div>
        )}

        {/* Improved Resume Section */}
        {improvedResume && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-10"
          >
            <GlassCard>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-semibold">
                  ✨ Your Improved Resume
                </h3>
                <div className="flex gap-3">
                  <button
                    onClick={copyImprovedResume}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition"
                  >
                    📋 Copy
                  </button>
                  <button
                    onClick={downloadImprovedResume}
                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition"
                  >
                    💾 Download
                  </button>
                </div>
              </div>

              <div className="bg-white/10 p-6 rounded-xl border border-white/20 max-h-[600px] overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed font-mono">
                  {improvedResume}
                </pre>
              </div>

              <div className="mt-4 p-4 bg-green-600/20 border border-green-600/40 rounded-lg">
                <p className="text-green-300 text-sm">
                  ✅ This resume has been optimized based on your ATS analysis, incorporating missing skills and addressing improvement areas!
                </p>
              </div>
            </GlassCard>
          </motion.div>
        )}

      </motion.div>
    </Layout>
  );
}