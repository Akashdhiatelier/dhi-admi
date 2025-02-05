import React, { Fragment, useState } from "react";
import { Col, Form, Row, Accordion, Container, OverlayTrigger, Tooltip } from "react-bootstrap";
import _, { filter } from "lodash";
import Utils from "../../components/Utils";
const ProjectConfig = ({ models, pickedMeshId, defaultModels, setDefaultModels, availableModels, setAvailableModels }) => {
	const [tabKey, setTabKey] = useState("0");
	const [defaultFilterList, setDefaultFilterList] = useState(models);
	const [availbleFilterList, setAvailableFilterList] = useState(models);
	const [allowChange, setAllowChange] = useState(
		availableModels.filter((obj) => obj.object_id === pickedMeshId).length > 0 ? true : false
	);
	const [allowMove, setAllowMove] = useState(
		availableModels.filter((obj) => obj.object_id === pickedMeshId && obj.allow_move === true).length > 0 ? true : false
	);
	const handleAllowChange = (event) => {
		setAllowChange(event.target.checked);
		if (!event.target.checked) {
			setAvailableModels([]);
		}
	};
	const handleAllowMove = (event) => {
		setAllowMove(event.target.checked);
        // setAvailableModels(availableModels.map((item) => ({ ...item, allow_move: event.target.checked })));
		const refineModels = availableModels.reduce((prev,curr)=>{
			if(curr.object_id === pickedMeshId){
				prev.push({ ...curr, allow_move: event.target.checked });
			}
			else{
				prev.push(curr);
			}
			return prev;
		},[]);
		setAvailableModels(refineModels);
        // console.log("handleAllowMove",availableModels.map((item) => ({ ...item, allow_move: event.target.checked })));
	};
	const searchDefaultModel = (event) => {
		const keyword = event.target.value.toLowerCase();
		const newArr = models.filter((item) => item.name.toLowerCase().includes(keyword)) || [];
		setDefaultFilterList(newArr);
	};
	const searchAvailbelModel = (event) => {
		const keyword = event.target.value.toLowerCase();
		const newArr = models.filter((item) => item.name.toLowerCase().includes(keyword)) || [];
		setAvailableFilterList(newArr);
	};
	const handleUpdateModel = (event) => {
		const modelId = parseInt(event.target.value);
		if (event.target.checked) {
			const filtered = defaultModels.filter((obj) => obj.object_id !== pickedMeshId);
			setDefaultModels([
				...filtered,
				{
					model_id: modelId,
					object_id: pickedMeshId,
					allow_change: false,
					allow_move: false,
				},
			]);
		} else {
			setDefaultModels([]);
		}
	};
	const handleUpdateAvailableModel = (event) => {
		const modelId = parseInt(event.target.value);
		if (event.target.checked) {
			setAvailableModels((prevState) => [
				...prevState,
				{
					model_id: modelId,
					object_id: pickedMeshId,
					allow_change: true,
					allow_move: allowMove,
				},
			]);
		} else {
			const filterMaterial = _.reject(availableModels, {
				model_id: modelId,
				object_id: pickedMeshId,
				allow_change: true,
				allow_move: allowMove,
			});
			setAvailableModels(filterMaterial);
		}
	};
    const getDefaultSelectedModel = (data) => {
		return data.map((item, i) => {
			const filtered = defaultModels.filter((obj) => obj.model_id == item.id && obj.object_id === pickedMeshId);
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
	const renderDefaultSelectedModel = (data) => {
		return defaultModels
			.map((row, i) => {
				const filteredItem = data.filter((item) => item.id == row.model_id && row.object_id === pickedMeshId);
				if (filteredItem.length === 0) {
					return null;
				}
				const item = filteredItem[0];
				return (
					<Col bsPrefix="col-auto" key={i}>
						<OverlayTrigger overlay={<Tooltip id="button-tooltip-2">{item.name}</Tooltip>}>
							<label className="form-imagecheck w-100 mb-1">
								<input
									name="model_check"
									type="checkbox"
									defaultValue={item.id}
									className="form-imagecheck-input"
									onChange={handleUpdateModel}
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
						</OverlayTrigger>
					</Col>
				);
			})
			.reverse();
	};
	const renderModel = (data) => {
		return data.map((item, i) => {
			const filtered = defaultModels.filter((obj) => obj.model_id == item.id && obj.object_id === pickedMeshId);
			if (filtered.length > 0) {
				return "";
			}
			return (
				<Col bsPrefix="col-4" key={i}>
					<label className="form-imagecheck w-100 mb-1">
						<input
							name="model_check"
							type="radio"
							defaultValue={item.id}
							className="form-imagecheck-input"
							onChange={handleUpdateModel}
							// checked={filtered.length > 0 ? true : false}
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
	const getAvailableModel = (data) => {
		return availableModels
			.map((row, i) => {
				const filteredItem = data.filter((item) => item.id == row.model_id && row.object_id === pickedMeshId);
				if (filteredItem.length === 0) {
					return null;
				}
				const item = filteredItem[0];
				return (
					<Col bsPrefix="col-auto" key={i}>
						<OverlayTrigger overlay={<Tooltip>{item.name}</Tooltip>}>
							<label className="form-imagecheck w-100 mb-1">
								<input
									name="material_check"
									type="checkbox"
									defaultValue={item.id}
									className="form-imagecheck-input"
									onChange={handleUpdateAvailableModel}
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
						</OverlayTrigger>
					</Col>
				);
			})
			.reverse();
	};
	const renderAvailableModel = (data) => {
		return data.map((item, i) => {
			const filtered = availableModels.filter((obj) => obj.model_id == item.id && obj.object_id === pickedMeshId);
			if (filtered.length > 0) {
				return null;
			}
			return (
				<Col bsPrefix="col-4" key={i}>
					<label className="form-imagecheck w-100">
						<input
							name="model_check"
							type="checkbox"
							defaultValue={item.id}
							className="form-imagecheck-input"
							onChange={handleUpdateAvailableModel}
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
						<div className={`w-100 ${!tabKey ? "d-flex" : ""}`}>
							Model
							{!tabKey && getDefaultSelectedModel(models)}
						</div>
					</Accordion.Header>
					<Accordion.Body className="pt-0">
						<Row className="g-2 mb-2 d-flex flex-nowrap overflow-x-auto">
							{defaultModels && defaultModels.length > 0 && renderDefaultSelectedModel(models)}
						</Row>
						<Form.Group className="mb-3" controlId="search">
							<Form.Control type="text" placeholder="search" autoComplete="off" onKeyUp={searchDefaultModel} />
						</Form.Group>
						<Row className="g-2 overflow-y-auto" style={{ maxHeight: "240px" }}>
							{defaultFilterList && defaultFilterList.length === 0 && (
								<p className="text-center text-muted">No matching model found.</p>
							)}
							{renderModel(defaultFilterList)}
						</Row>
					</Accordion.Body>
				</Accordion.Item>
			</Accordion>
			<Row className="mx-0" style={{ padding: "1rem 1.25rem" }}>
				<Form.Group as={Col} controlId="allowChange">
					<Form.Check
						type="checkbox"
						label="Allow Change"
						className="mb-0"
						defaultChecked={allowChange}
						onChange={handleAllowChange}
					/>
				</Form.Group>
				<Form.Group as={Col} controlId="allowMove">
					<Form.Check
						type="checkbox"
						label="Allow Move"
						className="mb-0"
						defaultChecked={allowMove}
						onChange={handleAllowMove}
					/>
				</Form.Group>
			</Row>
			{allowChange && (
				<Container fluid style={{ paddingLeft: "1.25rem", paddingRight: "1.25rem" }}>
					{availableModels && availableModels.length > 0 && (
						<Row className="g-2 mb-2 d-flex flex-nowrap overflow-x-auto">{getAvailableModel(models)}</Row>
					)}
					<Form.Group className="mb-3" controlId="search">
						<Form.Control type="text" placeholder="search" autoComplete="off" onKeyUp={searchAvailbelModel} />
					</Form.Group>
					<Row className="g-2 overflow-y-auto" style={{ maxHeight: "50%" }}>
						{availbleFilterList && availbleFilterList.length === 0 && (
							<p className="text-center text-muted">No matching model found.</p>
						)}
						{renderAvailableModel(availbleFilterList)}
					</Row>
				</Container>
			)}
		</Fragment>
	);
};
export default ProjectConfig;
