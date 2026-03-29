import React, { useState,useCallback,useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bot, Mail, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // console.log(error)
  const handleChange = async (e) => {
    e.preventDefault()
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    // console.log(form)
    // setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // console.log(form)
      await login(form);
      navigate("/");
    } catch (err) {
      const data = err.response?.data;
      const msg =
        data?.detail ||
        data?.non_field_errors?.[0] ||
        "Invalid email or password.";
      setError(msg);
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

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in with your email to continue</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              <Mail size={13} style={{ marginRight: 5, verticalAlign: "middle" }} />
              Email
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
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              <Lock size={13} style={{ marginRight: 5, verticalAlign: "middle" }} />
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-input"
              placeholder="Your password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <p className="form-error" style={{ marginBottom: 12 }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
            id="login-btn"
          >
            {loading ? <span className="spinner" /> : "Sign In"}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}