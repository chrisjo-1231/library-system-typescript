import {
  type FormEvent,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  BookOpen,
  Mail,
  Lock,
  LogIn,
  Eye,
  EyeOff,
} from "lucide-react";

import api from "../services/api";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");

    if (!email.trim()) {
      setError(
        "Email address is required."
      );
      return;
    }

    if (!password) {
      setError(
        "Password is required."
      );
      return;
    }

    try {
      setLoading(true);

      const response =
        await api.post(
          "/auth/login",
          {
            email:
              email.trim(),
            password,
          }
        );

      const {
        token,
        user,
      } = response.data;

      if (!token || !user) {
        setError(
          "Invalid login response from server."
        );
        return;
      }

      // =========================
      // SAVE AUTH DATA
      // =========================

      localStorage.setItem(
        "token",
        token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      // =========================
      // REDIRECT BY ROLE
      // =========================

      if (
        user.role ===
        "LIBRARIAN"
      ) {
        navigate(
          "/librarian",
          {
            replace: true,
          }
        );
      } else if (
        user.role ===
        "ADMIN"
      ) {
        navigate(
          "/admin",
          {
            replace: true,
          }
        );
      } else {
        navigate(
          "/student",
          {
            replace: true,
          }
        );
      }
    } catch (error: any) {
      console.error(
        "LOGIN ERROR:",
        error
      );

      setError(
        error?.response?.data
          ?.message ||
          "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">

        {/* =========================
            LOGO
        ========================== */}

        <div className="login-logo">

          <div className="login-logo-icon">
            <BookOpen size={28} />
          </div>

          <h1>
            Library OPAC
          </h1>

          <p>
            Library Management System
          </p>

        </div>

        {/* =========================
            LOGIN CARD
        ========================== */}

        <div className="login-card">

          <div className="login-header">

            <h2>
              Welcome Back
            </h2>

            <p>
              Sign in to access
              your library account.
            </p>

          </div>

          {/* =========================
              ERROR
          ========================== */}

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          {/* =========================
              FORM
          ========================== */}

          <form
            onSubmit={
              handleSubmit
            }
          >

            {/* EMAIL */}

            <div className="form-group">

              <label htmlFor="email">
                Email Address
              </label>

              <div className="input-wrapper">

                <Mail size={18} />

                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }
                  autoComplete="email"
                  disabled={
                    loading
                  }
                  required
                />

              </div>

            </div>

            {/* PASSWORD */}

            <div className="form-group">

              <label htmlFor="password">
                Password
              </label>

              <div className="input-wrapper">

                <Lock size={18} />

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  autoComplete="current-password"
                  disabled={
                    loading
                  }
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (previous) =>
                        !previous
                    )
                  }
                  disabled={
                    loading
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff
                      size={18}
                    />
                  ) : (
                    <Eye
                      size={18}
                    />
                  )}
                </button>

              </div>

            </div>

            {/* LOGIN BUTTON */}

            <button
              type="submit"
              className="login-button"
              disabled={
                loading
              }
            >

              {loading ? (
                "Signing in..."
              ) : (
                <>
                  <LogIn
                    size={18}
                  />

                  Sign In
                </>
              )}

            </button>

          </form>

          {/* =========================
              REGISTER
          ========================== */}

          <div className="login-register">

            <span>
              Don't have an account?
            </span>

            <Link to="/register">
              Create an account
            </Link>

          </div>

          {/* =========================
              BACK TO OPAC
          ========================== */}

          <div className="login-footer">

            <Link to="/">
              ← Back to Library Catalog
            </Link>

          </div>

        </div>

        {/* COPYRIGHT */}

        <p className="login-copyright">
          © 2026 Library OPAC
        </p>

      </div>
    </div>
  );
}