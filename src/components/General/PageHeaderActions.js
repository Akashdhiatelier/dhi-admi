import { IconPlus } from "@tabler/icons-react";
import { IconTrash } from "@tabler/icons-react";
import React, { Fragment } from "react";
import { Button, Dropdown } from "react-bootstrap";

const PageHeaderActions = ({ permission,setProjectModal, selectedRows,handleMultipleUpdate,handleMultipleDelete }) => {
    return (
		<Fragment>
			{selectedRows.length > 0 && (
				<>
					{/* <div className="d-inline-block"> */}
					{permission?.update && (
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
					{/* </div> */}
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
			{permission?.write && (
				<Button
					variant="primary"
					onClick={() =>
						setProjectModal((preveState) => ({
							...preveState,
							show: true,
						}))
					}
				>
					<IconPlus size={16} className="me-1" />
					Add 
				</Button>
			)}
		</Fragment>
	);
};
export default PageHeaderActions;
