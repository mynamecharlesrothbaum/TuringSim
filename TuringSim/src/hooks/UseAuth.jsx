// From: https://blog.logrocket.com/authentication-react-router-v6/

import { createContext, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "./useLocalStorage";
import { getAuthentication, getRegistration, getSave, getLoad } from "../api/apiService";
import dayjs from 'dayjs';

const AuthContext = createContext();


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useLocalStorage("user", null);
  const navigate = useNavigate();

  // call this function when you want to authenticate the user
  const login = async (data) => {
    try {
      const response = await getAuthentication(data);
      if (response.message === "Authentication successful") {
        setUser(data);
        console.log("Successful authentication");
        navigate("/editor");
        return response;
      }
    } catch (error) {
      console.error("Unexpected error during login:", error);
    }
  };

  const register = async (data) => {
    try{
      const response = await getRegistration(data);
      if(response.message === "Account created successfully"){
        setUser(data);
        console.log("Registration success");
        navigate("/editor");
      }
    } catch (error) {
        console.error("Could not create account:", error);
    }
  }

  const save = async (data) => {
    data = JSON.parse(data);
    if (user && user.username) {
      data.username = user.username;
      data.date_updated = dayjs().format('YYYY-MM-DD HH:mm:ss');
      try {
        //console.log("Save data:", data);
        const response = await getSave(data);
        return response;
      } catch (error) {
        console.error("Error while saving:", error);
      }
    } else {
      console.error("User is not logged in or username is not available");
    }
  };

  const load = async (data) => {
    data = JSON.parse(data);
    if (user && user.username) {
      data.username = user.username;
    }
    console.log(data);
    try{
      const response = await getLoad(data);
      return response
    }
    catch(error){
      console.error("Error while loading:", error);
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
      register,
      save,
      load,
    }),
    [user]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};