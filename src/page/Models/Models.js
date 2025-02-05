import React, { useCallback, useEffect, useMemo, useState, Fragment, lazy } from "react";
import { useDispatch } from "react-redux";
import { IconEye, IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";
import { Dropdown, Button, Badge } from "react-bootstrap";
import Utils from "../../components/Utils";
import * as ModelAPI from "../../api/ModelAPI";
import CheckAll from "../../components/DataTable/CheckAll";
import DataTable from "../../components/DataTable";
import ConfirmModal from "../../components/CustomModal/ConfirmModal";
import { PAGE_LENGTH, DEFAULT_CONFIRM_MODAL } from "../../common/constants";
import { showUpdatedToasterMessage } from "../../store/slices/toaster/toasterslice";
import { PageBody, PageHeader } from "../../interface/SiteWrapper";
import AddEditModelVariations from "./AddEditModelVariations";
import PageHeaderActions from "../../components/General/PageHeaderActions";
// import AddEditModel from "./AddEditModel";
const AddEditModel = lazy(() => import("./AddEditModel"));
const Models = ({ permission }) => {
	const dispatch = useDispatch();
	const [isLoading, setIsLoading] = useState(true);
	const [models, setModels] = useState([]);
	const [selectedRows, setSelectedRows] = useState([]);
	const [selectedModel, setSelectedModel] = useState();
	const [totalRecords, setTotalRecords] = useState(0);
	const status = ["All", "Active", "Inactive"];
	const [filter, setFilter] = useState({
		_page: 1,
		_limit: 10,
		status: "All",
		category: "All",
		q: "",
		_sort: "id",
		_order: "desc",
	});
	const [modelModal, setModelModal] = useState({
		show: false,
		isLoading: false,
		title: "Add Model",
		saveBtnText: "Add",
		action: "Add",
		id: null,
	});
	const [variationModal, setVariationModal] = useState({
		show: false,
		id: null,
	});
	const [confirmModal, setConfirmModal] = useState(DEFAULT_CONFIRM_MODAL);
	const initialState = {
		sortBy: [{ id: "id", desc: true }],
		pageSize: filter._limit,
		pageIndex: 0,
	};
	const fetchModels = useCallback(async () => {
		setIsLoading(true);
		await ModelAPI.getAll(filter).then(({ data }) => {
			if (data) {
				setTotalRecords(data?.count);
				setModels(data?.data);
			}
		});
		setIsLoading(false);
	}, [filter]);
	const column = useMemo(
		() => [
			{
				Header: "",
				accessor: "thumbnail",
				className: "w-1",
				disableSortBy: true,
				Cell: ({ row }) => (
					<span
						className={`avatar avatar-dhi ${!row.original?.thumbnail && "border"}`}
						style={{
							backgroundImage: row.original?.thumbnail
								? `url('${process.env.REACT_APP_UPLOAD_BASE_URL + row.original.thumbnail}')`
								: "none",
						}}
					>
						{!row.original?.thumbnail && Utils.getAcronym(row.original.name)}
					</span>
				),
			},
			{
				Header: "Name",
				accessor: "name",
				width: "auto",
				Cell: ({ row }) => (
					<div className="d-block">
						<div>{row.original.name}</div>
						<small className="text-muted">{row.original.description}</small>
					</div>
				),
			},
			{
				Header: "Category",
				accessor: "category.name",
				className: "text-nowrap",
			},
			{
				Header: "Material Used",
				accessor: "",
				disableSortBy: true,
			},
			{
				Header: "Tags",
				accessor: "tags",
				disableSortBy: true,
				className: "text-nowrap",
				width: "auto",
				Cell: ({ row }) => {
					if (row.original?.tags) {
						return row.original?.tags.split(",").map((item, idx) => (
							<Badge className="badge bg-primary-lt text-dark border border-primary me-1" key={idx}>
								{item}
							</Badge>
						));
					} else {
						return "";
					}
				},
			},
			{
				Header: "Vendor",
				accessor: "vendor_name",
				disableSortBy: true,
				className: "text-nowrap",
				width: "auto",
			},
			{
				Header: "3D Model",
				disableSortBy: true,
				className: "text-center",
				Cell: ({ row }) => (
					<Button variant="outline-primary" className="btn-icon">
						<IconEye stroke={1.5} size={"20"} />
					</Button>
				),
			},
			{
				Header: "Price",
				accessor: "price",
				width: "100",
				Cell: ({ row }) => <>{Utils.priceFormat(row.original.price)}</>,
			},
			{
				Header: "Status",
				accessor: "status",
				width: "100",
				className: "text-center",
				Cell: ({ row }) => (
					<span
						className={`badge badge-outline ${row.values.status === "Active" ? "text-success" : "text-danger"}`}
					>
						{row.values.status}
					</span>
				),
			},
			{
				Header: "Variation",
				accessor: "",
				disableSortBy: true,
				width: "50",
				className: "text-center",
				Cell: ({ row }) => (
					<Button
						size="sm"
						variant="outline-primary"
						className={`btn-icon ${!row.original?.model_file && "disabled"}`}
						onClick={() => {
							setVariationModal({ show: true, id: row.original.id });
						}}
					>
						<IconPlus stroke={1.7} size={"16"} />
					</Button>
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
									setSelectedModel(row.original.id);
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
			fetchModels();
		}, 100);
		return () => clearTimeout(getData);
	}, [filter]);
	const handleEdit = (id) => {
		setModelModal({
			id: id,
			show: true,
			isLoading: true,
			title: "Edit Model",
			saveBtnText: "Submit",
			action: "Edit",
		});
	};
	const resetModelModal = (isReload = false, id = null) => {
		setModelModal({
			id: id,
			show: id ? true : false,
			isLoading: id ? true : false,
			title: id ? "Edit Model" : "Add Model",
			saveBtnText: id ? "Submit" : "Add",
			action: id ? "Edit" : "Add",
		});
		if (isReload) {
			fetchModels();
		}
	};
	const onConfirmAction = async () => {
		setConfirmModal((preveState) => ({ ...preveState, isLoading: true }));
		if (confirmModal.action === "Delete") {
			await deleteModel();
			dispatch(
				showUpdatedToasterMessage({
					message: "Model deleted successfully.",
					type: "success",
				})
			);
		} else if (confirmModal.action === "DeleteMultiple") {
			await deleteMultiple();
			dispatch(
				showUpdatedToasterMessage({
					message: "Models deleted successfully.",
					type: "success",
				})
			);
		} else if (confirmModal.action === "UpdateMultiple") {
			await updateMultiple();
			dispatch(
				showUpdatedToasterMessage({
					message: "Models status updated successfully.",
					type: "success",
				})
			);
		}
		setConfirmModal(DEFAULT_CONFIRM_MODAL);
		fetchModels();
	};
	const deleteModel = async () => {
		await ModelAPI.remove(selectedModel);
	};
	const updateMultiple = async () => {
		await ModelAPI.multiUpdate({ model_ids: selectedRows, status: confirmModal.status });
	};
	const deleteMultiple = async () => {
		await ModelAPI.multiRemove({ model_ids: selectedRows });
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
		<Fragment>
			<PageHeader title="Models">
				<PageHeaderActions
					permission={permission}
					setProjectModal={setModelModal}
					selectedRows={selectedRows}
					handleMultipleUpdate={handleMultipleUpdate}
					handleMultipleDelete={handleMultipleDelete}
				/>
			</PageHeader>
			<PageBody>
				<DataTable
					// title="Recent Models"
					columns={column}
					data={models}
					initialState={initialState}
					setFilter={setFilter}
					setSelectedRows={setSelectedRows}
					totalRecords={totalRecords}
					tableHooks={tableHooks}
					defaultPageLength={PAGE_LENGTH}
					isLoading={isLoading}
					manual={true}
					status={status}
					align="table-vcenter"
				/>
				{modelModal.show && <AddEditModel modelModal={modelModal} resetModelModal={resetModelModal} />}
				{variationModal.show && (
					<AddEditModelVariations variationModal={variationModal} setVariationModal={setVariationModal} />
				)}
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
			</PageBody>
		</Fragment>
	);
};
export default Models;
