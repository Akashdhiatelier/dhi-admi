import React, { lazy, useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { IconHandClick, IconHome, IconPencil, IconPhotoPlus, IconSettings, IconX } from "@tabler/icons-react";
import { Button, Card, Col, Container, Form, Nav, Row, Tab } from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Utils from "../../components/Utils";
import { showUpdatedToasterMessage } from "../../store/slices/toaster/toasterslice";
import CustomModal from "../../components/CustomModal/CustomModal";
import * as ModelAPI from "../../api/ModelAPI";
import * as ProjectAPI from "../../api/ProjectAPI";
import SelectBox from "../../components/SelectBox";
import UploadProjectFile from "./UploadProjectFile";
import ProjectConfig from "./ProjectConfig";
const Viewer = lazy(() => import("./Viewer"));
const AddEditProject = ({ projectModal, resetProjectModal }) => {
	const dispatch = useDispatch();
	const [isLoading, setIsLoading] = useState(false);
	const [models, setModels] = useState([]);
	const [projectImage, setProjectImage] = useState("");
	const [projectData, setProjectData] = useState([]);
	const [pickedMeshId, setPickedMeshId] = useState(null);
	const [activeTab, setActiveTab] = useState("home");
	const [defaultModels, setDefaultModels] = useState([]);
	const [availableModels, setAvailableModels] = useState([]);
	const [toggleAction, setToggleAction] = useState();
	const fetchModels = useCallback(async () => {
		const keyword = "";
		await ModelAPI.get(keyword).then(({ data }) => {
			if (data) {
				setModels(data);
			}
		});
	}, []);
	const fetchEditProject = async () => {
		setIsLoading(true);
		await ProjectAPI.getOne(projectModal.id).then(({ data }) => {
			let selectedCategory = {};
			if (data?.category) {
				selectedCategory.value = data?.category?.id;
				selectedCategory.label = data?.category?.name;
			}
			data.tags = data.tags ? data.tags.split(",").map((item) => ({ label: item, value: item })) : null;
			setValue("name", data.name);
			setValue("description", data.description);
			setValue("tags", data.tags);
			setValue("price", data.price);
			setValue("status", data.status);
			if (data?.thumbnail) {
				setProjectImage(process.env.REACT_APP_UPLOAD_BASE_URL + data.thumbnail);
			}
			const refineConfig = data?.models.reduce((prev, curr) => {
				prev.push({
					object_id: curr.object_id,
					model_id: curr.model?.id,
					allow_change: curr.allow_change,
					allow_move: curr.allow_move,
				});
				return prev;
			}, []);
			setDefaultModels(refineConfig.filter((item) => item.allow_change === false));
			setAvailableModels(refineConfig.filter((item) => item.allow_change === true));
			setProjectData(data);
			setToggleAction(data.project_file ? "VIEW" : "NEW");
			setIsLoading(false);
		});
	};
	useEffect(() => {
		if (projectModal.id) {
			fetchEditProject();
			fetchModels();
		} else {
			setToggleAction("NEW");
		}
	}, []);
	useEffect(() => {
		if (pickedMeshId && activeTab != "config") {
			setActiveTab("config");
		}
	}, [pickedMeshId]);
	/** Yup validations schema used for form validation **/
	let defaultProjectValue = {
		name: "",
		tags: [],
		price: "",
		status: "Active",
		thumbnail: "",
	};
	const projectSchema = yup.object().shape({
		name: yup.string().trim().required("Please enter project name!"),
		price: yup.number().typeError("Please enter valid price!").positive("Price must be more than 0 (zero)"),
		status: yup.string().trim().required("Please select status!"),
	});
	const {
		register,
		handleSubmit,
		setValue,
		control,
		formState: { errors: userError },
		reset,
		setError,
		setFocus,
	} = useForm({
		mode: "onBlur",
		resolver: yupResolver(projectSchema),
		defaultValues: defaultProjectValue,
	});
	const formSubmit = async (formData) => {
		// formData = { ...formData, categoriesId: formData?.category_id?.value };
		formData.category = formData?.category_id?.value;
		// formData.tags = formData.tags?formData.tags.map(item=>item.value).join(','):"";
		formData.tags = JSON.stringify(formData.tags);
		delete formData?.category_id;
		if (!formData?.thumbnail) {
			delete formData.thumbnail;
		}
		const configData = [...defaultModels, ...availableModels];
		let refineFormData = Utils.getFormData(formData);
		setIsLoading(true);
		if (projectModal.action === "Edit") {
			await ProjectAPI.updateConfig(projectModal.id, { config: configData })
				.then((res) => {
					console.log("updateConfigSuccess");
				})
				.catch((error) => {
					dispatch(
						showUpdatedToasterMessage({
							message: error?.errorMessage,
							type: "danger",
						})
					);
				});
			await ProjectAPI.update(projectModal.id, refineFormData)
				.then(({ data }) => {
					resetProjectModal(true);
					dispatch(
						showUpdatedToasterMessage({
							message: "Project update successfully.",
							type: "success",
						})
					);
				})
				.catch((error) => {
					if (error?.code === 404) {
						setError("name", {
							type: "custom",
							message: error.errorMessage,
						});
						setFocus("name");
					} else if (error?.code === 406) {
						Object.keys(error.errorMessage).forEach((key) => {
							setError(key, { type: "custom", message: key.message });
						});
						setFocus(Object.keys(error.errorMessage)[0]);
					} else {
						dispatch(
							showUpdatedToasterMessage({
								message: error?.errorMessage,
								type: "danger",
							})
						);
					}
				});
		} else {
			await ProjectAPI.create(refineFormData)
				.then(({ data }) => {
					resetProjectModal(true, data?.id);
					dispatch(
						showUpdatedToasterMessage({
							message: "Project add successfully.",
							type: "success",
						})
					);
				})
				.catch((error) => {
					if (error?.code === 404) {
						setError("name", {
							type: "custom",
							message: error?.errorMessage,
						});
						setFocus("name");
					} else if (error?.code === 406) {
						Object.keys(error.errorMessage).forEach((key) => {
							setError(key, { type: "custom", message: key.message });
						});
						setFocus(Object.keys(error.errorMessage)[0]);
					} else {
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
					setProjectImage(result);
				})
				.catch((error) => {
					setProjectImage("");
				});
		}
	};
	const renderForm = () => {
		return (
			<Form autoComplete="off">
				<Row className="row-cards">
					<Form.Group as={Col} className="mb-3">
						<span
							className="avatar avatar-xl bg-gold-lt"
							style={{
								backgroundImage: projectImage ? `url('${projectImage}')` : "none",
							}}
						>
							{!projectImage && <IconPhotoPlus stroke={1.5} size={16} />}
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
								width: "24px",
								marginLeft: "-29px",
								marginTop: "83px",
							}}
							{...register("thumbnail")}
							onChange={handleFileInputChange}
							accept="image/png, image/gif, image/jpeg"
						/>
					</Form.Group>
				</Row>
				<Row className="row-cards">
					<Form.Group as={Col}>
						<Form.Label className="required">Project Name</Form.Label>
						<Form.Control
							type="text"
							className={`${userError.name && "is-invalid"}`}
							placeholder="Enter Project Name"
							{...register("name")}
						/>
						{userError.name && <Form.Text className="invalid-feedback">{userError.name.message}</Form.Text>}
					</Form.Group>
					<Form.Group as={Col} md="12">
						<Form.Label>Project Description</Form.Label>
						<Form.Control
							as="textarea"
							className={`${userError.description && "is-invalid"}`}
							placeholder="Enter Project Description"
							{...register("description")}
						/>
						{userError.description && (
							<Form.Text className="invalid-feedback">{userError.description.message}</Form.Text>
						)}
					</Form.Group>
					<Form.Group as={Col} md="12" controlId="tags">
						<Form.Label>Tags</Form.Label>
						<Controller
							name="tags"
							control={control}
							render={({ field }) => (
								<SelectBox
									{...field}
									placeholder="Enter tags"
									isCreatable={true}
									isMulti
									isClearable
									noOptionsMessage={() => null}
									options={[]}
									className={`form-control p-0 border-0`}
								/>
							)}
						/>
					</Form.Group>
					<Form.Group as={Col} md={`6`} controlId="price">
						<Form.Label className="required">Price</Form.Label>
						<Form.Control
							type="number"
							className={`${userError.price && "is-invalid"}`}
							placeholder="Enter Price"
							{...register("price")}
						/>
						{userError.price && <Form.Text className="invalid-feedback">{userError.price.message}</Form.Text>}
					</Form.Group>
					<Form.Group as={Col} md={`6`} controlId="status">
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
		);
	};
	const renderConfigDefault = () => {
		return (
			<Container className="h-100">
				{" "}
				<Row className={`${!pickedMeshId && "h-100 justify-content-center align-items-center"}`}>
					<Col className="col-auto text-muted text-center">
						{projectData && projectData.project_file ? (
							<>
								<p className="mb-1">
									<IconHandClick stroke={1.2} />
								</p>
								<p>Please select object</p>
							</>
						) : (
							<p>Upload model file!</p>
						)}
					</Col>
				</Row>
			</Container>
		);
	};
	const handleToggleAction = () => {
		setToggleAction(toggleAction === "UPLOAD" ? "VIEW" : "UPLOAD");
	};

	return (
		<CustomModal
			show={projectModal.show}
			isLoading={isLoading}
			onHide={resetProjectModal}
			modalHeading={projectModal.title}
			size="lg"
			hadBodyPadding={projectModal.id}
			fullscreen={projectModal.id}
			scrollable={projectModal.id}
			hasActions={!projectModal.id}
			saveBtnText={projectModal.saveBtnText}
			onSaveCallback={handleSubmit(formSubmit)}
		>
			{!projectModal.id && renderForm()}
			{projectModal.id && (
				<Container fluid className="h-100">
					<Row className="h-100">
						<Col size="md" className="border-end text-end h-100 overflow-y-hidden">
							<Row className="h-100 justify-content-center">
								{toggleAction && toggleAction !== "NEW" && (
									<Col className="text-end ">
										<Button
											variant={`${toggleAction === "VIEW" ? "primary" : "danger"}`}
											className="btn-icon position-absolute"
											style={{ marginTop: "5px", marginLeft: "-32px" }}
											onClick={handleToggleAction}
										>
											{toggleAction === "VIEW" ? <IconPencil size={16} /> : <IconX size={16} />}
										</Button>
									</Col>
								)}
								<Col md="12" className={`border-bottom h-100 px-0 ${toggleAction === "UPLOAD" && "mt-3"}`}>
									{toggleAction && (toggleAction === "UPLOAD" || toggleAction === "NEW") && (
										<UploadProjectFile
											projectId={projectModal.id}
											fetchEditProject={() => {
												fetchEditProject();
												// fetchMaterial();
											}}
										/>
									)}
									{toggleAction && toggleAction === "VIEW" && (
										<Viewer
											projectModelFile={projectData.project_file}
											setPickedMeshId={setPickedMeshId}
										/>
									)}
								</Col>
							</Row>
						</Col>
						<Col md={3} className="p-0 mh-100 overflow-y-auto">
							<Card className="h-100 border-0">
								<Tab.Container className="card" activeKey={activeTab} onSelect={(key) => setActiveTab(key)}>
									<Card.Header className="bg-gold-lt">
										<Nav as="ul" className="nav-tabs card-header-tabs nav-fill ">
											<Nav.Item as="li">
												<Nav.Link eventKey="home">
													<IconHome size={16} stroke={1.5} className="me-1" /> Home
												</Nav.Link>
											</Nav.Item>
											<Nav.Item as="li">
												<Nav.Link eventKey="config">
													<IconSettings size={16} stroke={1.5} className="me-1" /> Config
												</Nav.Link>
											</Nav.Item>
										</Nav>
									</Card.Header>
									<Card.Body className="mh-100 overflow-y-auto p-0">
										<Tab.Content className="h-100">
											<Tab.Pane eventKey="home">
												<div className="p-3">{renderForm()}</div>
											</Tab.Pane>
											<Tab.Pane eventKey="config" className="h-100">
												{pickedMeshId && (
													<ProjectConfig
														models={models}
														defaultModels={defaultModels}
														setDefaultModels={setDefaultModels}
														availableModels={availableModels}
														setAvailableModels={setAvailableModels}
														pickedMeshId={pickedMeshId}
													/>
												)}
												{!pickedMeshId && renderConfigDefault()}
											</Tab.Pane>
										</Tab.Content>
									</Card.Body>
									<Card.Footer className="justify-content-start bg-gold-lt">
										<Button type="submit" onClick={handleSubmit(formSubmit)}>
											{projectModal.saveBtnText}
										</Button>
										<Button variant="sucess" className="ms-3" onClick={resetProjectModal}>
											Close
										</Button>
									</Card.Footer>
								</Tab.Container>
							</Card>
						</Col>
					</Row>
				</Container>
			)}
		</CustomModal>
	);
};
export default AddEditProject;
