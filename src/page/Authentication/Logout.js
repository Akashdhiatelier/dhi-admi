import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { resetAuthData } from "../../store/slices/authUser/authUserSlice";
import * as AuthAPI from "../../api/AuthApi";
import "./Login.css";

const Logout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  useEffect(()=>{
    AuthAPI.logout('logout').catch((error)=>{});
  },[]);
  useEffect(() => {
    dispatch(resetAuthData());
    // localStorage.clear();
    let timer = setTimeout(() => {
      navigate("/login", { replace: true });
    }, 100);
    return () => clearTimeout(timer);
  }, [navigate, dispatch]);

  return;
};
export default Logout;
