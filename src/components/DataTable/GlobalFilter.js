import React, { useState } from "react";
import { useAsyncDebounce } from "react-table";
const GlobalFilter = ({globalFilter,setGlobalFilter})=>{
    const [value,setValue] = useState(globalFilter);
    const onChange = useAsyncDebounce((value)=>{
        setGlobalFilter(value || undefined)
    },300);
    return(
        <input type="text" className="form-control form-control-sm" aria-label="Search" placeholder="Search" value={value || ""} onChange={(e)=>{
            setValue(e.target.value);
            onChange(e.target.value);
        }} />
    )
}
export default GlobalFilter;