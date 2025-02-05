import { useRoutes } from "react-router-dom";

import useLogin from "../hooks/useLogin";

const UnauthorizerNode = () => {
  const getRoles = useLogin(false);
  return useRoutes(getRoles);
};

export default UnauthorizerNode;
