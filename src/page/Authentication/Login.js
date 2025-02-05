import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useCookies } from "react-cookie";
import { Helmet } from "react-helmet";
import * as AuthApi from "../../api/AuthApi";
import AuthenticationBasic from "../../components/Authentication/AuthenticationBasic";

import "./Login.css";
import { Alert, Button, Card, Col, Form, InputGroup, Row, Spinner } from "react-bootstrap";
import { IconEye, IconEyeFilled, IconEyeOff } from "@tabler/icons-react";
import { useDispatch } from "react-redux";
import { showUpdatedToasterMessage } from "../../store/slices/toaster/toasterslice";
import { addAuthData } from "../../store/slices/authUser/authUserSlice";

const Login = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const [cookies, setCookie, removeCookie] = useCookies(["rememberMe"]);
	const [isError, setIsError] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isShow, setIsShow] = useState(true);
	const [errorMessage, setErrorMessage] = useState("");
	document.body.classList.add("login");
	/** Yup validations schema used for form validation **/
	const LoginSchema = yup.object().shape({
		email: yup.string().trim().required("Please enter email address!").email("Please enter valid email address!"),
		password: yup.string().trim().required("Please enter password!"),
	});
	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors: loginError },
		setError,
		setFocus,
	} = useForm({
		mode: "onBlur",
		resolver: yupResolver(LoginSchema),
	});
	const onSubmit = async (formData) => {
		setIsError(false);
		setIsLoading(true);
		if (formData.rememberMe) {
			setCookie("rememberMe", formData.rememberMe, { path: "/" });
			setCookie("email", formData.email, { path: "/" });
			setCookie("token", btoa(formData.password), { path: "/" });
		} else {
			removeCookie("rememberMe");
			removeCookie("email");
			removeCookie("token");
		}
		await AuthApi.login({
			email: formData.email,
			password: formData.password,
		})
			.then((res) => {
				if (res?.data) {
					let user = res.data;
					dispatch(
						addAuthData({
							first_name: user?.first_name,
							last_name: user?.last_name,
							email: user?.email,
							avatar: user?.avatar || "",
							avatar_url: user?.avatar_url || "",
							auth: true,
							role: user?.role,
							token: user?.token,
							permissions: btoa(JSON.stringify(user?.permissions)),
						})
					);
					navigate("/dashboard");
				}
			})
			.catch((error) => {
				setIsError(true);
				setErrorMessage(error.errorMessage);
			});
		setIsLoading(false);
	};
	useEffect(() => {
		if (cookies.rememberMe) {
			setValue("email", cookies.email);
			setValue("password", atob(cookies.token));
			setValue("rememberMe", cookies.rememberMe);
		}
	}, []);
	return (
		<AuthenticationBasic>
			<Helmet>
				<title>Login</title>
			</Helmet>
			<Card className="card-md">
				<Card.Header className="text-center bg-primary-lt">
					<Card.Title as={"h1"} className="w-100 text-center h1">
						Login
					</Card.Title>
				</Card.Header>
				<Card.Body>
					<Form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
						{isError && (
							<Alert variant="danger" className="p-2">
								{errorMessage}
							</Alert>
						)}
						<Form.Group className="mb-3" controlId="email">
							<Form.Label>Email</Form.Label>
							<Form.Control
								type="text"
								className={`${loginError.email && "is-invalid"}`}
								placeholder="Enter Email"
								{...register("email")}
							/>
							{loginError.email && (
								<Form.Text className="invalid-feedback">{loginError.email.message}</Form.Text>
							)}
						</Form.Group>
						<Form.Group className="mb-3" controlId="password">
							<Form.Label>Password</Form.Label>
							<InputGroup className="input-group-flat">
								<Form.Control
									type={`${isShow ? "password" : "text"}`}
									className={`${loginError.password && "is-invalid"}`}
									placeholder="Enter Password"
									{...register("password")}
								/>
								<InputGroup.Text as="span" className={`${loginError.password && "border-danger"}`}>
									<Link
										to={""}
										tabIndex="-1"
										className={`${loginError.password && "text-danger"}`}
										onClick={() => setIsShow(!isShow)}
									>
										{isShow ? <IconEye stroke={1.5} size={20} /> : <IconEyeOff stroke={1.5} size={20} />}
									</Link>
								</InputGroup.Text>
							</InputGroup>
							{loginError.password && (
								<Form.Text className="invalid-feedback">{loginError.password.message}</Form.Text>
							)}
						</Form.Group>
						<Row className="align-items-center justify-content-between mb-2">
							<Form.Group as={Col} md="auto" className="mb-3" controlId="formBasicCheckbox">
								<Form.Check
									type="checkbox"
									label="Remember Me"
									{...register("rememberMe")}
									className="mb-0"
								/>
							</Form.Group>
							<Form.Group as={Col} md="auto" className="mb-3" controlId="formBasicCheckbox">
								<Link to={"/forgot-password"} className="">
									Forgot Password?
								</Link>
							</Form.Group>
						</Row>
						<Button type="Submit" color="primary" className="w-100" disabled={isLoading}>
							{isLoading && <Spinner animation="border" className="me-2" />}
							Login
						</Button>
					</Form>
				</Card.Body>
			</Card>
		</AuthenticationBasic>
	);
};
export default Login;
