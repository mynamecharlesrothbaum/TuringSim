import { useState, useEffect } from "react";
import { useAuth } from "../hooks/UseAuth";

export const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);

  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage(null); // Clear previous errors

    const data = { username, password };

    try {
      // Attempt login
      const response = await login(data);
      console.log("Full response:", response);

      // Handle successful response
      if (response.message === "Authentication successful") {
        setErrorMessage(null);
        console.log("Successful authentication");
      } else {
        setErrorMessage("Invalid username or password.");
      }
    } catch (error) {
      console.error("Error during login:", error);

      if (error.response && error.response.status === 401) {
        setErrorMessage("Invalid username or password.");
      } else if (error.response) {
        setErrorMessage("An error occurred. Please try again later.");
      } else {
        setErrorMessage("A network error occurred. Please check your connection.");
      }
    }
  };

  useEffect(() => {
    console.log("Error message updated:", errorMessage);
  }, [errorMessage]);

  return (
    <div>
      <form onSubmit={handleLogin}>
        <div>
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
        <button type="submit">Login bruh</button>
      </form>
      {errorMessage && (
        <div style={{ color: "red", marginTop: "10px" }}>
          {errorMessage}
        </div>
      )}
    </div>
  );
};
