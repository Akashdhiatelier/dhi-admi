import React, { useState, useEffect } from "react";
import { Card, Table } from "react-bootstrap";
import { useTable, useSortBy, useGlobalFilter, usePagination, useRowSelect } from "react-table";
import GlobalFilter from "../../components/DataTable/GlobalFilter";
import TablePagination from "../../components/DataTable/TablePagination";
import Loader from "../../components/Loader";
const DataTable = ({
	title,
	columns,
	data,
	initialState,
	setFilter,
	setSelectedRows,
	totalRecords,
	tableHooks,
	defaultPageLength,
	manual,
	isLoading,
	roles,
	status,
	align = false,
}) => {
	// const [roles, setRoles] = useState(["All", "Admin", "Customer"]);
	// const [status, setStatus] = useState(["All", "Active", "Inactive"]);
	const tableInstance = useTable(
		{
			columns: columns,
			data: data || [],
			manualGlobalFilter: manual,
			manualSortBy: manual,
			manualPagination: manual,
			disableMultiSort: manual,
			initialState: initialState,
			pageCount: Math.ceil(totalRecords / initialState.pageSize),
		},
		tableHooks,
		useGlobalFilter,
		useSortBy,
		usePagination,
		useRowSelect
	);
	const {
		getTableProps,
		getTableBodyProps,
		headerGroups,
		rows,
		prepareRow,
		setGlobalFilter,
		page,
		pageCount,
		pageOptions,
		gotoPage,
		previousPage,
		canPreviousPage,
		nextPage,
		canNextPage,
		setPageSize,
		selectedFlatRows,
		state: { pageIndex, pageSize, sortBy, globalFilter, selectedRowIds },
	} = tableInstance;
	useEffect(() => {
		setFilter((prevState) => ({
			...prevState,
			q: globalFilter || "",
			_sort: sortBy[0]?.id || "",
			_order: sortBy[0]?.id ? (sortBy[0].desc ? "desc" : "asc") : "",
			_limit: pageSize,
			_page: pageIndex+1,
		}));
	}, [sortBy, globalFilter, pageIndex, pageSize]);
	useEffect(() => {
		setSelectedRows(selectedFlatRows.map((row) => row.original.id));
	}, [selectedRowIds]);
	return (
		<Card>
			{title && <Card.Header>{title}</Card.Header>}
			{isLoading && <Loader />}
			<Card.Body className="border-bottom">
				<div className="d-flex">
					{defaultPageLength && (
						<div>
							Show
							<div className="mx-2 d-inline-block">
								<select
									className="form-select form-select-sm"
									onChange={(e) => {
										setPageSize(Number(e.target.value));
									}}
								>
									{defaultPageLength.map((item) => (
										<option key={item} value={item}>
											{item}
										</option>
									))}
								</select>
							</div>
							entries
						</div>
					)}
					<div className="ms-auto">
						{roles && (
							<div className="ms-3 d-inline-block">
								<div className="d-flex align-items-center">
									Role
									<select
										className="form-select form-select-sm ms-1"
										onChange={(e) => {
											setFilter((prevState) => ({
												...prevState,
												role: e.target.value,
											}));
										}}
									>
										<option value="All">All</option>
										{roles.map((item) => (
											<option key={item.id} value={item.id}>
												{item.name}
											</option>
										))}
									</select>
								</div>
							</div>
						)}
						{status && (
							<div className="ms-3 d-inline-block">
								<div className="d-flex align-items-center">
									Status
									<select
										className="form-select form-select-sm ms-1"
										onChange={(e) => {
											setFilter((prevState) => ({
												...prevState,
												status: e.target.value,
											}));
										}}
									>
										{status.map((item) => (
											<option key={item} value={item}>
												{item}
											</option>
										))}
									</select>
								</div>
							</div>
						)}
						<div className="ms-3 d-inline-block">
							<GlobalFilter globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />
						</div>
					</div>
				</div>
			</Card.Body>
			<div className="card-table table-responsive">
				<Table responsive="md" className={`${align ? align : ""}`} {...getTableProps()}>
					<thead>
						{headerGroups.map((headerGroup) => (
							<tr {...headerGroup.getHeaderGroupProps()}>
								{headerGroup.headers.map((column) => (
									<th
										{...column.getHeaderProps([
											column.getSortByToggleProps(),
											{
												className: column.className,
											},
											{ width: column.width },
										])}
										// className={column.className || ""}
									>
										<span
											className={`${!column.disableSortBy ? "table-sort" : ""} ${
												column.isSorted ? (column.isSortedDesc ? "asc" : "desc") : ""
											}`}
										>
											{column.render("Header")}
										</span>
									</th>
								))}
							</tr>
						))}
					</thead>
					<tbody {...getTableBodyProps()}>
						{rows.map((row, i) => {
							prepareRow(row);
							return (
								<tr {...row.getRowProps()}>
									{row.cells.map((cell) => {
										return (
											<td {...cell.getCellProps()} className={cell.column.className || ""}>
												{cell.render("Cell")}
											</td>
										);
									})}
								</tr>
							);
						})}
					</tbody>
				</Table>
				<TablePagination
					isLoading={isLoading}
					totalRecords={totalRecords}
					page={page}
					pageOptions={pageOptions}
					pageSize={pageSize}
					pageIndex={pageIndex}
					previousPage={previousPage}
					canPreviousPage={canPreviousPage}
					nextPage={nextPage}
					canNextPage={canNextPage}
					gotoPage={gotoPage}
				/>
			</div>
		</Card>
	);
};
export default DataTable;
