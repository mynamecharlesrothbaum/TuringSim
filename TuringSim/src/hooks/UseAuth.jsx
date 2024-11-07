// From: https://blog.logrocket.com/authentication-react-router-v6/

import { createContext, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "./useLocalStorage";
import { getAuthentication } from "../api/apiService";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useLocalStorage("user", null);
  const navigate = useNavigate();

  // call this function when you want to authenticate the user
  const login = async (data) => {
    try{
      const response = await getAuthentication(data);

      console.log("full response", response);

      if(response.message === "Authentication successful"){
        setUser(data);
        console.log("Succesfull authentication");
        navigate("/editor");
      }
    } catch (error){
      if (error.response && error.response.status === 401) {
        console.error("Authentication failed: Invalid credentials");
      } else {
        console.error("Authentication failed:", error);
      }
    }
  };

  // call this function to sign out logged in user
  const logout = () => {
    setUser(null);
    navigate("/", { replace: true });
  };

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
    }),
    [user]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};