import { Routes } from "../routes/Routes";

const useLogin = (auth, role, permissions) => {
  const getRoles =
    auth === "true" || auth
      ? Routes(role, permissions, auth)
      : Routes("undefined");

  return getRoles;
};

export default useLogin;
