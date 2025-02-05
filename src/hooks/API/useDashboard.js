import axios from "axios";
import { useCallback, useEffect, useState } from "react";

import {
  IconUser,
  IconListDetails,
  IconLayersSubtract,
  IconBrandAirtable,
  IconFolder,
} from "@tabler/icons-react";
import { useDispatch } from "react-redux";
import { showUpdatedToasterMessage } from "../../store/slices/toaster/toasterslice";

const arr = [
  {
    count: 0,
    color: "green",
    to: "/users",
    icon: <IconUser stroke={1} />,
    description: "Active Users",
  },
  {
    count: 0,
    color: "primary",
    to: "/users",
    icon: <IconUser stroke={1} />,
    description: "Total Users",
  },
  {
    count: 0,
    color: "blue",
    to: "/categories",
    icon: <IconListDetails stroke={1} />,
    description: "No of Categories",
  },
  {
    count: 0,
    color: "purple",
    to: "/materials",
    icon: <IconLayersSubtract stroke={1} />,
    description: "No of Materials",
  },
  {
    count: 0,
    color: "red",
    to: "/models",
    icon: <IconBrandAirtable stroke={1} />,
    description: "No of Models",
  },
  {
    count: 0,
    color: "info",
    to: "/projects",
    icon: <IconFolder stroke={1} />,
    description: "Total Projects",
  },
];

const useDashboard = (permission) => {
  const dispatch = useDispatch();
  const [widgetData, setWidgetData] = useState(arr);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    renderedWidgetData();
  }, []);

  useEffect(() => {
    if (widgetData?.length > 0) {
      let updatedWidgetData = widgetData.reduce((p, c) => {
        let matchCase = permission.filter((i) => {
          return i.name.toLowerCase() === c.to.replace("/", "");
        });
        if (matchCase[0]) {
          c.permission = matchCase[0];
        }
        p.push(c);
        return p;
      }, []);
      setWidgetData(updatedWidgetData);
    }
  }, [permission]);

  const renderedWidgetData = useCallback(async () => {
    setLoading(true);
    await axios
      .get("dashboard/get-staticstics")
      .then((res) => {
        const data = widgetData;
        data[0].count = res.data.data.activeUsers || 0;
        data[1].count = res.data.data.totalUsers || 0;
        data[2].count = res.data.data.categories || 0;
        data[3].count = res.data.data.materials || 0;
        data[4].count = res.data.data.models || 0;
        data[5].count = res.data.data.projects || 0;

        setWidgetData(data);
        setLoading(false);
      })
      .catch((error) => {
        dispatch(
          showUpdatedToasterMessage({
            message: "Failed to fetch users",
            type: "danger",
          })
        );
        return Promise.reject(error?.response.data);
      });
  }, []);

  return { widgetData, loading };
};

export default useDashboard;
