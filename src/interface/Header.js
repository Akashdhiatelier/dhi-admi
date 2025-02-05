import React, { useCallback, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { Container, Nav, Navbar, Dropdown, NavItem } from "react-bootstrap";
import { IconBell } from "@tabler/icons-react";

import { ACCOUNT_DROPDOWN_ITEMS } from "../common/constants";

import Logo from "../assets/images/logo-dark.png";
import useRole from "../hooks/useRole";
import Utils from "../components/Utils";
import MyProfile from "../page/MyProfile/MyProfile";

const SiteHeader = () => {
	const navItems = useRole();
	const authSelector = useSelector((state) => state.dhi.authUserReducer);
	const [profileModal, setProfileModal] = useState(false);
	const renderNav = useCallback(() => {
		return (
			<Nav className="me-auto" as="ul">
				{navItems.map((item, i) => {
					return (
						<NavItem as="li" key={`topnav-${i}`}>
							{item?.role?.read ? (
								<NavLink key={`topnav-${i}`} to={item.to} className="nav-link">
									{item.icon}
									{item.name}
								</NavLink>
							) : null}
						</NavItem>
					);
				})}
			</Nav>
		);
	}, [navItems, authSelector]);

	return (
		<Navbar as="header" expand="md">
			<Container fluid="xl">
				<div expand="md" className="d-md-flex w-100">
					<div className="w-md-auto d-flex flex-lg-row flex-row-reverse align-items-center justify-content-between">
						<Navbar.Toggle
							aria-controls="navbar-menu"
							data-bs-target="#navbar-menu"
							aria-expanded="false"
							aria-label="Toggle navigation"
						/>
						<Navbar.Brand href="/">
							<img src={Logo} width="110" height="32" alt="Logo" className="navbar-brand-image me-md-3" />
						</Navbar.Brand>
					</div>
					<Navbar.Collapse id="navbar-menu">{renderNav()}</Navbar.Collapse>
				</div>
				<Nav className="flex-row order-md-last">
					<Nav className="d-none d-md-flex">
						<Dropdown className="nav-item d-none d-md-flex me-3">
							<Dropdown.Toggle as="a" className="nav-link cursor-pointer px-0 dropdown-arrow-none">
								<IconBell size={20} stroke={1.2} className="" />
								<span className="badge bg-gold"></span>
							</Dropdown.Toggle>
						</Dropdown>
						<Dropdown className="nav-link cursor-pointer">
							<Dropdown.Toggle as={"a"} className="nav-link d-flex lh-1 text-reset p-0 text-dark">
								<span
									className={`avatar avatar-sm bg-gold-lt fs-4 me-2 ${
										!authSelector.avatar && "border border-gold"
									}`}
									style={{
										backgroundImage: authSelector.avatar_url
											? `url('${process.env.REACT_APP_UPLOAD_BASE_URL + authSelector.avatar_url}')`
											: "none",
									}}
								>
									{!authSelector.avatar_url &&
										Utils.getAcronym(authSelector.first_name + " " + authSelector.last_name)}
								</span>
								{authSelector.first_name + " " + authSelector.last_name}
							</Dropdown.Toggle>
							<Dropdown.Menu align="end" className="dropdown-menu-end dropdown-menu-arrow">
								{ACCOUNT_DROPDOWN_ITEMS.map((item, i) => {
									if (item.value === "My Profile") {
										return (
											<Dropdown.Item
												key={`dd-${i}`}
												onClick={() => {
													setProfileModal(true);
												}}
											>
												{item.icon}
												{item.value}
											</Dropdown.Item>
										);
									}
									return (
                    <Dropdown.Item
												key={`dd-${i}`}
                        as={NavLink}
                        to={item.to}
											>
												{item.icon}
												{item.value}
											</Dropdown.Item>
									);
								})}
							</Dropdown.Menu>
						</Dropdown>
					</Nav>
				</Nav>
				{profileModal && <MyProfile profileModal={profileModal} setProfileModal={setProfileModal} />}
			</Container>
		</Navbar>
	);
};
export default SiteHeader;
