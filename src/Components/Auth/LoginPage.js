import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { Navbar } from "../Landing/Navbar";

const LoginPage = ({ onLoginSuccess }) => {
  const [usernameValue, setUsername] = useState("");
  const [passwordValue, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Toast state
  const [toast, setToast] = useState(null);
  const showToast = (type, message) => {
    setToast({ type, message });
    clearTimeout(showToast._timeout);
    showToast._timeout = setTimeout(() => setToast(null), 3000);
  };

  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  // Check session on component mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(`${apiUrl}/session-info`, {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();
        if (data.username) {
          localStorage.setItem("username", data.username);
          localStorage.setItem("auth_provider", data.auth_provider);
          onLoginSuccess(data.username);
          navigate("/league-list");
        }
      } catch (error) {
        console.error("Session check failed:", error);
      }
    };

    checkSession();
  }, [apiUrl, navigate, onLoginSuccess]);

  const handleLogin = (event) => {
    event.preventDefault();

    async function login() {
      try {
        const response = await fetch(`${apiUrl}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            username: usernameValue,
            password: passwordValue,
          }),
        });

        if (response.ok) {
          showToast("success", "Login successful!");
          localStorage.setItem("username", usernameValue);
          localStorage.setItem("auth_provider", "local");
          onLoginSuccess(usernameValue);
          navigate("/league-list");
        } else {
          showToast("error", "Wrong username or password.");
        }
      } catch (error) {
        console.log("Error with endpoint", error);
        showToast("error", "Something went wrong. Please try again.");
      }
    }

    login();
  };

  const handleGoogleLogin = () => {
    const popup = window.open(
      `${apiUrl}/login/google`,
      "Google Login",
      "width=500,height=600"
    );

    const listener = (event) => {
      if (event.origin !== apiUrl) return;
      const data = event.data;
      if (data.success) {
        localStorage.setItem("username", data.username);
        localStorage.setItem("auth_provider", data.auth_provider);
        onLoginSuccess(data.username);
        window.location.href = "/league-list";
      }
    };

    window.addEventListener("message", listener, { once: true });
  };

  return (
    <>
      <Navbar />

      {/* Toast */}
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100]">
          <div
            className={`rounded-2xl border px-4 py-3 shadow-xl backdrop-blur-md ${
              toast.type === "success"
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-100"
                : "bg-red-500/15 border-red-500/30 text-red-100"
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-sm">{toast.message}</span>
              <button
                onClick={() => setToast(null)}
                className="ml-2 text-white/60 hover:text-white transition"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen flex items-center justify-center px-4 bg-zinc-950">
        {/* Background effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-emerald-400/5 rounded-full blur-3xl" />
        </div>

        {/* Login Card */}
        <div className="relative w-full max-w-md p-8 md:p-10 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-xl">
          <h2 className="mb-8 text-3xl text-center text-white">
            Log in to Your Account
          </h2>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            className="mb-6 w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-medium text-gray-700 bg-white hover:bg-gray-50 transition shadow-md"
          >
            <FcGoogle className="text-xl" />
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 border-t border-white/10" />
            <span className="text-gray-400 text-sm whitespace-nowrap">
              Or continue with username
            </span>
            <div className="flex-1 border-t border-white/10" />
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="mb-2 block text-white">Username</label>
              <input
                value={usernameValue}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-white">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordValue}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-3 pr-12 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-emerald-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={!(usernameValue && passwordValue)}
              className={`w-full px-6 py-3 rounded-xl text-white transition ${
                usernameValue && passwordValue
                  ? "bg-emerald-500 hover:bg-emerald-400"
                  : "bg-emerald-500/30 cursor-not-allowed"
              }`}
            >
              Login
            </button>

            <p className="text-center text-gray-400">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="text-emerald-400">
                Register here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
