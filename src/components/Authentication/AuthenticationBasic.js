import React from "react";
import { Link } from "react-router-dom";
import Logo from "../../assets/images/logo-light.png";
function AuthenticationBasic(props) {
    return (
    <div className="page page-center">
      <div className="container container-tight py-4">
        <div className="text-center mb-4">
          <Link to={'/'} className="navbar-brand navbar-brand-autodark"><img src={Logo} height="65" alt="" /></Link>
        </div>
        {props.children}
      </div>
    </div>
  );
  }
  export default AuthenticationBasic;