import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Card, Col, Form, ListGroup, Row, Spinner } from "react-bootstrap";
import { IconPencil, IconUser } from "@tabler/icons-react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import * as UserAPI from "../../api/UserAPI";
import { showUpdatedToasterMessage } from "../../store/slices/toaster/toasterslice";
import { addAuthData } from "../../store/slices/authUser/authUserSlice";
import CustomModal from "../../components/CustomModal/CustomModal";
import Utils from "../../components/Utils";
import axios from "axios";
const MyProfile = ({ profileModal, setProfileModal }) => {
	const authSelector = useSelector((state) => state.dhi.authUserReducer);
	const [isLoading, setIsLoading] = useState(false);
	const [userImage, setUserImage] = useState(
		authSelector.avatar_url ? process.env.REACT_APP_UPLOAD_BASE_URL + authSelector.avatar_url : ""
	);
	/** Yup validations schema used for form validation **/
	const updateProfileData = async (newToken) => {
        axios.interceptors.request.use(
			(req) => {
				req.baseURL = process.env.REACT_APP_API_URL;
				if (newToken) {
					req.headers = {
						"Content-Type": "application/json",
						Authorization: `Bearer ${newToken}`,
						...req.headers,
					};
				}
				return req;
			},
			(error) => {
				return error;
			}
		);
		await UserAPI.getProfile().then(({ data }) => {
			dispatch(
				addAuthData({
					...initReducerData,
					first_name: data.first_name,
					last_name: data.last_name,
					email: data.email,
					avatar: data.avatar,
					avatar_url: data.avatar_url,
                    token: newToken
				})
			);
		});
	};
	let defaultUserValue = {
		first_name: authSelector.first_name,
		last_name: authSelector.last_name,
		email: authSelector.email,
		avatar: null,
	};

	let initReducerData = { ...authSelector };
	const userSchema = yup.object().shape({
		first_name: yup.string().trim().required("Please enter first name!"),
		last_name: yup.string().trim().required("Please enter last name!"),
		email: yup.string().trim().required("Please enter email address!").email("Please enter valid email address!"),
	});
	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors: userError },
		reset,
		setError,
		setFocus,
	} = useForm({
		mode: "onBlur",
		resolver: yupResolver(userSchema),
		defaultValues: defaultUserValue,
	});
	const dispatch = useDispatch();
	const handleFileInputChange = (e) => {
		let image = e.target.files[0];
		if (image) {
			Utils.getBase64Image(image)
				.then((result) => {
					setUserImage(result);
				})
				.catch((error) => {
					setValue("avatar", null);
				});
		}
	};
	const userFormSubmit = async (formData) => {
		if (!formData?.avatar) {
			delete formData.avatar;
		}
		let refineFormData = Utils.getFormData(formData);
		setIsLoading(true);
		await UserAPI.updateProfile(refineFormData)
			.then(({data}) => {
				updateProfileData(data);
                setProfileModal(false);
				dispatch(
					showUpdatedToasterMessage({
						message: "Profile update successfully.",
						type: "success",
					})
				);
			})
			.catch((error) => {
				if (error?.data) {
					setError("email", {
						type: "custom",
						message: "Email address already exist.",
					});
					setFocus("email");
				} else {
					dispatch(
						showUpdatedToasterMessage({
							message: error?.errorMessage,
							type: "danger",
						})
					);
				}
			});
		setIsLoading(false);
	};
	return (
		<CustomModal
			show={profileModal}
			isLoading={isLoading}
			onHide={() => setProfileModal(false)}
			modalHeading={"My Profile"}
			size="lg"
			saveBtnText={"Save Changes"}
			onSaveCallback={handleSubmit(userFormSubmit)}
		>
			<Form onSubmit={handleSubmit(userFormSubmit)} autoComplete="off">
				<Row className="row-cards">
					<Form.Group as={Col} className="mb-3">
						<span
							className="avatar avatar-xl bg-gold-lt"
							style={{
								backgroundImage: userImage ? `url('${userImage}')` : "none",
							}}
						>
							{!userImage && <IconUser stroke={1.5} size={16} />}
						</span>
						<Button
							variant="secondary"
							size="sm"
							// onClick={() => fileInput.current.click()}
							className="btn-icon position-absolute"
							style={{
								zIndex: 1,
								marginLeft: "-29px",
								marginTop: "83px",
							}}
						>
							<IconPencil stroke={1.5} size={16} />
						</Button>
						<input
							type="file"
							className="-d-none btn-icon position-absolute opacity-0"
							style={{
								zIndex: 1,
								width: "24px",
								marginLeft: "-29px",
								marginTop: "83px",
							}}
							accept="image/png, image/gif, image/jpeg"
							{...register("avatar")}
							onChange={handleFileInputChange}
						/>
						{/* <input type="hidden" value={userImage} {...register("avatar")} /> */}
					</Form.Group>
				</Row>
				<Row className="row-cards">
					<Form.Group as={Col} md="6">
						<Form.Label className="required">First Name</Form.Label>
						<Form.Control
							type="text"
							className={`${userError.first_name && "is-invalid"}`}
							placeholder="Enter First Name"
							{...register("first_name")}
						/>
						{userError.first_name && (
							<Form.Text className="invalid-feedback">{userError.first_name.message}</Form.Text>
						)}
					</Form.Group>
					<Form.Group as={Col} md="6">
						<Form.Label className="required">Last Name</Form.Label>
						<Form.Control
							type="text"
							className={`${userError.last_name && "is-invalid"}`}
							placeholder="Enter Last Name"
							{...register("last_name")}
						/>
						{userError.last_name && (
							<Form.Text className="invalid-feedback">{userError.last_name.message}</Form.Text>
						)}
					</Form.Group>
					<Form.Group as={Col} md="6" controlId="email">
						<Form.Label className="required">Email address</Form.Label>
						<Form.Control
							type="email"
							className={`${userError.email && "is-invalid"}`}
							placeholder="Enter Email"
							{...register("email")}
						/>
						{userError.email && <Form.Text className="invalid-feedback">{userError.email.message}</Form.Text>}
					</Form.Group>
				</Row>
			</Form>
		</CustomModal>
	);
};
export default MyProfile;
