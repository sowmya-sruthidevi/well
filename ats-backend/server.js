require("dotenv").config();

const express=require("express");
const mongoose=require("mongoose");
const cors=require("cors");
const path = require("path");
const fs = require("fs");

const app=express();

// CORS configuration for production and development
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  process.env.FRONTEND_URL // Will be your Vercel URL
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Health check endpoint for Render
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

const gdRoutes=require("./routes/gd");
const authRoutes=require("./routes/auth");
const atsRoutes=require("./routes/ats");
const questionsRoutes=require("./routes/questions");
const dashboardRoutes=require("./routes/dashboard");
const technicalRoutes=require("./routes/technical");
const botInterviewRoutes=require("./routes/botInterview");

app.use("/api/gd",gdRoutes);
app.use("/api/auth",authRoutes);
app.use("/api/ats",atsRoutes);
app.use("/api/questions",questionsRoutes);
app.use("/api/dashboard",dashboardRoutes);
app.use("/api/technical",technicalRoutes);
app.use("/api/bot-interview",botInterviewRoutes);

//Serve frontend static files (for Render deployment)
const buildPath = path.resolve(__dirname, "../interview-frontend/build");
console.log("Looking for build at:", buildPath);
console.log("Build exists:", fs.existsSync(buildPath));

if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
  
  // Catch-all route for client-side routing (must be after API routes)
  // Exclude API routes from catch-all
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(buildPath, "index.html"));
  });
} else {
  console.warn("⚠️  Frontend build folder not found. Will show API-only mode.");
  
  // Fallback: show API status
  app.get("/", (req, res) => {
    res.status(200).json({ 
      status: "API Server Running", 
      message: "Frontend build not found. Deploy with 'npm run build' in interview-frontend folder.",
      apiEndpoints: [
        "/api/auth",
        "/api/bot-interview",
        "/api/ats",
        "/api/gd",
        "/api/technical",
        "/api/dashboard",
        "/api/questions"
      ]
    });
  });
}

// MongoDB Connection with proper error handling
console.log("🔄 Attempting MongoDB connection...");
console.log("MONGO_URI exists:", !!process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 10000, // Timeout after 10s instead of 30s
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log("✅ MongoDB Connected Successfully");
  console.log("📊 Database:", mongoose.connection.name);
})
.catch(err => {
  console.error("❌ MongoDB Connection Error:");
  console.error("Error name:", err.name);
  console.error("Error message:", err.message);
  console.error("Full error:", err);
  process.exit(1); // Exit if DB fails - Render will restart
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});