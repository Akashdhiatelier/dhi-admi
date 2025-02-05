import React, {lazy, useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Card, Col, Container, Form, Nav, Row, Tab } from "react-bootstrap";
import { IconHandClick, IconHome, IconPencil, IconPhotoPlus, IconSettings, IconX } from "@tabler/icons-react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Utils from "../../components/Utils";
import { showUpdatedToasterMessage } from "../../store/slices/toaster/toasterslice";
import CustomModal from "../../components/CustomModal/CustomModal";
import * as ModelAPI from "../../api/ModelAPI";
import * as CategoryAPI from "../../api/CategoryAPI";
import * as MaterialAPI from "../../api/MaterialAPI";
import SelectBox from "../../components/SelectBox";
import UploadModelFile from "./UploadModelFile";
import ModelConfig from "./ModelConfig";
const Viewer = lazy(() => import("./Viewer"));

const AddEditModel = ({ modelModal, resetModelModal }) => {
	const dispatch = useDispatch();
	const [isLoading, setIsLoading] = useState(false);
	const [categories, setCategories] = useState([]);
	const [materials, setMaterials] = useState([]);
	const [modelImage, setModelImage] = useState("");
	const [modelData, setModelData] = useState([]);
	const [pickedMeshId, setPickedMeshId] = useState(null);
	const [activeTab, setActiveTab] = useState("home");
	const [selectedMaterialsAllowChange, setSelectedMaterialsAllowChange] = useState([]);
	const [defaultMaterials, setDefaultMaterials] = useState([]);
	const [toggleAction, setToggleAction] = useState();

	const fetchCategories = useCallback(async () => {
		await CategoryAPI.getAll({ _page: 1, _limit: 100 }).then(({ data }) => {
			if (data) {
				let optionCategories =
					data.data.map((item) => ({
						label: item.name,
						value: item.id,
					})) || [];
				setCategories(optionCategories);
			}
		});
	}, []);
	const fetchMaterial = useCallback(async () => {
		await MaterialAPI.getAll({ _page: 1, _limit: 100 }).then(({ data }) => {
			if (data) {
				setMaterials(data?.data);
			}
		});
	}, []);
	const fetchEditModel = async () => {
		setIsLoading(true);
		await ModelAPI.getOne(modelModal.id).then(({ data }) => {
			let selectedCategory = {};
			if (data?.category) {
				selectedCategory.value = data?.category?.id;
				selectedCategory.label = data?.category?.name;
			}
			data.tags = data.tags ? data.tags.split(",").map((item) => ({ label: item, value: item })) : null;
			setValue("name", data.name);
			setValue("category_id", selectedCategory);
			setValue("description", data.description);
			setValue("tags", data.tags);
			setValue("vendor_name", data.vendor_name);
			setValue("price", data.price);
			setValue("status", data.status);
			if (data?.thumbnail) {
				setModelImage(process.env.REACT_APP_UPLOAD_BASE_URL + data.thumbnail);
			}
			// if (data?.model_file) {
			// 	setActiveTab("config");
			// }
			const refineConfig = data?.config.reduce((prev, curr) => {
				prev.push({ layer_id: curr.layer_id, material_id: curr.material?.id, allow_change: curr.allow_change });
				return prev;
			}, []);
			setDefaultMaterials(refineConfig.filter((item) => item.allow_change === false));
			setSelectedMaterialsAllowChange(refineConfig.filter((item) => item.allow_change === true));
			setModelData(data);
			setToggleAction(data.model_file ? "VIEW" : "NEW");
			setIsLoading(false);
		});
	};
	useEffect(() => {
		fetchCategories();
		if (modelModal.id) {
			fetchEditModel();
			fetchMaterial();
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
	let defaultModelValue = {
		name: "",
		category_id: "",
		tags: [],
		vendor_name: "",
		price: "",
		status: "Active",
		models: "",
	};
	const modelSchema = yup.object().shape({
		name: yup.string().trim().required("Please enter model name!"),
		category_id: yup
			.object()
			.shape({
				label: yup.string().required("category is required (from label)"),
				value: yup.string().required("Please select category!"),
			})
			.nullable() // for handling null value when clearing options via clicking "x"
			.required("Please select category!"),
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
		resolver: yupResolver(modelSchema),
		defaultValues: defaultModelValue,
	});

	const formSubmit = async (formData) => {
		// formData = { ...formData, categoriesId: formData?.category_id?.value };
		formData.category = formData?.category_id?.value;
		// formData.tags = formData.tags?formData.tags.map(item=>item.value).join(','):"";
		formData.tags = JSON.stringify(formData.tags);
		delete formData?.category_id;
		if (!formData?.models) {
			delete formData.models;
		}
		const configData = [...defaultMaterials, ...selectedMaterialsAllowChange];
		let refineFormData = Utils.getFormData(formData);
		setIsLoading(true);
		if (modelModal.action === "Edit") {
			await ModelAPI.updateConfig(modelModal.id, { config: configData })
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
			await ModelAPI.update(modelModal.id, refineFormData)
				.then(({ data }) => {
					resetModelModal(true);
					dispatch(
						showUpdatedToasterMessage({
							message: "Model update successfully.",
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
			await ModelAPI.create(refineFormData)
				.then(({ data }) => {
					resetModelModal(true, data?.id);
					dispatch(
						showUpdatedToasterMessage({
							message: "Model add successfully.",
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
					setModelImage(result);
				})
				.catch((error) => {
					setModelImage("");
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
								backgroundImage: modelImage ? `url('${modelImage}')` : "none",
							}}
						>
							{!modelImage && <IconPhotoPlus stroke={1.5} size={16} />}
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
							{...register("models")}
							onChange={handleFileInputChange}
							accept="image/png, image/gif, image/jpeg"
						/>
						{/* <input type="hidden" value={modelImage} {...register("thumbnail")} /> */}
					</Form.Group>
				</Row>
				<Row className="row-cards">
					<Form.Group as={Col} md={`${!modelModal.id && 6}`}>
						<Form.Label className="required">Model Name</Form.Label>
						<Form.Control
							type="text"
							className={`${userError.name && "is-invalid"}`}
							placeholder="Enter Model Name"
							{...register("name")}
						/>
						{userError.name && <Form.Text className="invalid-feedback">{userError.name.message}</Form.Text>}
					</Form.Group>

					<Form.Group as={Col} md={`${!modelModal.id && 6}`} controlId="category">
						<Form.Label className="required">Category</Form.Label>
						<Controller
							name="category_id"
							control={control}
							render={({ field }) => (
								<SelectBox
									{...field}
									isClearable
									isSearchable={true}
									options={categories}
									className={`form-control p-0 border-0 ${userError.category_id && "is-invalid"}`}
								/>
							)}
						/>
						{userError.category_id && (
							<Form.Text className="invalid-feedback">{userError.category_id.message}</Form.Text>
						)}
					</Form.Group>
					<Form.Group as={Col} md="12">
						<Form.Label>Model Description</Form.Label>
						<Form.Control
							as="textarea"
							className={`${userError.description && "is-invalid"}`}
							placeholder="Enter Model Description"
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
									isCreatable={true}
									placeholder="Enter tags"
									isMulti
									isClearable
									noOptionsMessage={() => null}
									options={[]}
									className={`form-control p-0 border-0`}
								/>
							)}
						/>
					</Form.Group>
					<Form.Group as={Col} md={`${!modelModal.id && 4}`} controlId="vendor_name">
						<Form.Label>Vendor Name</Form.Label>
						<Form.Control
							type="text"
							className={`${userError?.vendor_name && "is-invalid"}`}
							placeholder="Enter Vendor Name"
							{...register("vendor_name")}
						/>
					</Form.Group>
					<Form.Group as={Col} md={`${!modelModal.id ? 4 : 6}`} controlId="price">
						<Form.Label className="required">Price</Form.Label>
						<Form.Control
							type="number"
							className={`${userError.price && "is-invalid"}`}
							placeholder="Enter Price"
							{...register("price")}
						/>
						{userError.price && <Form.Text className="invalid-feedback">{userError.price.message}</Form.Text>}
					</Form.Group>
					<Form.Group as={Col} md={`${!modelModal.id ? 4 : 6}`} controlId="status">
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
						{modelData && modelData.model_file ? (
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
			show={modelModal.show}
			isLoading={isLoading}
			onHide={resetModelModal}
			modalHeading={modelModal.title}
			size="lg"
			hadBodyPadding={modelModal.id}
			fullscreen={modelModal.id}
			scrollable={modelModal.id}
			hasActions={!modelModal.id}
			saveBtnText={modelModal.saveBtnText}
			onSaveCallback={handleSubmit(formSubmit)}
		>
			{!modelModal.id && renderForm()}
			{modelModal.id && (
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
										<UploadModelFile
											modelId={modelModal.id}
											fetchEditModel={() => {
												fetchEditModel();
												fetchMaterial();
											}}
										/>
									)}
									{toggleAction && toggleAction === "VIEW" && (
										<Viewer modelFile={modelData.model_file} setPickedMeshId={setPickedMeshId} />
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
													<ModelConfig
														materials={materials}
														defaultMaterials={defaultMaterials}
														setDefaultMaterials={setDefaultMaterials}
														selectedMaterialsAllowChange={selectedMaterialsAllowChange}
														setSelectedMaterialsAllowChange={setSelectedMaterialsAllowChange}
														pickedMeshId={pickedMeshId}
													/>
												)}
												{!pickedMeshId && renderConfigDefault()}
											</Tab.Pane>
										</Tab.Content>
									</Card.Body>
									<Card.Footer className="justify-content-start bg-gold-lt">
										<Button type="submit" onClick={handleSubmit(formSubmit)}>
											{modelModal.saveBtnText}
										</Button>
										<Button variant="sucess" className="ms-3" onClick={resetModelModal}>
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
export default AddEditModel;
