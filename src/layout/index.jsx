import React, { Fragment, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";

import Loader from "../components/Loader";
import Toaster from "../components/Toaster/Toaster";

import InjectProtectedNode from "./injectProtectedNode";
import UnauthorizerNode from "./unauthorizerNode";
import { resetAuthData } from "../store/slices/authUser/authUserSlice";
import { showUpdatedToasterMessage } from "../store/slices/toaster/toasterslice";
import "../assets/css/tabler.css";
import "../assets/css/icons.css";
import "../assets/css/custom.css";

const Layout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authSelector = useSelector((state) => state.dhi.authUserReducer);
  axios.interceptors.request.use(
    (req) => {
      req.baseURL = process.env.REACT_APP_API_URL;
      if (authSelector?.token) {
        req.headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authSelector.token}`,
          ...req.headers,
        };
      }
      return req;
    },
    (error) => {
      return error;
    }
  );
  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      //catches if the session ended!
      if (error.response.status === 401) {
        dispatch(
          showUpdatedToasterMessage({
            message: error.response.statusText,
            type: "danger",
          })
        );
        dispatch(resetAuthData());
        // localStorage.clear();
        navigate("/login");
      }

      return Promise.reject(error);
    }
  );

  return (
    <Fragment>
      {authSelector.auth ? (
        <InjectProtectedNode authSelector={authSelector} />
      ) : (
        <Suspense fallback={<Loader />}>
          <UnauthorizerNode />
        </Suspense>
      )}
      <Toaster />
    </Fragment>
  );
};

export default Layout;
