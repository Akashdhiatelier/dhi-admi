import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import * as UserAPI from "../../api/UserAPI";
import * as AuthAPI from "../../api/AuthApi";
import AuthenticationBasic from "../../components/Authentication/AuthenticationBasic";
import Logo from "../../assets/images/logo-light.png";
import { Helmet } from "react-helmet";
import { Alert, Button, Card, Form, Spinner } from "react-bootstrap";
import { IconLock } from "@tabler/icons-react";
import "./Login.css";
import { useDispatch } from "react-redux";
import { showUpdatedToasterMessage } from "../../store/slices/toaster/toasterslice";
const ResetPassword = () => {
	const [isVerify,setIsVerify] = useState(false);
	const [userId,setUserId] = useState(0);
	const [isLoading,setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const dispatch = useDispatch();
	const navigate = useNavigate();
	let {token} = useParams();
	const verifyToken = async ()=>{
		console.log("token:",token);
		await AuthAPI.verify(token).then(({data}) => {
			console.log("verifyData:",data);
			setIsVerify(true);
			return false;
			// let user = res.data;
			// console.log("user:",user)
			// if(user.length === 1){
			// 	setUserId(user[0].id);
			// 	setIsVerify(true);
			// }
			// else{
			// 	setIsVerify(false);
			// 	setErrorMessage("This URL is invalid or may expired!")
			// }
		}).catch((error)=>{
			setIsVerify(false);
			setErrorMessage("This URL is invalid or may expired!");
		})
	}
	useEffect(()=>{
		verifyToken();
	},[])
	document.body.classList.add('reset');
	const ResetSchema = yup.object().shape({
		password: yup.string().trim().required('Please enter new password!').min(6, 'New password must contain 6 characters!'),
		confirm_password: yup.string().oneOf([yup.ref('password'), null], 'Both passwords must match!')
	});
	const { register, handleSubmit,setValue, formState: { errors }, setError, setFocus } = useForm({
		mode: "onBlur",
		resolver: yupResolver(ResetSchema)
	});

	const onSubmit = async (formData) => {
		setIsLoading(true);
		await AuthAPI.resetPassword(token,formData).then(({data})=>{
			dispatch(showUpdatedToasterMessage({
				message:"Password reset successfully.",
				type:"success",
				delay:5000
			}));
			navigate("/login");
		}).catch((error)=>{
			dispatch(showUpdatedToasterMessage({
				message:error.errorMessage,
				type:"danger"
			}));
		});
		setIsLoading(false);
	};
	return (
		<AuthenticationBasic imageURL={Logo}>
			<Helmet>
				<title>Reset Password</title>
			</Helmet>
			<Card className="card-md">
				<Card.Body>
					{(!isVerify && errorMessage) && (
						<>
						<h1 className="text-danger text-center">{errorMessage}</h1>
						<div className="text-center"><Link to="/login">Back to Login</Link></div>
						</>
					)}
					{isVerify && (
					<>
						<Card.Title as={"h1"}  className="w-100 text-center h1">
						<span className="avatar avatar-lg bg-primary-lt"><IconLock stroke={1} size={20} /></span>
						<div className="mt-2 text-primary">Reset Password</div>
						</Card.Title>
						<Form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
							<Form.Group className="mb-3">
								<Form.Label>New Password</Form.Label>
								<Form.Control type="password" name="password" className={`${errors.password && 'is-invalid'}`}  placeholder="Enter new password" {...register("password")} />
								{errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
							</Form.Group>
							<Form.Group className="mb-4">
								<Form.Label>Confirm Password</Form.Label>
								<Form.Control type="password" name="confirm_password" className={`${errors.confirm_password && 'is-invalid'}`}  placeholder="Enter confirm password" {...register("confirm_password")} />
								{errors.confirm_password && <div className="invalid-feedback">{errors.confirm_password.message}</div>}
							</Form.Group>
							<Button type="Submit" color="primary" className="w-100" disabled={isLoading}>
								{isLoading && <Spinner animation="border" className="me-2" />}
								Submit
							</Button>
						</Form>
					</>
					)}
				</Card.Body>
			</Card>
		</AuthenticationBasic>
	);
};
export default ResetPassword;
