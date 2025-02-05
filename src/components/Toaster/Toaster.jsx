import React, { useEffect, useState } from "react";
import { ToastContainer } from "react-bootstrap";
import Toast from "react-bootstrap/Toast";
import { useDispatch, useSelector } from "react-redux";
import { resetToaster } from "../../store/slices/toaster/toasterslice";

const Toaster = ({
  isHeader = false,
  type = "SUCCESS",
  text = "",
  position = "top-center",
  headerText = "",
  delay = "3000",
}) => {
  const dispatch = useDispatch();
  const showToaster = useSelector((state) => state.dhi.toasterReducer);

  const [show, setShow] = useState(false);

  useEffect(() => {
    let timer;
    setShow(showToaster.show);
    if (showToaster.show) {
      timer = setTimeout(() => {
        setShow(false);
        dispatch(resetToaster());
      }, showToaster.delay || delay);
    }
    return () => clearTimeout(timer);
  }, [showToaster, delay]);

  return (
    <ToastContainer position={position} className="position-fixed mt-5">
      <Toast
        bg={showToaster.type.toLowerCase() || type.toLowerCase()}
        className="rounded-3"
        onClose={() => setShow(false)}
        animation
        show={show}
        delay={showToaster.delay || delay}
        autohide
      >
        {(showToaster.isHeader || isHeader) && (
          <Toast.Header className="bg-white rounded-3">
            <img
              src="holder.js/20x20?text=%20"
              className="rounded-3 me-2"
              alt=""
              onClick={() => setShow(false)}
            />
            <strong className="me-auto">{headerText}</strong>
          </Toast.Header>
        )}
        <Toast.Body className="text-center text-white alert-link">
          {showToaster.message || text}
        </Toast.Body>
      </Toast>
    </ToastContainer>
  );
};

export default Toaster;
