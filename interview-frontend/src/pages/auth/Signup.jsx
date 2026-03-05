import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";

export default function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    photo: null,
    photoPreview: null,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "photo") {
      const file = files[0];
      setFormData({
        ...formData,
        photo: file,
        photoPreview: file ? URL.createObjectURL(file) : null,
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.password) {
      alert("All fields are required");
      return;
    }

    const form = new FormData();
    form.append("fullName", formData.fullName);
    form.append("email", formData.email);
    form.append("password", formData.password);

    if (formData.photo) {
      form.append("photo", formData.photo);
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/auth/signup`,
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data?.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }

      alert("Signup successful. Please login.");
      navigate("/login");

    } catch (err) {
      alert(err.response?.data?.error || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center 
    bg-gradient-to-br from-[#0f172a] via-[#0b1a35] to-[#0f172a] text-white">

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-2xl 
        border border-white/20 rounded-3xl 
        p-10 w-[420px] shadow-2xl"
      >
        <h1 className="text-3xl font-bold text-center mb-6">
          Create Account
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            required
            onChange={handleChange}
            className="w-full p-3 rounded-lg 
            bg-white/20 border border-white/30 text-white"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            onChange={handleChange}
            className="w-full p-3 rounded-lg 
            bg-white/20 border border-white/30 text-white"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            onChange={handleChange}
            className="w-full p-3 rounded-lg 
            bg-white/20 border border-white/30 text-white"
          />

          <div>
            <label className="block text-sm mb-2">
              Upload Profile Photo (Optional)
            </label>

            <input
              type="file"
              name="photo"
              accept="image/*"
              onChange={handleChange}
              className="w-full text-sm"
            />

            {formData.photoPreview && (
              <img
                src={formData.photoPreview}
                alt="Preview"
                className="w-20 h-20 mt-4 rounded-full object-cover border"
              />
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-semibold
            bg-gradient-to-r from-blue-500 to-purple-600
            shadow-[0_0_25px_rgba(99,102,241,0.6)]
            hover:scale-105 transition disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p
          onClick={() => navigate("/login")}
          className="mt-5 text-sm text-center cursor-pointer hover:underline"
        >
          Already have an account? Login
        </p>

      </motion.div>
    </div>
  );
}