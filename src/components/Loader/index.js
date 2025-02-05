import React from "react";
import { Spinner } from "react-bootstrap";
const Loader = ({ height = "100%", top = "0px" }) => {
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: "0px",
        width: "100%",
        height,
        zIndex: "50",
        backgroundColor: "rgba(255,255,255,0.7)",
        borderRadius: "3px",
      }}
    >
      <Spinner
        aria-hidden="false"
        size="lg"
        animation="border"
        variant="primary"
        style={{
          position: "absolute",
          top: "calc(50% - 12px)",
          left: "calc(50% - 12px)",
        }}
      />
    </div>
  );
};
export default Loader;
