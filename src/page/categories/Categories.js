import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import _ from "lodash";
import { Dropdown, Button, Form, Row, Col } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";

import * as CategoryAPI from "../../api/CategoryAPI";
import CheckAll from "../../components/DataTable/CheckAll";
import DataTable from "../../components/DataTable";
import CustomModal from "../../components/CustomModal/CustomModal";
import ConfirmModal from "../../components/CustomModal/ConfirmModal";

import { PageBody, PageHeader, SiteWrapper } from "../../interface/SiteWrapper";
import { PAGE_LENGTH, DEFAULT_CONFIRM_MODAL } from "../../common/constants";
import { showUpdatedToasterMessage } from "../../store/slices/toaster/toasterslice";
import AddEditCategory from "./AddEditCategory";
import PageHeaderActions from "../../components/General/PageHeaderActions";

const Categories = ({ permission }) => {
	const dispatch = useDispatch();
	const userData = useSelector((state) => state.dhi.authUserReducer);
	const [isLoading, setIsLoading] = useState(true);
	const [categories, setCategories] = useState([]);
	const [selectedRows, setSelectedRows] = useState([]);
	const [selectedCategory, setSelectedCategory] = useState();
	const [totalRecords, setTotalRecords] = useState(0);
	const [filter, setFilter] = useState({
		_page: 1,
		_limit: 10,
		status: "All",
		q: "",
		_sort: "id",
		_order: "desc",
	});
	const [categoryModal, setCategoryModal] = useState({
		id: null,
		show: false,
		isLoading: false,
		title: "Add Category",
		saveBtnText: "Add",
		action: "Add",
	});
	const [confirmModal, setConfirmModal] = useState(DEFAULT_CONFIRM_MODAL);

	const status = ["All", "Active", "Inactive"];
	const initialState = {
		sortBy: [{ id: "id", desc: true }],
		pageSize: filter._limit,
		pageIndex: 0,
	};

	const fetchCategories = useCallback(async () => {
		setIsLoading(true);
		await CategoryAPI.getAll(filter).then(({ data }) => {
			if (data) {
				setTotalRecords(data?.count);
				setCategories(data?.data);
			}
		});
		setIsLoading(false);
	}, [filter]);

	const categoryColumn = useMemo(
		() => [
			{
				Header: "Name",
				accessor: "name",
				width: "auto",
				Cell: ({ row }) => row.original.name,
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
									setSelectedCategory(row.original.id);
									setCategoryModal({
										id: row.original.id,
										show: true,
										isLoading: true,
										title: "Edit Category",
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
									setSelectedCategory(row.original.id);
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
			fetchCategories();
		}, 100);
		return () => clearTimeout(getData);
	}, [filter]);

	const resetCategoryModal = (isReload = false) => {
		setCategoryModal({
			show: false,
			isLoading: false,
			title: "Add Category",
			saveBtnText: "Add",
			action: "Add",
		});
		if (isReload) {
			fetchCategories();
		}
	};

	const onConfirmAction = async () => {
		setConfirmModal((preveState) => ({ ...preveState, isLoading: true }));
		if (confirmModal.action === "Delete") {
			await deleteCategory();
			dispatch(
				showUpdatedToasterMessage({
					message: "Category deleted successfully.",
					type: "success",
				})
			);
		} else if (confirmModal.action === "DeleteMultiple") {
			await deleteMultiple();
			dispatch(
				showUpdatedToasterMessage({
					message: "Categories deleted successfully.",
					type: "success",
				})
			);
		} else if (confirmModal.action === "UpdateMultiple") {
			await updateMultiple();
			dispatch(
				showUpdatedToasterMessage({
					message: "Category status updated successfully.",
					type: "success",
				})
			);
		}
		setConfirmModal(DEFAULT_CONFIRM_MODAL);
		fetchCategories();
	};
	const deleteCategory = async () => {
		await CategoryAPI.remove(selectedCategory);
	};
	const updateMultiple = async () => {
		await CategoryAPI.multiUpdate({ category_ids: selectedRows, status: confirmModal.status });
	};
	const deleteMultiple = async () => {
		await CategoryAPI.multiRemove({ category_ids: selectedRows });
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
			<PageHeader title="Categories">
				<PageHeaderActions
					permission={permission}
					setProjectModal={setCategoryModal}
					selectedRows={selectedRows}
					handleMultipleUpdate={handleMultipleUpdate}
					handleMultipleDelete={handleMultipleDelete}
				/>
			</PageHeader>
			<PageBody>
				<DataTable
					// title="Recent Users"
					columns={categoryColumn}
					data={categories}
					initialState={initialState}
					setFilter={setFilter}
					setSelectedRows={setSelectedRows}
					totalRecords={totalRecords}
					tableHooks={tableHooks}
					defaultPageLength={PAGE_LENGTH}
					isLoading={isLoading}
					manual={true}
					status={status}
				/>
				{categoryModal.show && (
					<AddEditCategory categoryModal={categoryModal} resetCategoryModal={resetCategoryModal} status={status} />
				)}
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
export default Categories;
