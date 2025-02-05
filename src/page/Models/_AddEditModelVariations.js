import React, { lazy, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { IconTrash } from "@tabler/icons-react";
import { Accordion, Button, ButtonGroup, Card, Col, Container, ListGroup, Nav, Row } from "react-bootstrap";
import { showUpdatedToasterMessage } from "../../store/slices/toaster/toasterslice";
import * as ModelAPI from "../../api/ModelAPI";
import CustomModal from "../../components/CustomModal/CustomModal";
import { DEFAULT_CONFIRM_MODAL } from "../../common/constants";
import Utils from "../../components/Utils";
import { filter } from "lodash";
import ConfirmModal from "../../components/CustomModal/ConfirmModal";
const Viewer = lazy(() => import("./Viewer"));

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
	const [confirmModal, setConfirmModal] = useState({
		show: false,
		isLoading: false,
		title: "Are you sure?",
		description: "Do you really want to remove this variation? what you've done can't be undone.",
		actionBtnText: "Delete",
		action: "Delete",
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
	useEffect(() => {
		console.log("modelVariation:", modelVariation);
	}, [modelVariation]);
	const renderVariation = (modelVariation) => {
		return (
			<ButtonGroup aria-label="Basic example">
				{modelVariation.map((item, i) => {
					return (
						<Button
							key={i}
							variant="outline-primary"
							className={`${item?.id === currentVariationId && "active"}`}
							onClick={() => handleVariation(item.id)}
						>
							{item.name}
						</Button>
					);
				})}
			</ButtonGroup>
		);
	};
	const renderLayerMaterials = (currentLayerId) => {
		const filtered = modelMaterials.filter((item) => item.layer_id === currentLayerId);
		if (filtered && filtered.length === 0) {
			return (
				<Col className="text-center text-muted">
					<p>No material found.</p>
				</Col>
			);
		}
		return filtered.map((item, i) => {
			console.log("renderLayerMaterials :: currentSelection:",currentSelection);
			const filteredSelected = currentSelection.filter(
				(obj) => obj.material_id === item.id && obj.layer_id === currentLayerId
			);
			return (
				<Col bsPrefix="col-4" key={i}>
					<label className="form-imagecheck w-100 mb-1">
						<input
							name={`material_check_${currentLayerId}`}
							type={"radio"}
							defaultValue={item.id}
							className="form-imagecheck-input"
							onChange={(e) => handleUpdateMaterial(e, item.id, currentLayerId)}
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
			if (action === "Add") {
				setCurrentSelection([...filterMaterial, { material_id: materialId, layer_id: layerId }]);
			} else {
				const filterNotMaterial = currentSelection.filter((item) => item.layer_id == layerId);
				console.log("currentMAterial:", materialId, layerId);
				console.log("filterNotMaterial:", filterNotMaterial);
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
		setAction("Add");
		setCurrentVariationId(null);
		setCurrentSelection([]);
	};
	const handleVariation = (variationId) => {
		setAction("Update");
		setCurrentVariationId(variationId);
		const filteredCurrentVariation = modelVariation.filter((item) => item.id === variationId);
		setCurrentSelection(filteredCurrentVariation.length > 0 ? filteredCurrentVariation[0]?.details : []);
		console.log("currentSelection:", filteredCurrentVariation);
		// const refineVariation = modelVariation.reduce((p,c)=>{
		// 	if(c.id===variationId){
		// 		setCurrentVariation(c);
		// 		setAction("Update")
		// 		p.push({id:c.id,name:c.name,variation:c.variation});
		// 	}
		// 	else{
		// 		p.push({id:c.id,name:c.name,variation:c.variation});
		// 	}
		// 	return p;
		// },[]);
		// setModelVariation(refineVariation);
	};
	const handleSubmit = async () => {
		setIsLoading(true);
		if (action === "Add") {
			console.log("Add variation!", currentSelection);
			await ModelAPI.createVariation(modelData.id, { variation: currentSelection })
				.then(({ data }) => {
					console.log("createVariation Response:", data);
					setModelVariation((prevState) => [...prevState, {id:data?.id,name:data?.name,details:data?.variation}]);
					resetVariation();
					dispatch(
						showUpdatedToasterMessage({
							message: "Variation added successfully!",
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
		} else {
			const variationName = modelVariation.filter((item) => item.id == currentVariationId)[0]?.name;
			await ModelAPI.updateVariation({ id: currentVariationId, name: variationName, variation: currentSelection })
				.then(({ data }) => {
					setModelVariation(
						modelVariation.map((item) => {
							if (item.id === currentVariationId) {
								return { ...item, details: currentSelection };
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
					dispatch(
						showUpdatedToasterMessage({
							message: "Error occured!",
							type: "danger",
						})
					);
				});
		}
		setIsLoading(false);
	};
	const onConfirmAction = async () => {
		setConfirmModal((preveState) => ({ ...preveState, isLoading: true }));
		await deleteVariation();
		setConfirmModal((preveState) => ({ ...preveState, show:false,isLoading: false }));
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
							<Col md="12" className="border-bottom" style={{ height: "calc(100% - 68px)" }}>
								{modelData && modelData.model_file && (
									// <LoadModel />
									<Viewer
										modelFile={modelData.model_file}
										modelMaterials={modelMaterials}
										currentSelection={currentSelection}
										setModelLayers={setModelLayers}
									/>
								)}
							</Col>
							<Col bsPrefix="col-auto mx-auto" className="">
								{modelVariation && modelVariation.length > 0 ? (
									renderVariation(modelVariation)
								) : (
									<p className="text-muted mb-0">No variation added.</p>
								)}
							</Col>
							{currentVariationId !== null && (
								<Col bsPrefix="col-auto">
									<Button
										variant="danger"
										className="btn-icon mx-3"
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
						</Row>
					</Col>
					<Col md={3} className="p-0 mh-100 overflow-y-auto">
						<Card className="h-100 border-0">
							<Card.Header>
								<Card.Title as="h3">Materials</Card.Title>
							</Card.Header>
							<Card.Body className="mh-100 p-0 overflow-y-auto">
								{/* <Row className="g-2">{renderLayerMaterials(modelLayers)}</Row> */}
								<Accordion defaultActiveKey={0} flush>
									{modelLayers.map((item, i) => {
										return (
											<Accordion.Item eventKey={i} key={i}>
												<Accordion.Header><div className="w-100">{item}</div></Accordion.Header>
												<Accordion.Body>
													<Row className="g-2">{renderLayerMaterials(item)}</Row>
												</Accordion.Body>
											</Accordion.Item>
										);
									})}
								</Accordion>
							</Card.Body>
							<Card.Footer
								className={`justify-content-start bg-gold-lt ${currentSelection.length === 0 && "d-none"}`}
							>
								<Button type="submit" onClick={handleSubmit}>
									{action}
								</Button>
								{action != "Add" && (
									<Button variant="sucess" className="ms-3" onClick={resetVariation}>
										Cancel
									</Button>
								)}
								<Button variant="sucess" className="ms-3" onClick={handleCloseModal}>
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
