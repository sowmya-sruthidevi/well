require("dotenv").config();

const express=require("express");
const mongoose=require("mongoose");
const cors=require("cors");

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

mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>{
console.log(`Server running on port ${PORT}`);
});