import React, { forwardRef } from "react"
// import { components } from "react-select";

import AsyncSelect from "react-select/async";
import CreatableSelect from 'react-select/creatable';
import Select,{components} from "react-select";

import { IconChevronDown } from "@tabler/icons-react";
import { Badge } from "react-bootstrap";

function getSelectStyles(multi, size='') {
	const suffix = size ? `-${size}` : '';
	const multiplicator = multi ? 2 : 1;
	return {
		control: (provided, { isDisabled, isFocused }) => ({
			...provided,
			backgroundColor: `var(--tblr-bg-forms ${isDisabled ? '-disabled' : ''}-bg)`,
			borderColor: `var(--tblr${isDisabled ? '-disabled' : (isFocused ? '-focus' : '')}-border-color)`,
            boxShadow:`${isFocused?'0 0 0 0.25rem rgb(42 106 115 / 25%)':''}`,
			borderWidth: "var(--tblr-border-width)",
            borderRadius:"var(--tblr-border-radius)",
			lineHeight: "1.4285714286",
			fontSize: `inherit`,
			fontWeight: "var(--bs-select-font-weight)",
			minHeight: `calc((var(--tblr-select-line-height)*var(--tblr-select-font-size${suffix})) + (var(--tblr-select-padding-y${suffix})*2) + (var(--tblr-select-border-width)*2))`,
			':hover': {
				borderColor: "var(--tblr-border-color",
			},
		}),
		// singleValue: ({marginLeft, marginRight, ...provided}, { isDisabled }) => ({
		// 	...provided,
		// 	color: `var(--tblr${isDisabled ? '-disabled' : ''}-color)`,
		// }),
		// valueContainer: (provided, state) => ({
		// 	...provided,
		// 	padding: `0.4375rem 0.75rem`,
		// }),
		// dropdownIndicator: (provided, state) => ({
		// 	// height: "100%",
		// 	// width: "var(--bs-select-indicator-padding)",
		// 	// backgroundImage: "var(--bs-select-indicator)",
		// 	// backgroundRepeat: "no-repeat",
		// 	// backgroundPosition: `right var(--bs-select-padding-x) center`,
		// 	// backgroundSize: "var(--bs-select-bg-size)",			
		// }),
		// input: ({margin, paddingTop, paddingBottom, ...provided}, state) => ({
		// 	...provided
		// }),
		// option: (provided, state) => ({
		// 	...provided,
		// 	// margin: `calc(var(--tblr-select-padding-y${suffix})/2) calc(var(--tblr-select-padding-x${suffix})/2)`,
		// }),
		// menu: ({marginTop, ...provided}, state) => ({
		// 	...provided
		// }),
		// multiValue: (provided, state) => ({
		// 	...provided,
		// 	// margin: `calc(var(--tblr-select-padding-y${suffix})/2) calc(var(--tblr-select-padding-x${suffix})/2)`,
		// }),
		// clearIndicator: ({padding, ...provided}, state) => ({
		// 	// ...provided,
		// 	// alignItems: "center",
		// 	// justifyContent: "center",
		// 	// height: "100%",
		// 	// width: "var(--bs-select-indicator-padding)"
		// }),
		// multiValueLabel: ({padding, paddingLeft, fontSize, ...provided}, state) => ({
		// 	...provided,
		// 	// padding: `0 var(--tblr-select-padding-y${suffix})`,
		// 	// whiteSpace: "normal"
		// })
	}
}

function IndicatorSeparator() {
	return null;
}

function DropdownIndicator(props) {
	return (
		<components.DropdownIndicator {...props}>
			<span className="mx-2"><IconChevronDown size={18} /></span>
		</components.DropdownIndicator>
	);
}

function getSelectTheme(theme) {
	return {
		...theme,
		borderRadius: "var(--bs-select-border-radius)",
		colors: {
			...theme.colors,
            borderRadius:5,
            primary: 'var(--tblr-muted)',
		}
	}
}

const SelectBox = forwardRef(({isCreatable,isAsync,showColor=false,...props}, ref) => {
	const SelectType = isAsync ? AsyncSelect : isCreatable ? CreatableSelect : Select;
    // console.log('isCreatable:',isCreatable)
    const customStyles = {
        option: (provided, state) => {
            // console.log('data:',state.data)
            return{
            ...provided,
            // ...optionSettings,
            background:state.isSelected ? "var(--tblr-gray-200)":state.isFocused?"var(--tblr-gray-100)":"",
            // background:(state.isSelected || state.isFocused) && "var(--tblr-gray-100)",
            color:"inherit",
            // color: (state.isSelected || state.isFocused) && "#ffffff",
            }
        },
        valueContainer: (provided, state) => ({
            ...provided,
            // padding: `0.4375rem 0.75rem`,
        }),
        control: (provided, state) => {
            let hasError = state.selectProps.className.includes('is-invalid');
            return({
                ...provided,
                minHeight:"36px",
                borderRadius:'var(--tblr-border-radius)',
                boxShadow:`${(hasError&&state.isFocused)?'0 0 0 0.25rem rgb(214 57 57 / 25%)':state.isFocused?'0 0 0 0.25rem rgb(42 106 115 / 25%)':''}`,
                borderColor: `${hasError?'var(--tblr-danger)':state.isFocused?'#90b5e2':'var(--tblr-border-color)'}`,
                "&:hover": {
                    borderColor: `${hasError?'var(--tblr-danger)':state.isFocused?'#90b5e2':'var(--tblr-border-color)'}`,
                }
            })
        },
        dropdownIndicator:(provided,state)=>({
        ...provided,
        padding:"6px"
        }),
        clearIndicator:(provided,state)=>({
        ...provided,
        padding:"6px"
        }),
        multiValue: (styles, { data }) => {
            return {
              ...styles,
              backgroundColor: 'rgba(var(--tblr-primary-rgb), 0.1)',
              borderRadius:'4px',
              border:'1px solid var(--tblr-primary)',
              fontWeight:'var(--tblr-font-weight-medium)',
            };
        },
        multiValueLabel: (styles, { data }) => ({
            ...styles,
            color: data.color,
        }),
        // multiValueRemove: (styles, { data }) => ({
        //     ...styles,
        //     color: data.color,
        //     ':hover': {
        //         backgroundColor: data.color,
        //         color: 'white',
        //     },
        // })
    }
    const Option = ({ children, ...props }) => {
        return (
          <components.Option {...props}>
            <div className="d-flex">
            {props.data?.color && <Badge bg="" className="p-2 me-1" style={{background:`${props.data?.color}`}} />}
            {children}
            </div>
          </components.Option>
        );
      };
      const ValueContainer = ({ children, ...props }) => {
        // console.log('ValueContainer:',props)
        return (
          <components.ValueContainer {...props}>
            <div className="d-flex align-items-center">
            {props.selectProps?.value?.color && <Badge bg="" className="p-2 me-1" style={{background:`${props.selectProps?.value?.color}`}} />}
            {children}
            </div>
          </components.ValueContainer>
        );
      };
      const customComponents = showColor?{Option,ValueContainer }:isCreatable?{ DropdownIndicator:() => null, IndicatorSeparator:() => null }:{};
	return (
		<SelectType
			// components={{ DropdownIndicator, IndicatorSeparator, ...components }}
			// theme={getSelectTheme}
            components={customComponents} 
			styles={customStyles}
            ref={ref}
			{...props}
		/>
	);
});
export default SelectBox;