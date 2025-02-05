import React, { Suspense } from "react";
import { useRoutes } from "react-router-dom";

import Loader from "../components/Loader";
import useLogin from "../hooks/useLogin";
import SiteFooter from "../interface/Footer";
import SiteHeader from "../interface/Header";

import { SiteWrapper } from "../interface/SiteWrapper";

const InjectProtectedNode = ({ authSelector }) => {
  const getRoles = useLogin(
    authSelector.auth,
    authSelector.role,
    authSelector.permissions
  );

  return (
    <SiteWrapper>
      <SiteHeader />
      <Suspense fallback={<Loader top="64px" height="calc(100% - 64px)" />}>
        {useRoutes(getRoles)}
      </Suspense>
      <SiteFooter />
    </SiteWrapper>
  );
};

export default InjectProtectedNode;
