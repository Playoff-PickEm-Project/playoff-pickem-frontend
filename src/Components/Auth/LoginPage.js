import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

const LoginPage = ({ onLoginSuccess }) => {
  const [usernameValue, setUsername] = useState("");
  const [passwordValue, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  // Check session on component mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(`${apiUrl}/session-info`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        const data = await response.json();
        if (data.username) {
          localStorage.setItem("username", data.username);
          localStorage.setItem("auth_provider", data.auth_provider);
          onLoginSuccess(data.username);
          navigate('/league-list');
        }
      } catch (error) {
        console.error('Session check failed:', error);
      }
    };

    checkSession();
  }, [apiUrl, navigate, onLoginSuccess]);

  const handleLogin = (event) => {
    event.preventDefault();

    async function login() {
      const data = {
        username: usernameValue,
        password: passwordValue,
      };

      try {
        const response = await fetch(`${apiUrl}/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: 'include',
          body: JSON.stringify(data),
        });

        if (response.ok) {
          alert("Login successful!");
          localStorage.setItem("username", usernameValue);
          localStorage.setItem("auth_provider", "local");
          onLoginSuccess(usernameValue);
          navigate('/league-list');
        } else {
          alert("Wrong username or password.");
        }
      } catch (error) {
        console.log("Error with endpoint", error);
      }
    }

    login();
  };

  const handleGoogleLogin = () => {
    // Open Google login in a popup
    const popup = window.open(
      `${apiUrl}/login/google`,
      'Google Login',
      'width=500,height=600'
    );

    // Listen for messages from the popup
    window.addEventListener('message', (event) => {
      // Verify the origin
      if (event.origin !== apiUrl) return;

      const data = event.data;
      if (data.success) {
        // Store user info
        localStorage.setItem('username', data.username);
        localStorage.setItem('auth_provider', data.auth_provider);
        onLoginSuccess(data.username);
        // Redirect to league list
        window.location.href = '/league-list';
      }
    });

    // Check if popup is closed
    const checkPopup = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkPopup);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-zinc-900">
      <div className="w-full max-w-md p-8 rounded-xl shadow-lg bg-zinc-800">
        <h2 className="mb-6 text-2xl font-bold text-center text-white">
          Log in to Your Account
        </h2>

        {/* Google Login Button */}
        <div className="mb-6">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-white bg-white hover:bg-gray-100 transition duration-200"
          >
            <FcGoogle className="text-xl" />
            <span className="text-gray-700">Continue with Google</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-zinc-800 text-zinc-400">Or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleLogin}>
          {/* Username Field */}
          <div className="mb-4">
            <label
              htmlFor="username"
              className="mb-1 block text-sm font-medium text-white"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              value={usernameValue}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full px-4 py-2 rounded-lg border border-zinc-500 bg-zinc-700 text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Password Field */}
          <div className="mb-6">
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-white"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={passwordValue}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-2 pr-10 rounded-lg border border-zinc-500 bg-zinc-700 text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transform text-zinc-400 hover:text-white focus:outline-none"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center items-center">
            <button
              type="submit"
              disabled={!(usernameValue && passwordValue)}
              className={`w-full px-4 py-2 rounded-lg font-semibold text-white transition duration-200 ${
                usernameValue && passwordValue
                  ? "bg-emerald-500 hover:bg-emerald-600"
                  : "bg-emerald-300 cursor-not-allowed"
              }`}
            >
              Login
            </button>
          </div>

          {/* Register Link */}
          <p className="mt-6 text-center text-sm text-gray-400">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-emerald-400 hover:underline"
            >
              Register here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
