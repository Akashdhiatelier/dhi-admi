import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ redirectPath, auth }) => {
  document.body.classList.remove("login");
  document.body.classList.remove("reset");
  if (!auth) {
    return <Navigate to={redirectPath} replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
