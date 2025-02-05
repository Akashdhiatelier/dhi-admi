import React from "react";
import { Button, Modal } from "react-bootstrap";
import Loader from "../Loader";

const CustomModal = ({
	size = "",
	show = false,
	isLoading = false,
	onHide = () => {},
	modalHeading = "",
	hadBodyPadding = false,
	children,
	hasActions = true,
	hasSave = true,
	saveBtnText = "Save Changes",
	fullscreen = false,
  scrollable = false,
	onSaveCallback = () => {},
}) => {
	return (
		<Modal
			show={show}
			onHide={onHide}
			size={size}
			fullscreen={fullscreen}
      scrollable={scrollable}
			centered
		>
			{isLoading && <Loader />}
			<Modal.Header closeButton>
				<Modal.Title id="contained-modal-title-vcenter" className="text-primary">
					{modalHeading}
				</Modal.Title>
			</Modal.Header>
			<Modal.Body className={hadBodyPadding ? "p-0" : ""}>{children}</Modal.Body>
			{hasActions && (
				<Modal.Footer className=" justify-content-start bg-gold-lt">
					{hasSave && (
						<Button type="submit" onClick={onSaveCallback}>
							{saveBtnText}
						</Button>
					)}

					<Button variant="sucess" onClick={onHide}>
						Close
					</Button>
				</Modal.Footer>
			)}
		</Modal>
	);
};

export default CustomModal;
