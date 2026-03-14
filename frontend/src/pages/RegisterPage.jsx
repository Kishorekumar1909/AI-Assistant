import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bot, Mail, Lock, User } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "", password2: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p) => ({ ...p, [e.target.name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      const data = err.response?.data || {};
      const fieldErrors = {};
      Object.keys(data).forEach((key) => {
        fieldErrors[key] = Array.isArray(data[key]) ? data[key][0] : data[key];
      });
      setErrors(fieldErrors);
      if (!Object.keys(fieldErrors).length) {
        toast.error("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <Bot size={22} color="#fff" />
          </div>
          <span className="auth-logo-text">AI Assistant</span>
        </div>

        <h1 className="auth-title">Create your account</h1>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="username">
              <User size={13} style={{ marginRight: 5, verticalAlign: "middle" }} />Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              className="form-input"
              placeholder="johndoe"
              value={form.username}
              onChange={handleChange}
              autoComplete="username"
              required
            />
            {errors.username && <span className="form-error">{errors.username}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              <Mail size={13} style={{ marginRight: 5, verticalAlign: "middle" }} />Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-input"
              placeholder="john@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              <Lock size={13} style={{ marginRight: 5, verticalAlign: "middle" }} />Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-input"
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password2">
              <Lock size={13} style={{ marginRight: 5, verticalAlign: "middle" }} />Confirm Password
            </label>
            <input
              id="password2"
              name="password2"
              type="password"
              className="form-input"
              placeholder="Repeat password"
              value={form.password2}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
            {errors.password2 && <span className="form-error">{errors.password2}</span>}
          </div>

          {errors.non_field_errors && (
            <p className="form-error" style={{ marginBottom: 12 }}>{errors.non_field_errors}</p>
          )}

          <button type="submit" className="btn btn-primary btn-full" disabled={loading} id="register-btn">
            {loading ? <span className="spinner" /> : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
