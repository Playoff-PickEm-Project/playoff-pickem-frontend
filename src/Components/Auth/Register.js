import React, { useState } from "react";
import { Link } from "react-router-dom";

// Page for the register screen.
const RegisterPage = () => {
  const [usernameValue, setUsername] = useState("");
  const [passwordValue, setPassword] = useState("");

  // Function to handle a register request.
  const handleRegister = () => {
    async function register() {
      // Store the data to send to the backend.
      const data = {
        username: usernameValue,
        password: passwordValue
      }
      
      // Try-catch to make a request to the backend with the URL, type of method, JSON content, and the data.
      try {
        const response = await fetch("http://127.0.0.1:5000/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
        })

        // If no error was generated in the backend, then the registration attempt was successful.
        if (response.ok) {
          alert("Successfully registered. Proceed to login.");
        }
        else {      // If an error was generated by the backend, then it is likely that the username was already taken.
          alert("Username already taken.");
        }
      }
      catch (error) {   // If we reach this point, that means there was an error trying to reach the backend endpoint for registration.
        alert("error with endpoint");
        console.log("error with endpoint", error);
      }
    }

    register();
  }


  return (
    <div className="header">
      <h1>Playoff Pick'em League</h1>
      <h2 className="text">Sign up</h2>

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
            type="text"
            id="password"
            value={passwordValue}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"/>
        </div>

        {usernameValue !== "" && passwordValue !== "" && <button onClick={handleRegister}>
          Register
        </button>}

        <div>
          <p>Already have an account? Sign in!</p>

          <button style={{marginTop: "20px"}}>
            <Link to="/">Login</Link>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;