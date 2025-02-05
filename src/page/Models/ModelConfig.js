import React, { Fragment, useState } from "react";
import { Col, Form, Row, Accordion, Container, OverlayTrigger, Tooltip } from "react-bootstrap";
import _, { filter } from "lodash";
import Utils from "../../components/Utils";
const ModelConfig = ({
	materials,
	defaultMaterials,
	setDefaultMaterials,
	selectedMaterialsAllowChange,
	setSelectedMaterialsAllowChange,
	pickedMeshId,
}) => {
	const [defaultFilterList, setDefaultFilterList] = useState(materials);
	const [allowChangeFilterList, setAllowChangeFilterList] = useState(materials);
	const [allowChange, setAllowChange] = useState(
		selectedMaterialsAllowChange.filter((obj) => obj.layer_id === pickedMeshId).length > 0 ? true : false
	);
	const [tabKey, setTabKey] = useState(
		selectedMaterialsAllowChange.filter((obj) => obj.layer_id === pickedMeshId).length > 0 ? null : "0"
	);
	const handleAllowChange = (event) => {
		setAllowChange(event.target.checked);
		if (!event.target.checked) {
			setSelectedMaterialsAllowChange([]);
		}
	};
	const handleUpdateMaterialAllowChange = (event) => {
		const materialId = parseInt(event.target.value);
		if (event.target.checked) {
			setSelectedMaterialsAllowChange((prevState) => [
				...prevState,
				{
					material_id: materialId,
					layer_id: pickedMeshId,
					allow_change: true,
				},
			]);
		} else {
			const filterMaterial = _.reject(selectedMaterialsAllowChange, {
				material_id: materialId,
				layer_id: pickedMeshId,
				allow_change: true,
			});
			setSelectedMaterialsAllowChange(filterMaterial);
		}
	};
	const handleUpdateMaterial = (event) => {
		const materialId = parseInt(event.target.value);
		if (event.target.checked) {
			const filtered = defaultMaterials.filter((obj) => obj.layer_id !== pickedMeshId);
			setDefaultMaterials([
				...filtered,
				{
					material_id: materialId,
					layer_id: pickedMeshId,
					allow_change: false,
				},
			]);
		} else {
			
			setDefaultMaterials([]);
		}
	};
	const searchDefaultMaterial = (event) => {
		const keyword = event.target.value.toLowerCase();
		const newArr = materials.filter((item) => item.name.toLowerCase().includes(keyword)) || [];
		setDefaultFilterList(newArr);
	};
	const searchAllowChangeMaterial = (event) => {
		const keyword = event.target.value.toLowerCase();
		const newArr = materials.filter((item) => item.name.toLowerCase().includes(keyword)) || [];
		setAllowChangeFilterList(newArr);
	};
	const getMaterialAllowChange = (data) => {
		return selectedMaterialsAllowChange
			.map((row, i) => {
				const filteredItem = data.filter((item) => item.id == row.material_id && row.layer_id === pickedMeshId);
				if (filteredItem.length === 0) {
					return null;
				}
				const item = filteredItem[0];
				return (
					<Col bsPrefix="col-auto" key={i}>
						<OverlayTrigger overlay={<Tooltip id="button-tooltip-2">{item.name}</Tooltip>}>
							<label className="form-imagecheck w-100 mb-1">
								<input
									name="material_check"
									type="checkbox"
									defaultValue={item.id}
									className="form-imagecheck-input"
									onChange={handleUpdateMaterialAllowChange}
									checked={true}
								/>
								<span className="form-imagecheck-figure w-100">
									<span
										className={`avatar bg-primary-lt he`}
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
							{/* <div className="text-truncate mb-1" title={item.name}>
						{item.name}
					</div> */}
						</OverlayTrigger>
					</Col>
				);
			})
			.reverse();
	};
	const renderMaterialAllowChange = (data, selected, type = "checkbox") => {
		return data.map((item, i) => {
			const filtered = selectedMaterialsAllowChange.filter(
				(obj) => obj.material_id == item.id && obj.layer_id === pickedMeshId
			);
			if (selected) {
				if (filtered.length === 0) {
					return null;
				}
			} else {
				if (filtered.length > 0) {
					return null;
				}
			}
			return (
				<Col bsPrefix="col-4" key={i}>
					<label className="form-imagecheck w-100">
						<input
							name="material_check"
							type={type}
							defaultValue={item.id}
							className="form-imagecheck-input"
							onChange={handleUpdateMaterialAllowChange}
							checked={filtered.length > 0 ? true : false}
						/>
						<span className="form-imagecheck-figure w-100">
							<span
								className={`avatar avatar-lg bg-primary-lt w-100 form-imagecheck-image`}
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
	const getDefaultSelectedMaterial = (data) => {
		return data.map((item, i) => {
			const filtered = defaultMaterials.filter((obj) => obj.material_id == item.id && obj.layer_id === pickedMeshId);
			if (filtered.length > 0) {
				return (
					<OverlayTrigger key={i} overlay={<Tooltip id="button-tooltip-2">{item.name}</Tooltip>}>
						<div className="d-flex ms-auto align-items-center fw-bold text-muted ms-auto">
							<span
								className={`avatar avatar-xs bg-primary-lt border border-primary`}
								style={{
									backgroundImage: item?.thumbnail
										? `url('${process.env.REACT_APP_UPLOAD_BASE_URL + item.thumbnail}')`
										: "none",
								}}
							>
								{!item?.thumbnail && Utils.getAcronym(item.name)}
							</span>
							{/* <img className="avatar w-3 h-3" src={`${process.env.REACT_APP_UPLOAD_BASE_URL + item.thumbnail}`} alt={item.name} /> */}
							{/* <span className="ms-1">{item.name}</span> */}
						</div>
					</OverlayTrigger>
				);
			}
			return "";
		});
	};
	const renderDefaultSelectedMaterial = (data) => {
		return defaultMaterials
			.map((row, i) => {
				const filteredItem = data.filter((item) => item.id == row.material_id && row.layer_id === pickedMeshId);
				if (filteredItem.length === 0) {
					return null;
				}
				const item = filteredItem[0];
				return (
					<Col bsPrefix="col-auto" key={i}>
						<OverlayTrigger overlay={<Tooltip id="button-tooltip-2">{item.name}</Tooltip>}>
							<label className="form-imagecheck w-100 mb-1">
								<input
									name="material_check"
									type="checkbox"
									defaultValue={item.id}
									className="form-imagecheck-input"
									onChange={handleUpdateMaterial}
									checked={true}
								/>
								<span className="form-imagecheck-figure w-100">
									<span
										className={`avatar bg-primary-lt he`}
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
							{/* <div className="text-truncate mb-1" title={item.name}>
						{item.name}
					</div> */}
						</OverlayTrigger>
					</Col>
				);
			})
			.reverse();
	};
	const renderMaterial = (data, selected, type = "radio") => {
		return data.map((item, i) => {
			const filtered = defaultMaterials.filter((obj) => obj.material_id == item.id && obj.layer_id === pickedMeshId);
			if (selected) {
				if (filtered.length === 0) {
					return "";
				}
			} else {
				if (filtered.length > 0) {
					return "";
				}
			}
			return (
				<Col bsPrefix="col-4" key={i}>
					<label className="form-imagecheck w-100 mb-1">
						<input
							name="material_check"
							type={type}
							defaultValue={item.id}
							className="form-imagecheck-input"
							onChange={handleUpdateMaterial}
							checked={filtered.length > 0 ? true : false}
						/>
						<span className="form-imagecheck-figure w-100">
							<span
								className={`avatar avatar-lg bg-primary-lt w-100 he -form-imagecheck-image`}
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
	return (
		<Fragment>
			<Accordion onSelect={(e) => setTabKey(e)} defaultActiveKey={tabKey} flush>
				<Accordion.Item eventKey={"0"} className="border-bottom">
					<Accordion.Header>
						<div className={`w-100 ${!tabKey ? "d-flex":""}`}>Material
						{!tabKey && getDefaultSelectedMaterial(materials)}
                        </div>
					</Accordion.Header>
					<Accordion.Body className="pt-0">
						<Row className="g-2 mb-2 d-flex flex-nowrap overflow-x-auto">
						{defaultMaterials && defaultMaterials.length > 0 && renderDefaultSelectedMaterial(materials)}
						</Row>
						<Form.Group className="mb-3" controlId="search">
							<Form.Control
								type="text"
								placeholder="search"
								autoComplete="off"
								onKeyUp={searchDefaultMaterial}
							/>
						</Form.Group>
						<Row className="g-2 overflow-y-auto" style={{ maxHeight: "240px" }}>
							{defaultFilterList && defaultFilterList.length === 0 && (
								<p className="text-center text-muted">No matching material found.</p>
							)}
							{renderMaterial(defaultFilterList, false, "radio")}
						</Row>
					</Accordion.Body>
				</Accordion.Item>
			</Accordion>
			<div className="d-block" style={{ padding: "1rem 1.25rem" }}>
				<Form.Group controlId="allowChange">
					<Form.Check
						type="checkbox"
						label="Allow Change"
						className="mb-0"
						defaultChecked={allowChange}
						onChange={handleAllowChange}
					/>
				</Form.Group>
			</div>
			{allowChange && (
				<Container fluid style={{ paddingLeft: "1.25rem", paddingRight: "1.25rem" }}>
					{selectedMaterialsAllowChange && selectedMaterialsAllowChange.length > 0 && (
						<Row className="g-2 mb-2 d-flex flex-nowrap overflow-x-auto">
							{getMaterialAllowChange(materials)}
						</Row>
					)}
					<Form.Group className="mb-3" controlId="search">
						<Form.Control
							type="text"
							placeholder="search"
							autoComplete="off"
							onKeyUp={searchAllowChangeMaterial}
						/>
					</Form.Group>
					<Row className="g-2 overflow-y-auto" style={{ maxHeight: "50%" }}>
						{allowChangeFilterList && allowChangeFilterList.length === 0 && (
							<p className="text-center text-muted">No matching material found.</p>
						)}
						{renderMaterialAllowChange(allowChangeFilterList, false)}
					</Row>
				</Container>
			)}
		</Fragment>
	);
};
export default ModelConfig;
