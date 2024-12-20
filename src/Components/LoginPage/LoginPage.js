import React, { useState } from "react";

const LoginPage = () => {
  const [usernameValue, setUsername] = useState("");
  const [passwordValue, setPassword] = useState("");

  const handleLogin = () => {
    async function login() {
      const data = {
        username: usernameValue,
        password: passwordValue
      }

      try {
        const response = await fetch("http://127.0.0.1:5000/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          alert("login successful?");
        }
        else {
          alert("failed login");
        }
      }
      catch (error) {
        console.log("something went wrong", error);
      }
    }

    login();
  };


  return (
    <div className="header">
      <h1>Playoff Pick'em League</h1>
      <div className="text">Sign up</div>

      <div className="inputFields">
        <div className="input">
          <div className="text">username</div>
          <input 
            type="text"
            id="username"
            value={usernameValue}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            />
        </div>
        <div className="input">
          <div className="text">password</div>
          <input
            type="password"
            id="password"
            value={passwordValue}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"/>
        </div>

        <button onClick={handleLogin}>
          attempt
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
