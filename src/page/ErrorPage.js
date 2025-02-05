import React from "react";
import { Container, Button } from "react-bootstrap";
import { Helmet } from "react-helmet";
import { IconArrowLeft } from "@tabler/icons-react";
import { Page } from "../interface/SiteWrapper";
const ErrorPage = () => {
  const handleBack = (event) => {
    window.history.back();
    event.preventDefault();
    return true;
  };
  return (
    <div className="page page-center">
      <Helmet>
        <title>404 Page Not Found</title>
      </Helmet>
      <Container className="container-tight py-4">
        <div className="empty">
          <div className="empty-header">404</div>
          <p className="empty-title">Page Not Found.</p>
          <p className="empty-subtitle text-muted">
            We are sorry but the page you are looking for was not found
          </p>
          <div className="empty-action">
            <Button onClick={handleBack}>
              <IconArrowLeft />
              Go back
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
};
export default ErrorPage;
