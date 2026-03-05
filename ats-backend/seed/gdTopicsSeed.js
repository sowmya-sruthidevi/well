const mongoose = require("mongoose");
require("dotenv").config();

const GDTopic = require("../models/GDTopic");

mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err));

const topics = [
  // Easy Topics
  {
    topic: "Is artificial intelligence good for society?",
    difficulty: "easy",
    duration: 5,
    context: "A balanced question about AI's impact on modern society",
    suggestedKeyPoints: [
      "Benefits: automation, healthcare, efficiency",
      "Risks: job displacement, privacy, bias",
      "Solutions: regulation, education, responsible development"
    ],
    category: "technology"
  },
  {
    topic: "Should social media be regulated?",
    difficulty: "easy",
    duration: 5,
    context: "Discusses social media governance and user protection",
    suggestedKeyPoints: [
      "User privacy and data protection",
      "Misinformation and fake news",
      "Mental health impacts",
      "Freedom of speech vs moderation"
    ],
    category: "social"
  },
  {
    topic: "Is remote work better than office work?",
    difficulty: "easy",
    duration: 5,
    context: "Explores the pros and cons of working from home",
    suggestedKeyPoints: [
      "Flexibility and work-life balance",
      "Team collaboration and communication",
      "Productivity metrics",
      "Cost savings and environmental impact"
    ],
    category: "work"
  },

  // Medium Topics
  {
    topic: "Should higher education be free for all?",
    difficulty: "medium",
    duration: 5,
    context: "Debates accessibility and affordability of education",
    suggestedKeyPoints: [
      "Equal opportunity argument",
      "Government funding challenges",
      "Quality and resource allocation",
      "Economic impact and debt",
      "International best practices"
    ],
    category: "education"
  },
  {
    topic: "Is sustainability more important than economic growth?",
    difficulty: "medium",
    duration: 5,
    context: "Examines the balance between environmental and economic priorities",
    suggestedKeyPoints: [
      "Climate change urgency",
      "Long-term economic value",
      "Corporate responsibility",
      "Consumer behavior change",
      "Government policies and incentives"
    ],
    category: "environment"
  },
  {
    topic: "Should companies prioritize profit or social responsibility?",
    difficulty: "medium",
    duration: 5,
    context: "Explores corporate ethics and stakeholder interests",
    suggestedKeyPoints: [
      "Shareholder vs stakeholder value",
      "Environmental and social impact",
      "Brand reputation and loyalty",
      "Regulatory compliance",
      "Long-term vs short-term thinking"
    ],
    category: "business"
  },
  {
    topic: "Is data privacy more important than technological innovation?",
    difficulty: "medium",
    duration: 5,
    context: "Debates the balance between privacy rights and progress",
    suggestedKeyPoints: [
      "Surveillance vs innovation",
      "Consent and transparency",
      "Security and hacking risks",
      "Competitive advantage",
      "User empowerment"
    ],
    category: "technology"
  },

  // Hard Topics
  {
    topic: "Should we prioritize automation or job preservation?",
    difficulty: "hard",
    duration: 5,
    context: "Complex discussion about technology's role in employment",
    suggestedKeyPoints: [
      "Economic transformation cycles",
      "Retraining and education programs",
      "Universal basic income proposals",
      "Industry disruption patterns",
      "Global competitiveness",
      "Social inequality widening"
    ],
    category: "economy"
  },
  {
    topic: "Is immigration beneficial or detrimental to a nation's economy?",
    difficulty: "hard",
    duration: 5,
    context: "Nuanced discussion about immigration economics and society",
    suggestedKeyPoints: [
      "Labor market effects",
      "Innovation and entrepreneurship",
      "Wage and employment impacts",
      "Fiscal costs and benefits",
      "Social integration challenges",
      "Brain drain and brain gain"
    ],
    category: "politics"
  },
  {
    topic: "Should developing nations prioritize industrialization or environmental conservation?",
    difficulty: "hard",
    duration: 5,
    context: "Examines development dilemmas in emerging economies",
    suggestedKeyPoints: [
      "Economic development needs",
      "Environmental degradation costs",
      "Climate change equity",
      "Technology transfer",
      "International agreements",
      "Sustainable alternatives",
      "Social welfare considerations"
    ],
    category: "development"
  }
];

async function seedTopics(){
  try{
    await GDTopic.deleteMany({});
    const inserted = await GDTopic.insertMany(topics);
    
    console.log(`✅ Successfully seeded ${inserted.length} GD topics`);
    
    // Display stats
    const stats = await GDTopic.aggregate([
      {
        $group: {
          _id: "$difficulty",
          count: { $sum: 1 }
        }
      }
    ]);
    console.log("📊 Topic distribution:", stats);
    
    process.exit();
  }catch(error){
    console.log("❌ Seeding failed:", error.message);
    process.exit(1);
  }
}

seedTopics();