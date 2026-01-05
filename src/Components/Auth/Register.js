import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Navbar } from "../Landing/Navbar";

const RegisterPage = () => {
  const [usernameValue, setUsername] = useState("");
  const [passwordValue, setPassword] = useState("");
  const [confirmPasswordValue, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isPasswordTouched, setPasswordTouched] = useState(false);
  const [isConfirmTouched, setConfirmTouched] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  const trimmedUsername = useMemo(() => usernameValue.trim(), [usernameValue]);

  const passwordEmptyError = isPasswordTouched && passwordValue === "";
  const confirmEmptyError = isConfirmTouched && confirmPasswordValue === "";
  const confirmMismatchError =
    isConfirmTouched &&
    confirmPasswordValue !== "" &&
    passwordValue !== "" &&
    confirmPasswordValue !== passwordValue;

  const usernameError =
    trimmedUsername.length > 0 && trimmedUsername.length < 3
      ? "Username must be at least 3 characters."
      : "";

  const canSubmit =
    !loading &&
    apiUrl &&
    trimmedUsername.length >= 3 &&
    passwordValue.length > 0 &&
    confirmPasswordValue.length > 0 &&
    confirmPasswordValue === passwordValue;

  const handleRegister = async (event) => {
    event.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!apiUrl) {
      setErrorMsg("Missing API URL. Check REACT_APP_API_URL in your env.");
      return;
    }

    // Mark touched so errors show if user submits too early
    setPasswordTouched(true);
    setConfirmTouched(true);

    if (!trimmedUsername || trimmedUsername.length < 3) {
      setErrorMsg("Please enter a valid username (min 3 characters).");
      return;
    }
    if (!passwordValue) {
      setErrorMsg("Please choose a password.");
      return;
    }
    if (!confirmPasswordValue) {
      setErrorMsg("Please confirm your password.");
      return;
    }
    if (confirmPasswordValue !== passwordValue) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        username: trimmedUsername,
        password: passwordValue,
      };

      const response = await fetch(`${apiUrl}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      // Try to parse a JSON message (works whether ok or not)
      let body = null;
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        body = await response.json().catch(() => null);
      } else {
        const text = await response.text().catch(() => "");
        body = text ? { message: text } : null;
      }

      if (response.ok) {
        setSuccessMsg("Account created! Redirecting to login…");
        // small delay so user sees message (optional)
        setTimeout(() => navigate("/login"), 700);
        return;
      }

      // Prefer backend message if available
      const serverMessage =
        body?.message ||
        body?.error ||
        (response.status === 409 ? "Username already taken." : "");

      setErrorMsg(
        serverMessage || `Registration failed (HTTP ${response.status}).`
      );
    } catch (error) {
      setErrorMsg("Network error — could not reach the server.");
      console.log("Register error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center px-4 bg-zinc-950">
        {/* Background gradient effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-emerald-400/5 rounded-full blur-3xl"></div>
        </div>

        {/* Register Card */}
        <div className="relative w-full max-w-md p-8 md:p-10 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-xl">
          <h2 className="mb-2 text-3xl text-center text-white">
            Create Your Account
          </h2>
          <p className="mb-8 text-center text-gray-400">
            Sign up to join or create leagues.
          </p>

          {(errorMsg || successMsg) && (
            <div
              className={`mb-5 rounded-xl border px-4 py-3 text-sm ${
                errorMsg
                  ? "border-red-500/30 bg-red-500/10 text-red-200"
                  : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
              }`}
            >
              {errorMsg || successMsg}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="mb-2 block text-white">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={usernameValue}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                autoComplete="username"
                className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 backdrop-blur-sm focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
              {usernameError && (
                <p className="text-red-400 text-sm mt-2">{usernameError}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="mb-2 block text-white">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={passwordValue}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (!isPasswordTouched) setPasswordTouched(true);
                  }}
                  onBlur={() => setPasswordTouched(true)}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  className="w-full px-5 py-3 pr-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 backdrop-blur-sm focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {passwordEmptyError && (
                <p className="text-red-400 text-sm mt-2">
                  Please choose a password.
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="mb-2 block text-white">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPasswordValue}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (!isConfirmTouched) setConfirmTouched(true);
                  }}
                  onBlur={() => setConfirmTouched(true)}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  className="w-full px-5 py-3 pr-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 backdrop-blur-sm focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none transition-colors"
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {confirmEmptyError && (
                <p className="text-red-400 text-sm mt-2">
                  Please confirm your password.
                </p>
              )}
              {confirmMismatchError && (
                <p className="text-red-400 text-sm mt-2">
                  Passwords do not match.
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={!canSubmit}
                className={`w-full px-6 py-3 rounded-xl text-white transition-all duration-200 ${
                  canSubmit
                    ? "bg-emerald-500 hover:bg-emerald-400 hover:shadow-xl hover:shadow-emerald-500/50 hover:scale-[1.02]"
                    : "bg-emerald-500/30 cursor-not-allowed"
                }`}
              >
                {loading ? "Creating Account…" : "Sign Up"}
              </button>
            </div>

            {/* Login Link */}
            <p className="pt-2 text-center text-gray-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Log in here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
