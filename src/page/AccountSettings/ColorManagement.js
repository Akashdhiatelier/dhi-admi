import React, { Fragment, useEffect, useState } from "react";
import { Button, Card, Col, Form, Row, Spinner, Table } from "react-bootstrap";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import * as ColorAPI from "../../api/ColorAPI";
import { showUpdatedToasterMessage } from "../../store/slices/toaster/toasterslice";
import { DEFAULT_CONFIRM_MODAL } from "../../common/constants";
import ConfirmModal from "../../components/CustomModal/ConfirmModal";

const ColorManagement = () => {
	const dispatch = useDispatch();
	const [isLoading, setIsLoading] = useState(false);
	const [action, setAction] = useState("Add");
	const [colorsList, setColorsList] = useState([]);
	const [selectedRow, setSelectedRow] = useState([]);
	const [confirmModal, setConfirmModal] = useState(DEFAULT_CONFIRM_MODAL);

	const fetchColors = async () => {
		await ColorAPI.getAll()
			.then(({ data }) => {
				if (data) {
					setColorsList(data);
				}
			})
			.catch((error) => {
				dispatch(
					showUpdatedToasterMessage({
						message: error?.errorMessage,
						type: "danger",
					})
				);
			});
	};
	useEffect(() => {
		fetchColors();
	}, []);
	let defaultValues = {
		name: "",
		color: "#2A6A73",
	};
	const formSchema = yup.object().shape({
		color: yup.string().trim().required("Color is required!"),
		name: yup.string().trim().required("Name is required!"),
	});
	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors: formError },
		reset,
		setError,
		setFocus,
	} = useForm({
		mode: "onBlur",
		resolver: yupResolver(formSchema),
		defaultValues: defaultValues,
	});
	const resetAction = () => {
		reset(defaultValues);
		setAction("Add");
		setSelectedRow([]);
	};
	const handleEdit = (row) => {
		setSelectedRow(row);
		setAction("Update");
		setValue("color", row.color);
		setValue("name", row.name);
		window.scrollTo(0, 0);
	};
	const onConfirmAction = async () => {
		setConfirmModal((preveState) => ({ ...preveState, isLoading: true }));
		await ColorAPI.remove(selectedRow.id);
		setConfirmModal(DEFAULT_CONFIRM_MODAL);
		fetchColors();
	};
	const onSubmit = async (formData) => {
		setIsLoading(true);
		if (action == "Add") {
			await ColorAPI.create(formData)
				.then(({ data }) => {
					fetchColors();
					reset(defaultValues);
					dispatch(
						showUpdatedToasterMessage({
							message: "Color add successfully.",
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
			await ColorAPI.update(selectedRow?.id, formData)
				.then(({ data }) => {
					resetAction();
					dispatch(
						showUpdatedToasterMessage({
							message: "Color update successfully.",
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
		}
		fetchColors();
		setIsLoading(false);
	};
	return (
		<Fragment>
			<Card.Header className="h2 text-primary">Color Management</Card.Header>
			<Card.Body>
				<Form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
					<Row className="row-cards">
						<Form.Group as={Col} md="auto" className="mb-3">
							<Form.Control
								type="color"
								className={`${formError.color && "is-invalid"}`}
								{...register("color")}
							/>
							{formError.color && (
								<Form.Text className="invalid-feedback">{formError.color.message}</Form.Text>
							)}
						</Form.Group>
						<Form.Group as={Col} md="3" className="mb-3">
							<Form.Control
								type="text"
								className={`${formError.name && "is-invalid"}`}
								placeholder="Enter Name"
								{...register("name")}
							/>
							{formError.name && <Form.Text className="invalid-feedback">{formError.name.message}</Form.Text>}
						</Form.Group>
						<Form.Group as={Col} md="3" className="mb-3">
							<Button type="submit" disabled={isLoading}>
								{isLoading && <Spinner animation="border" size="sm" className="me-2" />}
								{action}
							</Button>
							{selectedRow && action === "Update" && (
								<Button variant="default" className="ms-3" onClick={resetAction}>
									Cancel
								</Button>
							)}
						</Form.Group>
					</Row>
				</Form>
				<Row className="g-0">
					<Card className="col-md-7">
						<Table responsive className="table-vcenter">
							<thead>
								<tr>
									<th width="10">#</th>
									<th>Color</th>
									<th>Name</th>
									<th width="100" className="text-center">
										Action
									</th>
								</tr>
							</thead>
							<tbody>
								{colorsList && colorsList.length === 0 ? (
									<tr>
										<td colSpan={4} className="text-center text-muted">
											No record available.
										</td>
									</tr>
								) : (
									colorsList.map((item, i) => {
										return (
											<tr key={i}>
												<td>{i + 1}</td>
												<td sm="3" className="py-1">
													<div className="d-flex align-items-center">
														<span
															className="avatar avatar-xs border me-1"
															style={{ background: item.color }}
														/>
														<span>{item.color}</span>
													</div>
												</td>
												<td sm="3">{item.name}</td>
												<td className="text-center">
													<Button
														size="sm"
														variant="outline-primary"
														className="btn-icon me-2"
														onClick={() => {
															handleEdit(item);
														}}
													>
														<IconPencil size={16} stroke={1.7} />
													</Button>
													<Button
														size="sm"
														variant="outline-danger"
														className="btn-icon ms-1"
														onClick={() => {
															setSelectedRow(item);
															setConfirmModal((preveState) => ({
																...preveState,
																show: true,
															}));
														}}
													>
														<IconTrash size={16} stroke={1.7} />
													</Button>
												</td>
											</tr>
										);
									})
								)}
							</tbody>
						</Table>
					</Card>
				</Row>
			</Card.Body>
			{confirmModal.show && (
				<ConfirmModal
					{...confirmModal}
					onActionCallback={onConfirmAction}
					onHide={() => {
						setConfirmModal(DEFAULT_CONFIRM_MODAL);
					}}
				/>
			)}
		</Fragment>
	);
};
export default ColorManagement;
