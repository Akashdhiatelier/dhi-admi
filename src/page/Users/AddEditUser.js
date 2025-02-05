import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Col, Form, Row } from "react-bootstrap";
import { IconPencil, IconPhotoPlus, IconUser } from "@tabler/icons-react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Utils from "../../components/Utils";
import { showUpdatedToasterMessage } from "../../store/slices/toaster/toasterslice";
import CustomModal from "../../components/CustomModal/CustomModal";
import * as UserAPI from "../../api/UserAPI";
import SelectBox from "../../components/SelectBox";
const AddEditUser = ({ userModal, resetUserModal, roles }) => {
	const dispatch = useDispatch();
	const userData = useSelector((state) => state.dhi.authUserReducer);
	const [isLoading, setIsLoading] = useState(false);
	const fileInput = useRef();
	const [userImage, setUserImage] = useState("");

	const fetchEditUser = async () => {
		setIsLoading(true);
		await UserAPI.getOne(userModal.id).then(({ data }) => {
			if (data) {
				setValue("first_name", data.first_name);
				setValue("last_name", data.last_name);
				setValue("email", data.email);
				setValue("role", data.role_id);
				setValue("status", data.status);
                if(data.avatar_url){
                    setUserImage(process.env.REACT_APP_UPLOAD_BASE_URL+data.avatar_url);
                }
			}
		});
		setIsLoading(false);
	};
	useEffect(() => {
		if (userModal.id) {
			fetchEditUser();
		}
	}, []);
	/** Yup validations schema used for form validation **/
	let defaultUserValue = {
		first_name: "",
		last_name: "",
		email: "",
		role: "",
		status: "Active",
		avatar: "",
	};
	const userSchema = yup.object().shape({
		first_name: yup.string().trim().required("Please enter first name!"),
		last_name: yup.string().trim().required("Please enter last name!"),
		email: yup.string().trim().required("Please enter email address!").email("Please enter valid email address!"),
		role: yup.string().trim().required("Please select role!"),
		status: yup.string().trim().required("Please select status!"),
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
	const formSubmit = async (formData) => {
        if(!formData?.avatar){
            delete formData.avatar;
        }
        let refineFormData = Utils.getFormData(formData);
        // if(!formData?.avatar){
        //     delete formData.avatar;
        // }
		// return false;
		setIsLoading(true);
		if (userModal.action === "Edit") {
			await UserAPI.update(userModal.id, refineFormData)
				.then((res) => {
					resetUserModal(true);
					dispatch(
						showUpdatedToasterMessage({
							message: "User update successfully.",
							type: "success",
						})
					);
				})
				.catch((error) => {
					setIsLoading(false);
					if(error?.code===409){
						setError("email", {
							type: "custom",
							message: error?.errorMessage,
						});
						setFocus("email");
					}
                    else{
                        dispatch(
                            showUpdatedToasterMessage({
                                message: error?.errorMessage,
                                type: "danger",
                            })
                        ); 
                    }
				});
		} else {
			await UserAPI.create(refineFormData)
				.then((res) => {
					resetUserModal(true);
					dispatch(
						showUpdatedToasterMessage({
							message: "User add successfully.",
							type: "success",
						})
					);
				})
				.catch((error) => {
					if(error?.code===409){
						setError("email", {
							type: "custom",
							message: error?.errorMessage,
						});
						setFocus("email");
					}
                    else{
                        dispatch(
                            showUpdatedToasterMessage({
                                message: error?.errorMessage,
                                type: "danger",
                            })
                        ); 
                    }
				});
		}
		setIsLoading(false);
	};
	const handleFileInputChange = (e) => {
		let image = e.target.files[0];
		if (image) {
			Utils.getBase64Image(image)
				.then((result) => {
					setUserImage(result);
				})
				.catch((error) => {
					setUserImage("");
				});
		}
	};

	return (
		<CustomModal
			show={userModal.show}
			isLoading={isLoading}
			onHide={resetUserModal}
			modalHeading={userModal.title}
			size="lg"
			saveBtnText={userModal.saveBtnText}
			onSaveCallback={handleSubmit(formSubmit)}
		>
			<Form onSubmit={handleSubmit(formSubmit)} autoComplete="off">
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
							// ref={fileInput}
							className="-d-none btn-icon position-absolute opacity-0"
                            style={{
								zIndex: 1,
                                width:"24px",
								marginLeft: "-29px",
								marginTop: "83px"
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
					<Form.Group as={Col} md="6" controlId="role">
						<Form.Label className="required">Role</Form.Label>
						<Form.Select
							aria-label="Role"
							className={`${userError.role && "is-invalid"} text-capitalize`}
							{...register("role")}
						>
							<option value="">Select</option>
							{roles?.map((item, index) => {
								return (
									<option key={index} value={item.id}>
										{item.name}
									</option>
								);
							})}
						</Form.Select>
						{userError.role && <Form.Text className="invalid-feedback">{userError.role.message}</Form.Text>}
					</Form.Group>
					<Form.Group as={Col} md="6" controlId="status">
						<Form.Label className="required">Status</Form.Label>
						<Form.Select
							aria-label="Status"
							className={`${userError.status && "is-invalid"}`}
							{...register("status")}
						>
							<option value="">Select</option>
							<option value="Active">Active</option>
							<option value="Inactive">Inactive</option>
						</Form.Select>
						{userError.status && <Form.Text className="invalid-feedback">{userError.status.message}</Form.Text>}
					</Form.Group>
				</Row>
			</Form>
		</CustomModal>
	);
};
export default AddEditUser;
