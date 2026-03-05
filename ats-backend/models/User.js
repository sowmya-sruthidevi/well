const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    photo: { type: String }, // filename stored
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);