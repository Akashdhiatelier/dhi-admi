import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Col, Form, Row, Card } from "react-bootstrap";
import { IconPencil, IconPhotoPlus } from "@tabler/icons-react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Utils from "../../components/Utils";
import { showUpdatedToasterMessage } from "../../store/slices/toaster/toasterslice";
import CustomModal from "../../components/CustomModal/CustomModal";
import * as RoleAPI from "../../api/RoleAPI";
import { ROLE_TYPES_TRUE, ROLE_TYPES } from "../../common/constants";
const AddEditRoleAndPermission = ({ roleModal, resetRoleModal }) => {
	const dispatch = useDispatch();
	const [isLoading, setIsLoading] = useState(false);
	const [roleModules, setRoleModules] = useState([]);
	const fetchRoleModules = async () => {
		await RoleAPI.getAllRoleModule().then((data) => {
			if (data) {
				// let refineRoleModule = data?.data.map((item)=>({module_id:item.id,module:{name:item.name},...ROLE_TYPES}));
				const refineRoleModule = data.data.reduce((prev, curr) => {
					const defaultRoleType = curr.name === "My Profile" || curr.name === "Settings" ? ROLE_TYPES_TRUE : ROLE_TYPES;
					prev.push({ module_id: curr.id, module: { name: curr.name }, ...defaultRoleType });
					return prev;
				}, []);
				setRoleModules(refineRoleModule);
				setValue("permissions", refineRoleModule);
			}
		});
	};
	const fetchEditRole = async () => {
		setIsLoading(true);
		await RoleAPI.getOne(roleModal.id).then(({ data }) => {
			if (data) {
				const refinePermission = data.permissoins.map((item,i)=>{
					const matched = roleModules.find((module)=>module.module_id===item.module_id)
					if(matched){
						return {name:matched.name,...item}
					}
					return item;
				});
				setValue("name", data.name);
				setValue("status", data.status);
				setValue("permissions", data.permissoins);
				if (data.permissions?.length > 0) {
					data.permissions.forEach((item, index) => {
						setValue(`permissions[${index}.read]`, item.read);
						setValue(`permissions[${index}.write]`, item.write);
						setValue(`permissions[${index}.update]`, item.update);
						setValue(`permissions[${index}.delete]`, item.delete);
					});
				}
			}
		});
		setIsLoading(false);
	};
	useEffect(() => {
		fetchRoleModules();
	}, []);
	useEffect(() => {
		if (roleModal.id) {
			fetchEditRole();
		}
	}, [roleModules]);
	let defaultUserValue = {
		name: "",
		status: "Active",
		permissions: roleModules,
	};

	const roleSchema = yup.object().shape({
		name: yup.string().trim().required("Please enter role"),
		status: yup.string().trim().required("Please select status"),
	});

	const {
		register,
		handleSubmit,
		getValues,
		setValue,
		formState: { errors: userError },
		reset,
		setError,
		setFocus,
	} = useForm({
		mode: "onBlur",
		resolver: yupResolver(roleSchema),
		defaultValues: defaultUserValue,
	});
	const formSubmit = async (formData) => {
		setIsLoading(true);
		if (roleModal.action === "Edit") {
			await RoleAPI.update(roleModal.id, formData)
				.then(({ data }) => {
					resetRoleModal(true);
					dispatch(
						showUpdatedToasterMessage({
							message: "Role update successfully.",
							type: "success",
						})
					);
				})
				.catch((error) => {
					if(error?.code===409){
						setError("name", {
							type: "custom",
							message: error?.errorMessage,
						});
						setFocus("name");
					}
					else {
						dispatch(
							showUpdatedToasterMessage({
								message: error?.errorMessage,
								type: "danger",
							})
						);
					}
				});
		} else {
			await RoleAPI.create(formData)
				.then(({ data }) => {
					resetRoleModal(true);
					dispatch(
						showUpdatedToasterMessage({
							message: "Role add successfully.",
							type: "success",
						})
					);
				})
				.catch((error) => {
					if(error?.code===409){
						setError("name", {
							type: "custom",
							message: error?.errorMessage,
						});
						setFocus("name");
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
	return (
		<CustomModal
			show={roleModal.show}
			isLoading={isLoading}
			onHide={resetRoleModal}
			modalHeading={roleModal.title}
			size="lg"
			saveBtnText={roleModal.saveBtnText}
			onSaveCallback={handleSubmit(formSubmit)}
		>
			<Form autoComplete="off">
				<Card fluid="true" className="px-0">
					<Card.Body className="row-cards mb-3">
						<Row>
							<Form.Group as={Col} size="md" controlId="role">
								<Form.Label className="required">Role</Form.Label>
								<Form.Control
									type="text"
									className={`${userError.name && "is-invalid"}`}
									placeholder="Enter Role"
									{...register("name")}
								/>
								{userError.name && (
									<Form.Text className="invalid-feedback">{userError.name.message}</Form.Text>
								)}
							</Form.Group>

							<Form.Group as={Col} size="md">
								<Form.Label className="required">Status</Form.Label>
								<Form.Select
									aria-label="Status"
									className={`${userError.status && "is-invalid"}`}
									{...register("status")}
								>
									<option value="">Select</option>
									<option value="Active">Active</option>
									<option value="Inactive">Inactive</option>
									<option value="Pending">Pending</option>
								</Form.Select>
								{userError.status && (
									<Form.Text className="invalid-feedback">{userError.status.message}</Form.Text>
								)}
							</Form.Group>
						</Row>
					</Card.Body>
					<Card.Body className="bg-primary-lt p-3">
						<Row>
							<div className="col-md-4">Module</div>
							<div className="col-md-2">Read</div>
							<div className="col-md-2">Write</div>
							<div className="col-md-2">Update</div>
							<div className="col-md-2">Delete</div>
						</Row>
					</Card.Body>
					{getValues("permissions")?.map((item, index) => {
						return (
							<Card.Body key={index}>
								<Row>
									<div className="col-md-4">{item?.module?.name}</div>
									<Form.Group className="col-md-2">
										<Form.Check required name="read" {...register(`permissions[${index}].read`)} />
									</Form.Group>
									<Form.Group className="col-md-2">
										<Form.Check required name="write" {...register(`permissions[${index}].write`)} />
									</Form.Group>
									<Form.Group className="col-md-2">
										<Form.Check required name="update" {...register(`permissions[${index}].update`)} />
									</Form.Group>
									<Form.Group className="col-md-2">
										<Form.Check required name="delete" {...register(`permissions[${index}].delete`)} />
									</Form.Group>
								</Row>
							</Card.Body>
						);
					})}
				</Card>
			</Form>
		</CustomModal>
	);
};
export default AddEditRoleAndPermission;
