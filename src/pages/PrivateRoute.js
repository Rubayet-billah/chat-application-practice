import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const PrivateRoute = ({ children }) => {
  const { loading } = useSelector((state) => state.auth);
  const isLoggedin = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }
  if (isLoggedin) {
    return children;
  } else {
    return <Navigate to="/" />;
  }
};

export default PrivateRoute;
