import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const RegisterPage = () => {
  const [usernameValue, setUsername] = useState("");
  const [passwordValue, setPassword] = useState("");
  const [isPasswordTouched, setPasswordTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const apiUrl = process.env.REACT_APP_API_URL;

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordTouched(value === "");
  };

  const handleRegister = (event) => {
    event.preventDefault();

    async function register() {
      const data = {
        username: usernameValue,
        password: passwordValue,
      };

      try {
        const response = await fetch(`${apiUrl}/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          alert("Successfully registered. Proceed to login.");
        } else {
          alert("Username already taken.");
        }
      } catch (error) {
        alert("Error with endpoint");
        console.log("Error with endpoint", error);
      }
    }

    register();
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-zinc-900 px-4">
      <div className="w-full max-w-md bg-zinc-800 shadow-lg rounded-xl p-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-white">
          Create an Account
        </h2>

        <form onSubmit={handleRegister}>
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-white mb-1"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              value={usernameValue}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full px-4 py-2 border border-zinc-500 bg-zinc-700 text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-white mb-1"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={passwordValue}
                onChange={handlePasswordChange}
                onBlur={() => setPasswordTouched(passwordValue === "")}
                placeholder="Enter your password"
                className="w-full px-4 py-2 pr-10 border border-zinc-500 bg-zinc-700 text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-white focus:outline-none"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {isPasswordTouched && passwordValue === "" && (
              <p className="text-red-400 text-sm mt-2">
                Please choose a password.
              </p>
            )}
          </div>

          <div className="flex items-center justify-center">
            <button
              type="submit"
              disabled={!(usernameValue && passwordValue)}
              className={`w-full py-2 px-4 rounded-lg text-white font-semibold transition duration-200 ${
                usernameValue && passwordValue
                  ? "bg-emerald-500 hover:bg-emerald-600"
                  : "bg-emerald-300 cursor-not-allowed"
              }`}
            >
              Register
            </button>
          </div>

          <p className="text-center text-sm text-gray-400 mt-6">
            Already have an account?{" "}
            <Link
              to="/"
              className="text-emerald-400 hover:underline font-medium"
            >
              Login here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
