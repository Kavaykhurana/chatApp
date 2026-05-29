import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login, authLoading } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const nextErrors = {};

    if (!form.email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = "Enter a valid email";
    }

    if (!form.password) {
      nextErrors.password = "Password is required";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    await login(form);
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Welcome back</h1>
        <p>Log in to continue your conversations.</p>
        <form onSubmit={handleSubmit} noValidate>
          <label>
            Email
            <input
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </label>
          <button type="submit" disabled={authLoading}>
            {authLoading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="auth-switch">
          Need an account? <Link to="/register">Register</Link>
        </p>
      </section>
    </main>
  );
};

export default Login;
