import React from "react";
const CheckAll = React.forwardRef(
    //This is the function for the checkboxes in page select
    ({ indeterminate, ...rest }, ref) => {
      const defaultRef = React.useRef()
      const resolvedRef = ref || defaultRef

      React.useEffect(() => {
        resolvedRef.current.indeterminate = indeterminate
      }, [resolvedRef, indeterminate])     
      return (
        <>
          <input type="checkbox" className="form-check-input m-0 align-middle" ref={resolvedRef} {...rest} />
        </>
      )
    }
);
export default CheckAll;
