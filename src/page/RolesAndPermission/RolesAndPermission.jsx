import React, { useState, useEffect, useMemo, useCallback } from "react";
import { IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";
import { Button, Card, Col, Dropdown, Form, Row } from "react-bootstrap";
import * as yup from "yup";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import CheckAll from "../../components/DataTable/CheckAll";
import DataTable from "../../components/DataTable";
import * as RoleAPI from "../../api/RoleAPI";
import CustomModal from "../../components/CustomModal/CustomModal";
import ConfirmModal from "../../components/CustomModal/ConfirmModal";

import { PageBody, PageHeader, SiteWrapper } from "../../interface/SiteWrapper";
import { PAGE_LENGTH, DEFAULT_CONFIRM_MODAL } from "../../common/constants";
import { showUpdatedToasterMessage } from "../../store/slices/toaster/toasterslice";
import AddEditRoleAndPermission from "./AddEditRoleAndPermission";

const RolesAndPermission = ({ title, permission }) => {
	const dispatch = useDispatch();
	const [isLoading, setIsLoading] = useState(true);
	const [roles, setRoles] = useState([]);
	const [selectedRows, setSelectedRows] = useState([]);
	const [selectedRole, setSelectedRole] = useState();
	const [totalRecords, setTotalRecords] = useState(0);
	const [filter, setFilter] = useState({
		_page: 1,
		_limit: 10,
		role: "",
		status: "",
		q: "",
		_sort: "id",
		_order: "desc",
		id_ne: 1,
	});

	const [roleModal, setRoleModal] = useState({
		show: false,
		isLoading: false,
		title: "Add User",
		saveBtnText: "Add",
		action: "Add",
	});

	const initialState = {
		sortBy: [{ id: "id", desc: true }],
		pageSize: filter._limit,
		pageIndex: 0,
	};

	const [confirmModal, setConfirmModal] = useState(DEFAULT_CONFIRM_MODAL);

	const status = ["All", "Active", "Inactive", "Pending"];

	const fetchRoles = useCallback(async () => {
		setIsLoading(true);
		await RoleAPI.getAll(filter).then(({ data }) => {
			if (data) {
				setTotalRecords(data?.count);
				setRoles(data.data);
			}
		});
		setIsLoading(false);
	}, [filter]);

	const roleColumn = useMemo(
		() => [
			{ Header: "Role", accessor: "name", width: "auto" },
			{
				Header: "Status",
				accessor: "status",
				className: "text-center",
				// width: "100",
				Cell: ({ row }) => (
					<span
						className={`badge badge-outline ${row.values.status === "Active" ? "text-success" : "text-danger"}`}
					>
						{row.values.status}
					</span>
				),
			},
		],
		[]
	);

	const tableHooks = (hooks) => {
		hooks.visibleColumns.push((columns) => [
			{
				id: "id",
				disableSortBy: true,
				className: "w-1",
				Header: ({ getToggleAllPageRowsSelectedProps }) => (
					<div>
						<CheckAll {...getToggleAllPageRowsSelectedProps()} />
					</div>
				),
				Cell: ({ row }) => (
					<div>
						<CheckAll {...row.getToggleRowSelectedProps()} />
					</div>
				),
			},
			...columns,
			{
				Header: "Actions",
				accessor: "Actions",
				className: "text-center text-nowrap",
				width: "100",
				disableSortBy: true,
				Cell: ({ row }) => (
					<>
						{permission?.update && (
							<Button
								size="sm"
								variant="outline-primary"
								className="btn-icon me-2"
								onClick={() => {
									handleEdit(row.original.id);

									// RoleAPI.getOne(row.original.id).then((res) => {
									//   let user = res.data;
									//   setValue("role", user.role);
									//   setValue("status", user.status);
									//   setValue("permission", user.permission);
									//   if (user.permission?.length > 0) {
									//     user.permission.forEach((item, index) => {
									//       setValue(`permission[${index}.read]`, item.read);
									//       setValue(`permission[${index}.write]`, item.write);
									//       setValue(`permission[${index}.update]`, item.update);
									//       setValue(`permission[${index}.delete]`, item.delete);
									//     });
									//   }
									//   setTimeout(() => {
									//     setRoleModal((preveState) => ({
									//       ...preveState,
									//       isLoading: false,
									//     }));
									//   }, 100);
									// });
								}}
							>
								<IconPencil size={16} stroke={1.7} />
							</Button>
						)}
						{permission?.delete && (
							<Button
								size="sm"
								variant="outline-danger"
								className="btn-icon ms-1"
								onClick={() => {
									setSelectedRole(row.original.id);
									setConfirmModal((preveState) => ({
										...preveState,
										show: true,
									}));
								}}
							>
								<IconTrash size={16} stroke={1.7} />
							</Button>
						)}
					</>
				),
			},
		]);
	};

	useEffect(() => {
		const getData = setTimeout(() => {
			fetchRoles();
		}, 100);
		return () => clearTimeout(getData);
	}, [filter]);

	const handleEdit = (id) => {
		setRoleModal({
			id: id,
			show: true,
			isLoading: true,
			title: "Edit Role",
			saveBtnText: "Submit",
			action: "Edit",
		});
	};

	const resetRoleModal = (isReload = false) => {
		setRoleModal({
			show: false,
			isLoading: false,
			title: "Add Role",
			saveBtnText: "Add",
			action: "Add",
		});
		if (isReload) {
			fetchRoles();
		}
	};

	const onConfirmAction = async () => {
		setConfirmModal((preveState) => ({ ...preveState, isLoading: true }));
		if (confirmModal.action === "Delete") {
			await deleteModel();
			dispatch(
				showUpdatedToasterMessage({
					message: "Role deleted successfully.",
					type: "success",
				})
			);
		} else if (confirmModal.action === "DeleteMultiple") {
			await deleteMultiple();
			dispatch(
				showUpdatedToasterMessage({
					message: "Role deleted successfully.",
					type: "success",
				})
			);
		} else if (confirmModal.action === "UpdateMultiple") {
			await updateMultiple();
			dispatch(
				showUpdatedToasterMessage({
					message: "Users status updated successfully.",
					type: "success",
				})
			);
		}
		setConfirmModal(DEFAULT_CONFIRM_MODAL);
		fetchRoles();
	}
	const deleteModel = async () => {
		await RoleAPI.remove(selectedRole);
	};
	const updateMultiple = async () => {
		await RoleAPI.multiUpdate({ role_ids: selectedRows, status: confirmModal.status });
	};
	const deleteMultiple = async () => {
		await RoleAPI.multiRemove({ role_ids: selectedRows });
	};
	const handleMultipleDelete = () => {
		setConfirmModal((preveState) => ({
			...preveState,
			show: true,
			isLoading: false,
			action: "DeleteMultiple",
			actionBtnText: "Delete",
		}));
	};
	const handleMultipleUpdate = (status) => {
		setConfirmModal((preveState) => ({
			...preveState,
			show: true,
			isLoading: false,
			action: "UpdateMultiple",
			actionBtnText: "Yes,Sure",
			status: status,
		}));
	};

	return (
		<SiteWrapper>
			<PageHeader title="Roles & Permission">
				{selectedRows.length > 0 && (
					<>
						{permission.update && (
							<Dropdown className="d-inline-block">
								<Dropdown.Toggle variant="secondary" id="dropdown-basic">
									Status : select
								</Dropdown.Toggle>
								<Dropdown.Menu>
									<Dropdown.Item
										onClick={() => {
											handleMultipleUpdate("Active");
										}}
									>
										Active
									</Dropdown.Item>
									<Dropdown.Item
										onClick={() => {
											handleMultipleUpdate("Inactive");
										}}
									>
										Inactive
									</Dropdown.Item>
								</Dropdown.Menu>
							</Dropdown>
						)}
						{permission?.delete && (
							<Button
								variant="danger"
								onClick={() => {
									handleMultipleDelete();
								}}
								className="btn-icon mx-3"
							>
								<IconTrash size={16} />
							</Button>
						)}
					</>
				)}
				{permission?.read && (
					<Button variant="primary" onClick={() => setRoleModal((preveState) => ({ ...preveState, show: true }))}>
						<IconPlus size={16} className="me-1" />
						Add Roles & Permission
					</Button>
				)}
			</PageHeader>
			<PageBody>
				<DataTable
					// title="Recent Users"
					columns={roleColumn}
					data={roles}
					initialState={initialState}
					setFilter={setFilter}
					setSelectedRows={setSelectedRows}
					totalRecords={totalRecords}
					tableHooks={tableHooks}
					defaultPageLength={PAGE_LENGTH}
					isLoading={isLoading}
					manual={true}
					// roles={roles}
					status={status}
				/>
				{roleModal.show && <AddEditRoleAndPermission roleModal={roleModal} resetRoleModal={resetRoleModal} />}
				{confirmModal.show && (
					<ConfirmModal
						{...confirmModal}
						onActionCallback={onConfirmAction}
						onHide={() => {
							setConfirmModal((preveState) => ({ ...preveState, show: false }));
						}}
					/>
				)}
			</PageBody>
		</SiteWrapper>
	);
};

export default RolesAndPermission;
