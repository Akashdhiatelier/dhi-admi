import React, { lazy, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { IconArrowBack, IconArrowNarrowLeft, IconChevronLeft, IconHandClick, IconTrash } from "@tabler/icons-react";
import { Accordion, Button, ButtonGroup, Card, Col, Container, Form, ListGroup, Nav, Row } from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { showUpdatedToasterMessage } from "../../store/slices/toaster/toasterslice";
import * as ModelAPI from "../../api/ModelAPI";
import CustomModal from "../../components/CustomModal/CustomModal";
import { DEFAULT_CONFIRM_MODAL } from "../../common/constants";
import Utils from "../../components/Utils";
import { filter } from "lodash";
import ConfirmModal from "../../components/CustomModal/ConfirmModal";
const Viewer = lazy(() => import("./Viewer"));
const DEFAULT_VARIATION_MODE = {
	action: "Add",
	btnTextStep1: "Save as",
	btnTextStep2: "Add",
	step: 1,
};
const AddEditModelVariations = ({ variationModal, setVariationModal }) => {
	const dispatch = useDispatch();
	const [isLoading, setIsLoading] = useState(true);
	const [modelData, setModelData] = useState([]);
	const [modelMaterials, setModelMaterials] = useState([]);
	const [modelLayers, setModelLayers] = useState([]);
	const [pickedMeshId, setPickedMeshId] = useState(null);
	const [action, setAction] = useState("Add");
	const [currentSelection, setCurrentSelection] = useState([]);
	const [modelVariation, setModelVariation] = useState([]);
	const [currentVariationId, setCurrentVariationId] = useState(null);
	const [variationMode, setVariationMode] = useState(DEFAULT_VARIATION_MODE);
	const [variationThumbnail, setVariationThumbnail] = useState();
	const [confirmModal, setConfirmModal] = useState({
		show: false,
		isLoading: false,
		title: "Are you sure?",
		description: "Do you really want to remove this variation? what you've done can't be undone.",
		actionBtnText: "Delete",
		action: "Delete",
	});
	let defaultVariationValue = {
		name: "",
		price: "",
	};
	const variationSchema = yup.object().shape({
		name: yup.string().trim().required("Please enter variation name!"),
		price: yup.number().typeError("Please enter valid price!").positive("Price must be more than 0 (zero)"),
	});
	const {
		register,
		handleSubmit,
		setValue,
		control,
		formState: { errors: variationError },
		reset,
		setError,
		setFocus,
	} = useForm({
		mode: "onBlur",
		resolver: yupResolver(variationSchema),
		defaultValues: defaultVariationValue,
	});
	const fetchModel = async () => {
		setIsLoading(true);
		await ModelAPI.getOne(variationModal.id)
			.then(({ data }) => {
				const refineConfig = data?.config.reduce((prev, curr) => {
					prev.push({ ...curr.material, layer_id: curr.layer_id, allow_change: curr.allow_change });
					return prev;
				}, []);
				setModelMaterials(refineConfig.filter((item) => item.allow_change === true));
				setModelVariation(data.variation);
				setModelData(data);
				// setSelectedMaterialsAllowChange(refineConfig.filter(item=>item.allow_change===true));
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
	useEffect(() => {
		fetchModel();
	}, []);
	const renderVariation = (modelVariation) => {
		return (
			<Row aria-label="Basic example">
				{modelVariation.map((item, i) => {
					return (
						// <Button
						// 	key={i}
						// 	variant="outline-primary"
						// 	className={`${item?.id === currentVariationId && "active"}`}
						// 	onClick={() => handleVariation(item.id)}
						// >
						// 	{item.name}
						// </Button>
						<Col bsPrefix="col-auto" style={{maxWidth:"5.50rem"}} key={i}>
							<Button
								className={`avatar avatar-lg bg-gold-lt cursor-pointer border ${
									item?.id === currentVariationId && "border shadow border-gold"
								}`}
								onClick={() => handleVariation(item.id)}
								style={{
									backgroundImage: item?.thumbnail
										? `url('${process.env.REACT_APP_UPLOAD_BASE_URL + item.thumbnail}')`
										: "none",
								}}
							>
								{!item?.thumbnail && Utils.getAcronym(item.name)}
							</Button>
							<div className="text-truncate mb-1 text-center" title={item.name}>
								{item.name}
							</div>
						</Col>
					);
				})}
			</Row>
			// <ButtonGroup aria-label="Basic example">
			// 	{modelVariation.map((item, i) => {
			// 		return (
			// 			<Button
			// 				key={i}
			// 				variant="outline-primary"
			// 				className={`${item?.id === currentVariationId && "active"}`}
			// 				onClick={() => handleVariation(item.id)}
			// 			>
			// 				{item.name}
			// 			</Button>
			// 		);
			// 	})}
			// </ButtonGroup>
		);
	};
	const renderLayerMaterials = () => {
		const filtered = modelMaterials.filter((item) => item.layer_id === pickedMeshId);
		if (filtered && filtered.length === 0) {
			return (
				<Col className="text-center text-muted">
					<p>No material found.</p>
				</Col>
			);
		}
		return filtered.map((item, i) => {
			const filteredSelected = currentSelection.filter(
				(obj) => obj.material_id === item.id && obj.layer_id === pickedMeshId
			);
			return (
				<Col bsPrefix="col-4" key={i}>
					<label className="form-imagecheck w-100 mb-1">
						<input
							name={`material_check_${pickedMeshId}`}
							type={"radio"}
							defaultValue={item.id}
							className="form-imagecheck-input"
							onChange={(e) => handleUpdateMaterial(e, item.id, pickedMeshId)}
							checked={filteredSelected?.length > 0 ? true : false}
						/>
						<span className="form-imagecheck-figure w-100">
							<span
								className={`avatar avatar-lg bg-primary-lt w-100`}
								style={{
									backgroundImage: item?.thumbnail
										? `url('${process.env.REACT_APP_UPLOAD_BASE_URL + item.thumbnail}')`
										: "none",
								}}
							>
								{!item?.thumbnail && Utils.getAcronym(item.name)}
							</span>
						</span>
					</label>
					<div className="text-truncate mb-1" title={item.name}>
						{item.name}
					</div>
				</Col>
			);
		});
	};
	const handleUpdateMaterial = (event, materialId, layerId) => {
		if (event.target.checked) {
			const filterMaterial = currentSelection.filter((item) => item.layer_id != layerId);
			if (variationMode.action === "Add") {
				setCurrentSelection([...filterMaterial, { material_id: materialId, layer_id: layerId }]);
			} else {
				const filterNotMaterial = currentSelection.filter((item) => item.layer_id == layerId);
				setCurrentSelection([
					...filterMaterial,
					{ id: filterNotMaterial[0].id, material_id: materialId, layer_id: layerId },
				]);
			}
		}
		// setCurrentSelection();
	};
	const handleCloseModal = () => {
		setVariationModal((prevState) => ({ ...prevState, show: false }));
	};
	const resetVariation = () => {
		setVariationMode(DEFAULT_VARIATION_MODE);
		setCurrentVariationId(null);
		setCurrentSelection([]);
		reset(defaultVariationValue);
	};
	const handleVariation = (variationId) => {
		setVariationMode((preveState) => ({
			...preveState,
			action: "Update",
			step: 1,
			btnTextStep1: "Save",
			btnTextStep2: "Update",
		}));
		setCurrentVariationId(variationId);
		const filteredCurrentVariation = modelVariation.filter((item) => item.id === variationId);
		setCurrentSelection(filteredCurrentVariation.length > 0 ? filteredCurrentVariation[0]?.details : []);
	};
	const handleStep1Submit = async () => {
		setPickedMeshId(null);
		if (variationMode.step === 1) {
			setVariationMode((preveState) => ({ ...preveState, step: 2 }));
			if (variationMode.action === "Add") {
				let totalPrice = 0;
				try {
					totalPrice = modelMaterials
						.filter((item) => {
							return currentSelection.some((ele) => {
								return ele.material_id === item.id && ele.layer_id === item.layer_id;
							});
						})
						.reduce((p, c) => {
							return p + c.price;
						}, 0);
					setValue("price", totalPrice);
				} catch (err) {
					console.log("error occured while price set:", err);
					setValue("price", 0);
				}
			} else {
				const refineVariation = modelVariation?.filter((item) => item.id === currentVariationId);
				if (refineVariation.length > 0) {
					setValue("name", refineVariation[0]?.name);
					setValue("price", refineVariation[0]?.price);
				}
			}
		}
	};
	const formSubmit = async (formData) => {
		setIsLoading(true);
		if (variationMode.action === "Add") {
			formData.variation = JSON.stringify(currentSelection);
			let refineFormData = Utils.getFormData(formData);
			refineFormData.append("thumbnail", variationThumbnail, "variationThumbnail.png");
			await ModelAPI.createVariation(modelData.id, refineFormData)
				.then(({ data }) => {
					setModelVariation((prevState) => [
						...prevState,
						{
							id: data?.id,
							name: data?.name,
							price: data?.price,
							thumbnail: data?.thumbnail,
							details: data?.variation,
						},
					]);
					resetVariation();
					dispatch(
						showUpdatedToasterMessage({
							message: "Variation added successfully!",
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
		} else {
			formData.id = currentVariationId;
			formData.variation = JSON.stringify(currentSelection);
			let refineFormData = Utils.getFormData(formData);
			refineFormData.append("thumbnail", variationThumbnail, "variationThumbnail.png");
			await ModelAPI.updateVariation(refineFormData)
				.then(({ data }) => {
					setModelVariation(
						modelVariation.map((item) => {
							if (item.id === currentVariationId) {
								return { ...item, name: formData?.name, price: formData?.price,thumbnail:data?.thumbnail, details: currentSelection };
							}
							return item;
						})
					);
					resetVariation();
					dispatch(
						showUpdatedToasterMessage({
							message: "Variation update successfully!",
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
	const onConfirmAction = async () => {
		setConfirmModal((preveState) => ({ ...preveState, isLoading: true }));
		await deleteVariation();
		setConfirmModal((preveState) => ({ ...preveState, show: false, isLoading: false }));
	};
	const deleteVariation = async () => {
		await ModelAPI.removeVariation(currentVariationId)
			.then(({ data }) => {
				setModelVariation(modelVariation.filter((item) => item.id !== currentVariationId));
				resetVariation();

				dispatch(
					showUpdatedToasterMessage({
						message: "Variation deleted successfully.",
						type: "success",
					})
				);
			})
			.catch((error) => {
				dispatch(
					showUpdatedToasterMessage({
						message: typeof error?.errorMessage === "string" ? error.errorMessage : "Error occured!",
						type: "danger",
					})
				);
			});
	};
	const renderVariationForm = () => {
		return (
			<Form autoComplete="off">
				<Form.Group as={Col} className="mb-3">
					<Form.Label className="required">Variation Name</Form.Label>
					<Form.Control
						type="text"
						className={`${variationError.name && "is-invalid"}`}
						placeholder="Enter Variation Name"
						{...register("name")}
					/>
					{variationError.name && (
						<Form.Text className="invalid-feedback">{variationError.name.message}</Form.Text>
					)}
				</Form.Group>
				<Form.Group as={Col} controlId="price" className="mb-3">
					<Form.Label className="required">Price</Form.Label>
					<Form.Control
						type="number"
						className={`${variationError.price && "is-invalid"}`}
						placeholder="Enter Price"
						{...register("price")}
					/>
					{variationError.price && (
						<Form.Text className="invalid-feedback">{variationError.price.message}</Form.Text>
					)}
				</Form.Group>
			</Form>
		);
	};
	const renderConfigDefault = () => {
		return (
			<Container className="h-100">
				{" "}
				<Row className={`${!pickedMeshId && "h-100 justify-content-center align-items-center"}`}>
					<Col className="col-auto text-muted text-center">
						<p className="mb-1">
							<IconHandClick stroke={1.2} />
						</p>
						<p>Please select object</p>
					</Col>
				</Row>
			</Container>
		);
	};
	
	return (
		<CustomModal
			show={variationModal.show}
			isLoading={isLoading}
			onHide={handleCloseModal}
			modalHeading={"Variations"}
			size="lg"
			hadBodyPadding={variationModal.id}
			fullscreen={variationModal.id}
			scrollable={variationModal.id}
			hasActions={!variationModal.id}
			saveBtnText={"Save Changes"}
			onSaveCallback={() => {
				console.log("Save Data.");
			}}
		>
			<Container fluid className="h-100">
				<Row className="h-100">
					<Col size="md" className="border-end h-100 overflow-y-hidden">
						<Row className="h-100 justify-content-center">
							{currentVariationId !== null && (
								<Col className="text-end ">
									<Button
										variant="danger"
										className="btn-icon position-absolute"
										style={{ marginTop: "5px", marginLeft: "-32px" }}
										onClick={() => {
											setConfirmModal((preveState) => ({
												...preveState,
												show: true,
											}));
										}}
									>
										<IconTrash size={16} />
									</Button>
								</Col>
							)}
							{/* <Col md="12" className="border-bottom" style={{ height: "calc(100% - 68px)" }}> */}
							<Col md="12" className="border-bottom h-100 px-0">
								{modelData && modelData.model_file && (
									// <LoadModel />
									<Viewer
										modelFile={modelData.model_file}
										pickedMeshId={pickedMeshId}
										setPickedMeshId={setPickedMeshId}
										modelMaterials={modelMaterials}
										currentSelection={currentSelection}
										setModelLayers={setModelLayers}
										setVariationThumbnail={setVariationThumbnail}
									/>
								)}
							</Col>
							<Row style={{ marginTop: "-120px" }}>
								<Col bsPrefix="col-auto mx-auto">
									{modelVariation && modelVariation.length > 0 && renderVariation(modelVariation)}
								</Col>
							</Row>
						</Row>
					</Col>
					<Col md={3} className="p-0 mh-100 overflow-y-auto">
						<Card className="h-100 border-0">
							{variationMode.step === 2 && (
								<Card.Header className="px-2 bg-light">
									<div className="card-actions btn-actions ms-0 ps-0  me-1">
										<button
											className="btn-action"
											onClick={() => {
												setVariationMode((preveState) => ({ ...preveState, step: 1 }));
											}}
										>
											<IconChevronLeft size={30} />{" "}
										</button>
									</div>
									<Card.Title as="h3">Save Option</Card.Title>
								</Card.Header>
							)}
							<Card.Body className="mh-100 p-3 overflow-y-auto">
								{variationMode.step === 1 ? (
									pickedMeshId ? (
										<Row className="g-2 mb-2">{renderLayerMaterials(modelLayers)}</Row>
									) : (
										renderConfigDefault()
									)
								) : (
									renderVariationForm()
								)}
							</Card.Body>
							<Card.Footer
								className={`justify-content-start bg-gold-lt ${currentSelection.length === 0 && "d-none"}`}
							>
								<Button
									type="submit"
									onClick={variationMode.step === 1 ? handleStep1Submit : handleSubmit(formSubmit)}
								>
									{variationMode.step === 1 ? variationMode.btnTextStep1 : variationMode.btnTextStep2}
								</Button>
								{variationMode.action != "Add" && (
									<Button variant="default" className="ms-3" onClick={resetVariation}>
										Cancel
									</Button>
								)}
								<Button variant="default" className="ms-3" onClick={handleCloseModal}>
									Close
								</Button>
							</Card.Footer>
						</Card>
					</Col>
				</Row>
			</Container>
			{confirmModal.show && (
				<ConfirmModal
					{...confirmModal}
					onActionCallback={onConfirmAction}
					onHide={() => {
						setConfirmModal((preveState) => ({
							...preveState,
							show: false,
						}));
					}}
				/>
			)}
		</CustomModal>
	);
};
export default AddEditModelVariations;
