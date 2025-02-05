import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { Dropdown, Button, Form, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { IconPencil, IconPlus, IconTrash, IconUser } from "@tabler/icons-react";

import Utils from "../../components/Utils";
import * as UserAPI from "../../api/UserAPI";
import * as RoleAPI from "../../api/RoleAPI";
import CheckAll from "../../components/DataTable/CheckAll";
import DataTable from "../../components/DataTable";
import ConfirmModal from "../../components/CustomModal/ConfirmModal";

import { PageBody, PageHeader, SiteWrapper } from "../../interface/SiteWrapper";
import { PAGE_LENGTH, DEFAULT_CONFIRM_MODAL } from "../../common/constants";
import { showUpdatedToasterMessage } from "../../store/slices/toaster/toasterslice";
import AddEditUser from "./AddEditUser";
import PageHeaderActions from "../../components/General/PageHeaderActions";

const Users = ({ permission }) => {
	const dispatch = useDispatch();
	const userData = useSelector((state) => state.dhi.authUserReducer);
	const [isLoading, setIsLoading] = useState(true);
	const [users, setUsers] = useState([]);
	const [selectedRows, setSelectedRows] = useState([]);
	const [selectedUser, setSelectedUser] = useState();
	const [totalRecords, setTotalRecords] = useState(0);
	const [roles, setRoles] = useState([]);
	const status = ["All", "Active", "Inactive"];
	const [filter, setFilter] = useState({
		_page: 2,
		_limit: 10,
		role: "All",
		status: "All",
		q: "",
		_sort: "id",
		_order: "desc",
	});
	const [userModal, setUserModal] = useState({
		id: null,
		show: false,
		isLoading: false,
		title: "Add User",
		saveBtnText: "Add",
		action: "Add",
	});
	const [confirmModal, setConfirmModal] = useState(DEFAULT_CONFIRM_MODAL);
	const initialState = {
		sortBy: [{ id: "id", desc: true }],
		pageSize: filter._limit,
		pageIndex: 0,
	};

	useEffect(() => {
		fetchRoles();
	}, []);

	const fetchRoles = useCallback(async () => {
		setIsLoading(true);
		await RoleAPI.getAll({ _page: 1, _limit: 25 })
			.then(({ data }) => {
				if (data) {
					const filterRoles = data?.data.map((item) => ({ id: item?.id, name: item?.name }));
					setRoles(filterRoles);
				}
			})
			.catch((err) => {
				dispatch(
					showUpdatedToasterMessage({
						message: "Failed to fetch roles",
						type: "danger",
					})
				);
			});
		setIsLoading(false);
	}, []);

	const fetchUsers = useCallback(async () => {
		setIsLoading(true);
		await UserAPI.getAll(filter).then(({ data }) => {
			if (data) {
				setTotalRecords(data?.count);
				setUsers(data?.data);
			}
		});
		setIsLoading(false);
	}, [filter]);
	const userColumn = useMemo(
		() => [
			{
				Header: "Name",
				accessor: "name",
				width: "auto",
				Cell: ({ row }) => (
					<>
						<span
							className={`avatar avatar-xs bg-primary-lt me-2 fs-5 ${
								!row.original?.avatar_url && "border border-primary"
							}`}
							style={{
								backgroundImage: row.original?.avatar_url
									? `url('${process.env.REACT_APP_UPLOAD_BASE_URL + row.original.avatar_url}')`
									: "none",
							}}
						>
							{!row.original?.avatar_url &&
								Utils.getAcronym(row.original.first_name + " " + row.original.last_name)}
						</span>
						{row.original.first_name + " " + row.original.last_name}
					</>
				),
			},
			{ Header: "Email", accessor: "email", width: "auto" },
			{
				Header: "Role",
				accessor: "rolesId",
				Cell: ({ row }) => row.original.role.name,
			},
			{
				Header: "Status",
				accessor: "status",
				className: "text-center",
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
	// const userColumn = //useMemo(()=>users[0]?Object.keys(users[0]).filter((key)=>key!=="rating").map((key)=>{return {Header:key,accessor:key};}):[],[users]);

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
									setSelectedUser(row.original.id);
									setUserModal({
										id: row.original.id,
										show: true,
										isLoading: true,
										title: "Edit User",
										saveBtnText: "Submit",
										action: "Edit",
									});
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
									setSelectedUser(row.original.id);
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
			fetchUsers();
		}, 100);
		return () => clearTimeout(getData);
	}, [filter]);

	const resetUserModal = (isReload = false) => {
		setUserModal({
			id: null,
			show: false,
			isLoading: false,
			title: "Add User",
			saveBtnText: "Add",
			action: "Add",
		});
		if (isReload) {
			fetchUsers();
		}
	};
	const onConfirmAction = async () => {
		setConfirmModal((preveState) => ({ ...preveState, isLoading: true }));
		if (confirmModal.action === "Delete") {
			await deleteUser();
			dispatch(
				showUpdatedToasterMessage({
					message: "User deleted successfully.",
					type: "success",
				})
			);
		} else if (confirmModal.action === "DeleteMultiple") {
			await deleteMultiple();
			dispatch(
				showUpdatedToasterMessage({
					message: "Users deleted successfully.",
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
		fetchUsers();
	};
	const deleteUser = async () => {
		await UserAPI.remove(selectedUser);
	};
	const updateMultiple = async () => {
		await UserAPI.multiUpdate({ user_ids: selectedRows, status: confirmModal.status });
	};
	const deleteMultiple = async () => {
		await UserAPI.multiRemove({ user_ids: selectedRows });
	};
	const handleMultipleDelete = () => {
		setConfirmModal((preveState) => ({
			...preveState,
			show: true,
			isLoading: false,
			description: "Do you really want to remove this data? what you've done can't be undone.",
			action: "DeleteMultiple",
			actionBtnText: "Delete",
		}));
	};
	const handleMultipleUpdate = (status) => {
		setConfirmModal((preveState) => ({
			...preveState,
			show: true,
			isLoading: false,
			description: "Do you really want to update this data? what you've done can't be undone.",
			action: "UpdateMultiple",
			actionBtnText: "Yes,Sure",
			status: status,
		}));
	};

	return (
		<SiteWrapper>
			<PageHeader title="Users">
				<PageHeaderActions
					permission={permission}
					setProjectModal={setUserModal}
					selectedRows={selectedRows}
					handleMultipleUpdate={handleMultipleUpdate}
					handleMultipleDelete={handleMultipleDelete}
				/>
			</PageHeader>
			<PageBody>
				<DataTable
					// title="Recent Users"
					columns={userColumn}
					data={users}
					initialState={initialState}
					setFilter={setFilter}
					setSelectedRows={setSelectedRows}
					totalRecords={totalRecords}
					tableHooks={tableHooks}
					defaultPageLength={PAGE_LENGTH}
					isLoading={isLoading}
					manual={true}
					roles={roles}
					status={status}
				/>
				{userModal.show && <AddEditUser userModal={userModal} resetUserModal={resetUserModal} roles={roles} />}
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
export default Users;
