const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const User = require("../models/User");

const router = express.Router();

/* =============================
   MULTER CONFIGURATION
============================= */

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

/* =============================
   SIGNUP WITH PHOTO
============================= */

router.post("/signup", upload.single("photo"), async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      password: hashed,
      photo: req.file ? req.file.filename : null,
    });

    const photoUrl = user.photo
      ? `${req.protocol}://${req.get("host")}/uploads/${user.photo}`
      : null;

    res.json({
      message: "User created successfully",
      userId: user._id,
      email: user.email,
      user: {
        fullName: user.fullName,
        email: user.email,
        photo: user.photo,
        photoUrl,
      },
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =============================
   LOGIN
============================= */

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json("User not found");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json("Invalid credentials");

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const photoUrl = user.photo
      ? `${req.protocol}://${req.get("host")}/uploads/${user.photo}`
      : null;

    res.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        photo: user.photo,
        photoUrl,
      },
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;