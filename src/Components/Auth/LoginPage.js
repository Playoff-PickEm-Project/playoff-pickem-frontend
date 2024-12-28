import React, { useState } from "react";
import { Link } from "react-router-dom";

const LoginPage = ({ onLoginSuccess }) => {
  const [usernameValue, setUsername] = useState("");
  const [passwordValue, setPassword] = useState("");

  // Function to handle a login request
  const handleLogin = (event) => {
    event.preventDefault();  // Prevent default form submission behavior

    async function login() {
      const data = {
        username: usernameValue,
        password: passwordValue,
      };

      try {
        const response = await fetch("http://127.0.0.1:5000/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          alert("Login successful!");  // Success popup
          onLoginSuccess();  // Trigger success handler to update state in App.js
        } else {
          alert("Wrong username or password.");
        }
      } catch (error) {
        console.log("Error with endpoint", error);
      }
    }

    login();
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-xs">
        <form className="inputFields">
          <h2 className="pb-4">Log-in</h2>
          <div className="mb-4">
            <label className="label" htmlFor="username">
              Username
            </label>
            <input
              className="inputForm"
              type="text"
              id="username"
              value={usernameValue}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
            />
          </div>
          <div className="mb-6">
            <label className="label" htmlFor="password">
              Password
            </label>
            <input
              className="inputForm"
              type="password"
              id="password"
              value={passwordValue}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>
          <div className="flex items-center justify-center">
            {usernameValue !== "" && passwordValue !== "" && (
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={handleLogin}  // Pass the event to handleLogin
              >
                Login
              </button>
            )}
          </div>
          <p className="text-center text-gray-500 text-xs mt-4">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-blue-500 hover:text-blue-800 font-bold text-sm"
            >
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
