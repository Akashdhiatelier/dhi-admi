import React,{useState} from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import * as UserAPI from "../../api/UserAPI";
import * as AuthAPI from "../../api/AuthApi";
import AuthenticationBasic from "../../components/Authentication/AuthenticationBasic";
import { Alert, Button, Card, Form, Spinner } from "react-bootstrap";
import "./Login.css";
import { useDispatch } from "react-redux";
import { showUpdatedToasterMessage } from "../../store/slices/toaster/toasterslice";
const ForgotPassword = () => {
	const [isLoading,setIsLoading] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const dispatch = useDispatch();
	const navigate = useNavigate();
	document.body.classList.add('login');
	const ForgetPasswordSchema = yup.object().shape({
		email: yup.string().trim().required('Please enter email address!').email('Please enter valid email address!')
	});
	const { register, handleSubmit,setValue, formState: { errors:forgotError }, setError, setFocus } = useForm({
		mode: "onBlur",
		resolver: yupResolver(ForgetPasswordSchema)
	});
	const onSubmit = async(formData) => {
		setIsLoading(true);
		await AuthAPI.forgotPassword({email:formData.email}).then(({data})=>{
			dispatch(showUpdatedToasterMessage({
				message:"Password reset link sent to your email address.",
				type:"success",
				delay:5000
			}));
			navigate("/login");
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
	};
	return (
		<AuthenticationBasic>
			<Helmet>
				<title>Forgot Password</title>
			</Helmet>
			<Card className="card-md">
				<Card.Header className="text-center bg-primary-lt">
					<Card.Title as={"h1"}  className="w-100 text-center h1">Forgot Password</Card.Title>
				</Card.Header>
				<Card.Body>
					<p className="text-muted">
						Enter your email address and your reset password link
						will be sent on this email.
					</p>
					<Form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
						{/* {isError && <Alert variant="danger" className="p-2">{errorMessage}</Alert>} */}
						
						<Form.Group className="mb-4" controlId="email">
							<Form.Label>Email</Form.Label>
							<Form.Control type="text" className={`${forgotError.email && 'is-invalid'}`} placeholder="Enter Email" {...register("email")} />
							{forgotError.email && <Form.Text className="invalid-feedback">{forgotError.email.message}</Form.Text>}
						</Form.Group>
						<Button type="Submit" color="primary" className="w-100" disabled={isLoading}>
							{isLoading && <Spinner animation="border" className="me-2" />}
							Submit
						</Button>
						<Form.Text as="div" bsPrefix="text-center mt-3">Back to <Link to={'/login'}>Login</Link></Form.Text>
					</Form>
				</Card.Body>
			</Card>
		</AuthenticationBasic>
	);
};
export default ForgotPassword;
