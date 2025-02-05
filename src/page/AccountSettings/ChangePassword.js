import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import * as UserAPI from "../../api/UserAPI";
import CustomModal from "../../components/CustomModal/CustomModal";
import { useDispatch, useSelector } from "react-redux";
import { showUpdatedToasterMessage } from "../../store/slices/toaster/toasterslice";
import { Button, Form, Spinner } from "react-bootstrap";
const ChangePassword = ({ onHide }) => {
	const [isLoading, setIsLoading] = useState(false);
	const authSelector = useSelector((state) => state.dhi.authUserReducer);
	// const [userId,setUserId] = useState(localStorage.getItem("id")||"");

	const dispatch = useDispatch();

	const ChangePasswordSchema = yup.object().shape({
		current_password: yup.string().trim().required("Please enter current password!"),
		password: yup
			.string()
			.trim()
			.required("Please enter new password!")
			.min(6, "New password must contain 6 characters!"),
		confirm_password: yup.string().oneOf([yup.ref("password"), null], "New and confirm passwords must match!"),
	});
	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors },
		setError,
		setFocus,
	} = useForm({
		mode: "onBlur",
		resolver: yupResolver(ChangePasswordSchema),
	});
	const onSubmit = async (formData) => {
		setIsLoading(true);
		await UserAPI.updatePassword(formData)
			.then((res) => {
                onHide();
				dispatch(
					showUpdatedToasterMessage({
						message: "Password changed successfully!",
						type: "success",
					})
				);
			})
			.catch((error) => {
				dispatch(
					showUpdatedToasterMessage({
						message: error?.errorMessage,
						type: "danger",
					})
				);
			});
		setIsLoading(false);
		// UserAPI.getOne(authSelector.id).then((res)=>{
		//     let user = res.data;
		//     if(user.password === formData.current_password){
		//         UserAPI.update(authSelector.id,{password:formData.password}).then((res)=>{
		//             setIsLoading(false);
		//             dispatch(showUpdatedToasterMessage({
		//                 message:"Password changed successfully.",
		//                 type:"success"
		//             }));
		//             onHide();
		//         });
		//     }
		//     else{
		//         setIsLoading(false);
		//         setError('current_password', { type: 'custom', message: 'Current password is not matched!' });
		//     }
		// })
	};
	return (
		<CustomModal
			show={true}
			isLoading={isLoading}
			onHide={onHide}
			modalHeading={"Change Password"}
			size="sm"
			saveBtnText={"Change Password"}
			onSaveCallback={handleSubmit(onSubmit)}
		>
			<Form autoComplete="off">
				<Form.Group className="mb-3">
					<Form.Label>Current Password</Form.Label>
					<Form.Control
						type="password"
						name="current_password"
						className={`${errors?.current_password && "is-invalid"}`}
						placeholder="Enter current password"
						{...register("current_password")}
					/>
					{errors?.current_password && <div className="invalid-feedback">{errors?.current_password?.message}</div>}
				</Form.Group>
				<Form.Group className="mb-3">
					<Form.Label>New Password</Form.Label>
					<Form.Control
						type="password"
						name="password"
						className={`${errors?.password && "is-invalid"}`}
						placeholder="Enter new password"
						{...register("password")}
					/>
					{errors?.password && <div className="invalid-feedback">{errors?.password.message}</div>}
				</Form.Group>
				<Form.Group className="mb-3">
					<Form.Label>Confirm Password</Form.Label>
					<Form.Control
						type="password"
						name="confirm_password"
						className={`${errors?.confirm_password && "is-invalid"}`}
						placeholder="Enter confirm password"
						{...register("confirm_password")}
					/>
					{errors?.confirm_password && <div className="invalid-feedback">{errors?.confirm_password.message}</div>}
				</Form.Group>
			</Form>
		</CustomModal>
	);
};
export default ChangePassword;
