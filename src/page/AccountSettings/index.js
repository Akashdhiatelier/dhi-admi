import React from "react";
import { Card, Col, ListGroup, Row } from "react-bootstrap";
import { NavLink, Outlet } from "react-router-dom";
import { PageBody, PageHeader, SiteWrapper } from "../../interface/SiteWrapper";

const AccountSettings = () => {
	const generalSettings = [
		{ to: "my-account", title: "My Account" },
		{ to: "notifications", title: "Notifications" },
		{ to: "color-management", title: "Color Management" },
	];
	const cmsSettings = [
		{ to: "about-us", title: "About Us" },
		{ to: "privacy-policy", title: "Privacy Policy" },
		{ to: "terms-of-use", title: "Terms of Use" },
	];
	const defaultNavClass = "list-group-item list-group-item-action d-flex align-items-center";
	return (
		<SiteWrapper>
			<PageHeader title="Account Settings" />
			<PageBody>
				<Card>
					<Row className="g-0">
						<Col className="col-3 d-none d-md-block border-end">
							<Card.Body>
								<h4 className="subheader">General Settings</h4>
								<ListGroup className="list-group-transparent">
									{generalSettings.map((item,i) => {
										return (
											<NavLink key={i} to={item.to} className={defaultNavClass}>
												{item.title}
											</NavLink>
										);
									})}
								</ListGroup>
								<h4 className="subheader mt-4">CMS Settings</h4>
								<ListGroup className="list-group-transparent">
									{cmsSettings.map((item,i) => {
										return (
											<NavLink key={i} to={item.to} className={defaultNavClass}>
												{item.title}
											</NavLink>
										);
									})}
								</ListGroup>
							</Card.Body>
						</Col>
						<Col className="col d-flex flex-column">
							<Outlet />
						</Col>
					</Row>
				</Card>
			</PageBody>
		</SiteWrapper>
	);
};
export default AccountSettings;
