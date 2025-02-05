import React from "react";

import Widget from "../../components/Widget";
import useDashboard from "../../hooks/API/useDashboard";

import { PageBody, PageHeader, SiteWrapper } from "../../interface/SiteWrapper";

const Dashboard = ({ permission }) => {
  document.body.classList.remove("login");
  document.body.classList.remove("reset");

  const { widgetData, loading } = useDashboard(permission);

  return (
    <SiteWrapper>
      <PageHeader title="Dashboard" />
      <PageBody>
        <Widget widgetData={widgetData} loading={loading} />
      </PageBody>
    </SiteWrapper>
  );
};
export default Dashboard;
