import React, { useCallback, useEffect, useMemo, useState, Fragment } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";
import { Dropdown, Button, Badge } from "react-bootstrap";
import Utils from "../../components/Utils";
import * as MaterialAPI from "../../api/MaterialAPI";
import CheckAll from "../../components/DataTable/CheckAll";
import DataTable from "../../components/DataTable";
import ConfirmModal from "../../components/CustomModal/ConfirmModal";
import { PAGE_LENGTH, DEFAULT_CONFIRM_MODAL } from "../../common/constants";
import { showUpdatedToasterMessage } from "../../store/slices/toaster/toasterslice";
import { PageBody, PageHeader } from "../../interface/SiteWrapper";
import AddEditMaterial from "./AddEditMaterial";
import PageHeaderActions from "../../components/General/PageHeaderActions";
const Materials = ({ permission }) => {
	const dispatch = useDispatch();
	const userData = useSelector((state) => state.dhi.authUserReducer);
	const [isLoading, setIsLoading] = useState(false);
	const [materials, setMaterials] = useState([]);
	const [selectedRows, setSelectedRows] = useState([]);
	const [selectedMaterial, setSelectedMaterial] = useState();
	const [totalRecords, setTotalRecords] = useState(0);
	const status = ["All", "Active", "Inactive"];
	const [filter, setFilter] = useState({
		_page: 1,
		_limit: 10,
		status: "All",
		q: "",
		_sort: "id",
		_order: "desc",
	});
	const [materialModal, setMaterialModal] = useState({
		id: null,
		show: false,
		isLoading: false,
		title: "Add Material",
		saveBtnText: "Add",
		action: "Add",
	});
	const [confirmModal, setConfirmModal] = useState(DEFAULT_CONFIRM_MODAL);
	const initialState = {
		sortBy: [{ id: "id", desc: true }],
		pageSize: filter._limit,
		pageIndex: 0,
	};
	const fetchMaterials = useCallback(async () => {
		setIsLoading(true);
		await MaterialAPI.getAll(filter).then(({ data }) => {
			if (data) {
				setTotalRecords(data?.count);
				setMaterials(data?.data);
			}
		});
		setIsLoading(false);
	}, [filter]);
	const column = useMemo(
		() => [
			{
				Header: "Name",
				accessor: "name",
				width: "auto",
				Cell: ({ row }) => (
					<div className="d-flex align-items-center">
						<span
							className={`avatar bg-primary-lt me-2 fs-5 ${
								!row.original?.thumbnail && "border border-primary"
							}`}
							style={{
								backgroundImage: row.original?.thumbnail
									? `url('${process.env.REACT_APP_UPLOAD_BASE_URL + row.original.thumbnail}')`
									: "none",
							}}
						>
							{!row.original?.thumbnail && Utils.getAcronym(row.original.name)}
						</span>
						{row.original.name}
					</div>
				),
			},
			{
				Header: "Color",
				accessor: "color",
				className: "text-nowrap",
				Cell: ({ row }) => (
					<div className="d-flex align-items-center">
						<Badge
							bg=""
							className="p-2 me-1"
							style={{
								background: `${row?.original?.material_color?.color}`,
							}}
						/>
						{row?.original?.material_color?.name}
					</div>
				),
			},
			{
				Header: "Tags",
				accessor: "tags",
				disableSortBy: true,
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
				Header: "Price",
				accessor: "price",
				width: "100",
				Cell: ({ row }) => <>{Utils.priceFormat(row.original.price)}</>,
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
									setSelectedMaterial(row.original.id);
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
			fetchMaterials();
		}, 100);
		return () => clearTimeout(getData);
	}, [filter]);

	const handleEdit = (id) => {
		setMaterialModal({
			id: id,
			show: true,
			isLoading: true,
			title: "Edit Material",
			saveBtnText: "Submit",
			action: "Edit",
		});
	};
	const resetMaterialModal = (isReload = false) => {
		setMaterialModal({
			id: null,
			show: false,
			isLoading: false,
			title: "Add Material",
			saveBtnText: "Add",
			action: "Add",
		});
		if (isReload) {
			fetchMaterials();
		}
	};
	const onConfirmAction = async () => {
		setConfirmModal((preveState) => ({ ...preveState, isLoading: true }));
		if (confirmModal.action === "Delete") {
			await deleteMaterial();
			dispatch(
				showUpdatedToasterMessage({
					message: "Material deleted successfully.",
					type: "success",
				})
			);
		} else if (confirmModal.action === "DeleteMultiple") {
			await deleteMultiple();
			dispatch(
				showUpdatedToasterMessage({
					message: "Materials deleted successfully.",
					type: "success",
				})
			);
		} else if (confirmModal.action === "UpdateMultiple") {
			await updateMultiple();
			dispatch(
				showUpdatedToasterMessage({
					message: "Materials status updated successfully.",
					type: "success",
				})
			);
		}
		setConfirmModal(DEFAULT_CONFIRM_MODAL);
		fetchMaterials();
	};
	const deleteMaterial = async () => {
		await MaterialAPI.remove(selectedMaterial);
	};
	const updateMultiple = async () => {
		await MaterialAPI.multiUpdate({ material_ids: selectedRows, status: confirmModal.status });
	};
	const deleteMultiple = async () => {
		await MaterialAPI.multiRemove({ material_ids: selectedRows });
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
			<PageHeader title="Materials">
				<PageHeaderActions
					permission={permission}
					setProjectModal={setMaterialModal}
					selectedRows={selectedRows}
					handleMultipleUpdate={handleMultipleUpdate}
					handleMultipleDelete={handleMultipleDelete}
				/>
			</PageHeader>
			<PageBody>
				<DataTable
					// title="Recent Materials"
					columns={column}
					data={materials}
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
				{materialModal.show && (
					<AddEditMaterial materialModal={materialModal} resetMaterialModal={resetMaterialModal} />
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
export default Materials;
