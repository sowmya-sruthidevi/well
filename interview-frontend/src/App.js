import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Dashboard from "./pages/dashboard/Dashboard";
import Ats from "./pages/ats/Ats";
import Start from "./pages/aptitude/Start";
import Test from "./pages/aptitude/Test";
import Result from "./pages/aptitude/Result";
import GDRoom from "./pages/gd/GDRoom";
import GDResult from "./pages/gd/GDResult";
import TechnicalRound from "./pages/technical/TechnicalRound";
import BotInterview from "./pages/interview/BotInterview";
import ProtectedRoute from "./components/ProtectedRoute";
import StudentDashboard from "./pages/dashboard/StudentDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ats" element={<Ats />} />
          <Route path="/aptitude/start" element={<Start />} />
          <Route path="/aptitude/test" element={<Test />} />
          <Route path="/aptitude/result" element={<Result />} />

          {/* 🔥 GROUP DISCUSSION ROUTE */}
          <Route path="/gd" element={<GDRoom />} />
          <Route path="/gd-result" element={<GDResult />} />
          
          {/* Technical Round Route */}
          <Route path="/technical" element={<TechnicalRound />} />

          {/* 🤖 BOT INTERVIEW ROUTE */}
          <Route path="/bot-interview" element={<BotInterview />} />
          
          <Route path="/student-dashboard" element={<StudentDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;