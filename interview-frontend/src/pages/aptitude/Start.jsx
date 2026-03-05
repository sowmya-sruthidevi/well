import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Layout from "../../components/Layout";

export default function Start() {
  const navigate = useNavigate();

  useEffect(() => {
    const startTest = async () => {
      try {
        const res = await api.post("/api/questions/start-test");

        localStorage.setItem("questions", JSON.stringify(res.data.questions));
        localStorage.setItem("duration", res.data.duration);
        localStorage.setItem("sessionId", res.data.sessionId);

        navigate("/aptitude/test");
      } catch (error) {
        alert("Failed to start test.");
      }
    };

    startTest();
  }, [navigate]);

  return (
    <Layout>
      <div className="flex items-center justify-center h-96">
        <h2 className="text-2xl font-semibold animate-pulse">
          Preparing your test...
        </h2>
      </div>
    </Layout>
  );
}