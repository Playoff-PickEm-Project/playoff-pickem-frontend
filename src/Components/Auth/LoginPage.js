import React, { useState } from "react";
import { Link } from "react-router-dom";

// Page for the login screen.
const LoginPage = () => {
  const [usernameValue, setUsername] = useState("");
  const [passwordValue, setPassword] = useState("");

  // Function to handle a login request. I forget why this is the format but I think using async is more efficient.
  const handleLogin = () => {
    async function login() {
      // Store the data to send to the backend.
      const data = {
        username: usernameValue,
        password: passwordValue
      }

      // Try-catch to make a request to the backend with the URL, type of method, JSON content, and the data.
      try {
        const response = await fetch("http://127.0.0.1:5000/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        
        // If no error was generated in the backend, then the login was successful.
        if (response.ok) {
          alert("login successful i believe?");
        }
        else {        // If an error was generated, it should be because invalid credentials were entered.
          alert("wrong username or password");
        }
      }
      catch (error) {     // If this part of the code is reached, there's a problem with the endpoint (first guess is CORS)
        console.log("error with endpoint", error);
      }
    }

    // Call the login function.
    login();
  };

  return (
    <div className="header">
      <h2 className="text">Log In</h2>

      <div className="inputFields">
        <div className="input">
          <div className="label">username</div>
          <input 
            type="text"
            id="username"
            value={usernameValue}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            />
        </div>
        <div className="input">
          <div className="label">password</div>
          <input
            type="password"
            id="password"
            value={passwordValue}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"/>
        </div>

        {usernameValue !== "" && passwordValue !== "" && <button onClick={handleLogin}>
          Login
        </button>}

        <div style={{marginTop: "20px"}}>
          <p>Don't have an account? Register!</p>

          <button>
            <Link to="/register">Register</Link>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
