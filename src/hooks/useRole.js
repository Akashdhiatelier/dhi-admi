import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { NAV_ITEMS } from "../common/constants";

const useRole = () => {
  const [roles, setRoles] = useState("");

  const authSelector = useSelector((state) => state.dhi.authUserReducer);

  useEffect(() => {
    if (authSelector.permissions) {
      setRoles(authSelector.permissions || "");
    }
  }, [authSelector.permissions]);

  const getRoles = (roles) => {
    if (roles?.length > 0) {
      const parsedRoles = JSON.parse(atob(roles));
      if (parsedRoles?.length > 0) {
        return NAV_ITEMS.reduce((p, c) => {
          let a = parsedRoles.filter((i) => {
            return i.name === c.name;
          });
          if (a[0]) {
            c.role = a[0];
          }
          p.push(c);
          return p;
        }, []);
      } else {
        return NAV_ITEMS;
      }
    } else {
      return NAV_ITEMS;
    }
  };
  const navItems = getRoles(roles);

  return navItems;
};

export default useRole;
