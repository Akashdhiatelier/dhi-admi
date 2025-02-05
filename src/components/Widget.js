import React, { Fragment } from "react";
import { Card, Col, Placeholder, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const Widget = ({ widgetData, loading }) => {
  const navigate = useNavigate();
  const handleClick = (to) => {
    if (!to) {
      return false;
    }
    navigate(to);
  };

  if (!widgetData) return "";

  return (
    <Row className="row-cards">
      {loading
        ? Array(6)
            .fill("div")
            .map((item, index) => {
              return (
                <Col md="4" key={index}>
                  <Card>
                    <Card.Body>
                      <Row
                        className="align-items-center"
                        style={{ height: "64px" }}
                      >
                        <Col xs="3">
                          <Placeholder as={Card.Title} animation="glow">
                            <Placeholder
                              xs={4}
                              className="w-100"
                              style={{ height: "64px" }}
                            />
                          </Placeholder>
                        </Col>
                        <Col xs="9" style={{ height: "64px" }}>
                          <Placeholder
                            as={Card.Text}
                            animation="glow"
                            className="mb-2"
                          >
                            <Placeholder xs={3} style={{ height: "15px" }} />
                          </Placeholder>
                          <Placeholder as={Card.Text} animation="glow">
                            <Placeholder xs={5} style={{ height: "20px" }} />
                          </Placeholder>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })
        : widgetData.map((item, i) => {
            return (
              <Fragment key={`widget-${i}`}>
                {item?.permission?.read && (
                  <Col md="4">
                    <Card
                      className="card-sm cursor-pointer"
                      onClick={() => {
                        handleClick(item.to);
                      }}
                    >
                      <Card.Body>
                        <Row className="align-items-center">
                          <Col className="col-auto">
                            {item.icon && (
                              <span
                                className={`avatar avatar-md bg-${
                                  item.color ? item.color : "primary"
                                }-lt`}
                              >
                                {item.icon}
                              </span>
                            )}
                          </Col>
                          {(item.count || item.count === 0) &&
                            item.description && (
                              <Col>
                                {(item.count || item.count === 0) && (
                                  <h1
                                    className={`text-${
                                      item.color ? item.color : "primary"
                                    }`}
                                  >
                                    {item.count || item.count === 0
                                      ? item.count
                                      : "-"}
                                  </h1>
                                )}
                                {item.description && (
                                  <div className="text-muted">
                                    {item.description}
                                  </div>
                                )}
                              </Col>
                            )}
                        </Row>
                      </Card.Body>
                    </Card>
                  </Col>
                )}
              </Fragment>
            );
          })}
    </Row>
  );
};
export default Widget;
