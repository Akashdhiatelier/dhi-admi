import { IconAlertTriangle } from "@tabler/icons-react";
import React, { useEffect } from "react";
import { Button, CloseButton, Col, Modal, Row } from "react-bootstrap";
import Loader from "../Loader";

const ConfirmModal = ({
	size = "sm",
	show = false,
	isLoading = false,
	onHide = () => {},
	modalHeading = "",
	children,
	hasActions = true,
	hasAction = true,
	title = "",
	description = "",
	actionBtnText = "Save Changes",
	onActionCallback = () => {},
}) => {
	useEffect(() => {
		setTimeout(() => {
			const backdrop = document.getElementsByClassName("modal-backdrop show");
			try {
				backdrop[1].classList.add("top-backdrop");
			} catch (err) {
				
			}
		}, 10);
	}, []);
	return (
		<Modal
			show={show}
			onHide={onHide}
			size={size}
			aria-labelledby="contained-modal-title-vcenter"
			centered
			backdrop="static"
		>
			{isLoading && <Loader />}
			<Modal.Body className="text-center pt-4 pb-2">
				<CloseButton onClick={onHide} />
				<IconAlertTriangle size={56} stroke={1} className="text-danger" />
				{title && <h3>{title}</h3>}
				{description && <p className="text-muted">{description}</p>}
				{children}
			</Modal.Body>
			{hasActions && (
				<Modal.Footer className="pt-0 pb-4">
					<Row className="w-100">
						<Col>
							<Button variant="sucess" className="w-100" onClick={onHide}>
								Cancel
							</Button>
						</Col>
						{hasAction && (
							<Col>
								<Button variant="danger" className="w-100" onClick={onActionCallback}>
									{actionBtnText}
								</Button>
							</Col>
						)}
					</Row>
				</Modal.Footer>
			)}
		</Modal>
	);
};

export default ConfirmModal;
