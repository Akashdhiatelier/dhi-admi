import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Helmet } from "react-helmet";

export const SiteWrapper = (props) => {
  return (
    <Page>
      <PageWrapper>{props.children}</PageWrapper>
    </Page>
  );
};
export const Page = (props) => {
  return <div className="page">{props.children}</div>;
};
export const PageWrapper = (props) => {
  return <div className="page-wrapper">{props.children}</div>;
};
export const PageHeader = (props) => {
  return (
    <div className="page-header d-print-none">
      {props.title && (
        <Helmet>
          <title>
            {props.title} - {process.env.REACT_APP_NAME}
          </title>
        </Helmet>
      )}
      <Container fluid="xl">
        <Row className="align-items-center">
          <Col>
            {props.title && <h2 className="page-title">{props.title}</h2>}
          </Col>
          <Col md="auto">{props.children}</Col>
        </Row>
      </Container>
    </div>
  );
};
export const PageBody = (props) => {
  return (
    <div className="page-body">
      <Container fluid="xl">{props.children}</Container>
    </div>
  );
};
