import React,{useEffect, useState} from 'react'
import { Navigate, Outlet } from 'react-router-dom';
function ProtectedRoute({redirectPath}) {
  const [isSignedIn, setIsSignedIn] = useState(localStorage.getItem("isSignedIn"));
  document.body.classList.remove('login');
  if(isSignedIn!="true"){
    return <Navigate to={redirectPath} replace />
  }
  return <Outlet />
}
export default ProtectedRoute;