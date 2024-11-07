// From: https://blog.logrocket.com/authentication-react-router-v6/

import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/UseAuth";

export const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    // user is not authenticated
    return <Navigate to="/" />;
  }
  return children;
};