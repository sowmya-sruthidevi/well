const mongoose = require("mongoose");

const GDSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    unique: true
  },
  topic: String,
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "GDTopic"
  },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"]
  },
  transcript: [
    {
      role: {
        type: String,
        enum: ["user", "bot"]
      },
      name: String,
      content: String,
      timestamp: {
        type: Date,
        default: Date.now
      }
    }
  ],
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: Date,
  duration: Number, // in seconds
  userSpeakingTime: {
    type: Number,
    default: 0
  },
  messageCount: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model("GDSession", GDSessionSchema);