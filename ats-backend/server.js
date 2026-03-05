require("dotenv").config();

const express=require("express");
const mongoose=require("mongoose");
const cors=require("cors");

const app=express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

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

app.listen(5000,()=>{
console.log("Server running on port 5000");
});