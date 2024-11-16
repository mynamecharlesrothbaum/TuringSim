import { useState, useEffect } from "react";
import { useAuth } from "../hooks/UseAuth";

export const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);

  const { login, register } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
  
    const data = { username, password };
    
    try {
      const result = await login(data);
      
      if (result.message === "Authentication successful") {
        setErrorMessage(null);
        console.log("Successful authentication");
      } else {
        console.error("Login failed:", result.message);
        setErrorMessage(result.message || "An error occurred during authentication.");
      }
    } catch (error) {
      console.error("Unexpected error during login:", error);
      setErrorMessage("Unable to login. Please make sure username and password is corrrect.");
    }
  };
  

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    const data = { username, password };

    try {
      const result = await register(data);

      if (result.message === "Account created successfully") {
        setErrorMessage(null);
        console.log("Account created successfully");
      } else {
        setErrorMessage("Unable to create account");
      }
    } catch (error) {
      console.error("Error during registration:", error);
      setErrorMessage("Unable to create account.");
    }
  };

  useEffect(() => {
    console.log("Error message updated:", errorMessage);
  }, [errorMessage]);

  return (
    <div>
      <div className="title-container">
        <h1>Turing Machine Simulator</h1>
      </div>
      <div className="login-container">
        <form>
          <div>
            <div>
              <h4>Press "Login" to login to an existing account.</h4>
            </div>
            <div>
              <h4>Press "Create Account" to create a new account</h4>
            </div>
            <label htmlFor="username">Username:</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password">Password:</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="button" onClick={handleLogin}>
            Login
          </button>

          <button type="button" onClick={handleRegister}>
            Create Account
          </button>
        </form>

        {errorMessage && (
          <div style={{ color: "red", marginTop: "10px" }}>
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
};
