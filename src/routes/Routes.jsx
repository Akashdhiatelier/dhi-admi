import React, { lazy } from "react";
import { Navigate } from "react-router-dom";
import CmsSettings from "../page/AccountSettings/CmsSettings";
import ColorManagement from "../page/AccountSettings/ColorManagement";
import Notifications from "../page/AccountSettings/Notifications";

const Demo = lazy(() => import("../page/Projects/Demo"));

const Login = lazy(() => import("../page/Authentication/Login"));
const ComingSoon = lazy(() => import("../components/ComingSoon"));
const ProtectedRoute = lazy(() => import("./ProtectedRoute"));
const ForgotPassword = lazy(() =>
  import("../page/Authentication/ForgotPassword")
);

const ResetPassword = lazy(() =>
  import("../page/Authentication/ResetPassword")
);
const Dashboard = lazy(() => import("../page/Dashboard/Dashboard"));
const Models = lazy(()=> import("../page/Models/Models"));
const Categories = lazy(() => import("../page/categories/Categories"));
const Materials = lazy(() => import("../page/Materials/Materials"));

const AccountSettings = lazy(()=>import("../page/AccountSettings"));
const MyAccount = lazy(() => import("../page/AccountSettings/MyAccount"));
const Projects = lazy(() => import("../page/Projects/Projects"));

const Logout = lazy(() => import("../page/Authentication/Logout"));
const ErrorPage = lazy(() => import("../page/ErrorPage"));
const RolesAndPermission = lazy(() =>
  import("../page/RolesAndPermission/RolesAndPermission")
);
const Users = lazy(() => import("../page/Users/Users"));


// const adminRoutes = [
//   {
//     path: "/",
//     element: <ProtectedRoute redirectPath="/login" />,
//     children: [
//       {
//         index: true,
//         path: "",
//         element: <Dashboard />,
//       },
//       {
//         path: "dashboard",
//         element: <Dashboard />,
//       },
//       {
//         path: "users",
//         element: <Users />,
//       },
//       {
//         path: "categories",
//         element: <ComingSoon title="Categories" />,
//       },
//       {
//         path: "materials",
//         element: <ComingSoon title="Materials" />,
//       },
//       {
//         path: "models",
//         element: <ComingSoon title="Models" />,
//       },
//       {
//         path: "projects",
//         element: <ComingSoon title="Projects" />,
//       },
//       {
//         path: "roles",
//         // element: <ComingSoon title="Roles & Permission" />
//         element: <RolesAndPermission title="Roles & Permission" />,
//       },
//       {
//         path: "profile",
//         element: <MyProfile />,
//       },
//       {
//         path: "logout",
//         element: <Logout />,
//       },
//     ],
//   },
//   {
//     path: "*",
//     element: <ErrorPage />,
//   },
// ];

const unauthorizedRoutes = [
  {
    path: "/",
    children: [
      {
        index: true,
        element: <Login />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "logout",
        element: <Logout />,
      },
      {
        path: "/forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "/reset-password/:token",
        element: <ResetPassword />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/login" replace={true} />,
  },
];

const getRoles = (role, permissions, auth) => {
  let parserPermission;
  if (permissions) {
    parserPermission = JSON.parse(atob(permissions));
  }

  let arr = [
    {
      path: "/",
      element: <ProtectedRoute redirectPath="/login" auth={auth} />,
      children: [
        {
          path: "logout",
          element: <Logout />,
        },
      ],
    },
    { path: "*", element: <ErrorPage /> },
  ];

  const generateRoles = (module) => {
    switch (true) {
      case module.name === "Dashboard":
        if (module.read) {
          arr[0]?.children?.unshift(
            {
              index: true,
              path: "",
              element: <Dashboard permission={parserPermission} />,
            },
            {
              path: "dashboard",
              element: <Dashboard permission={parserPermission} />,
            },
            {
              path: "demo",
              element: <Demo />,
            }
          );
        }
        break;
      case module.name === "Users":
        if (module.read) {
          arr[0]?.children?.push({
            path: "users",
            element: <Users permission={module} />,
          });
        }
        break;
      case module.name === "Categories":
        if (module.read) {
          arr[0]?.children?.push({
            path: "categories",
            element: <Categories permission={module}/>,
          });
        }
        break;
      case module.name === "Materials":
        if (module.read) {
          arr[0]?.children?.push({
            path: "materials",
            element: <Materials permission={module}/>,
          });
        }
        break;
      case module.name === "Models":
        if (module.read) {
          arr[0]?.children?.push({
            path: "models",
            element: <Models permission={module} />,
          });
        }
        break;
      case module.name === "Projects":
        if (module.read) {
          arr[0]?.children?.push({
            path: "projects",
            element: <Projects permission={module} />,
            // element:<ComingSoon title="" />
          });
        }
        break;
      case module.name === "Role & Permission":
        if (module.read) {
          arr[0]?.children?.push({
            path: "roles",
            element: (
              <RolesAndPermission permission={module} />
            ),
          });
        }
        break;
      case module.name === "My Profile":
        if (module.read) {
          arr[0]?.children?.push({
            path: "profile",
            element: <MyAccount permission={module} />,
          });
        }
        break;
      case module.name === "Settings":
        arr[0]?.children?.push(
          {
            path:"settings",
            element:<AccountSettings />,
            children:[
              {
                path:"my-account",
                element:<MyAccount />
              },
              {
                path:"notifications",
                element:<Notifications />
              },
              {
                path:"color-management",
                element:<ColorManagement />
              },
              {
                path:"about-us",
                element:<CmsSettings title="About Us" slug="aboutus" />
              },
              {
                path:"privacy-policy",
                element:<CmsSettings title="Privacy Policy" slug="privacypolicy" />
              },
              {
                path:"terms-of-use",
                element:<CmsSettings title="Terms of Use" slug="termofuse" />
              }
            ]
          }
        );
        break;
      default:
        break;
    }
  };

  parserPermission.forEach((item) => {
    generateRoles(item);
  });

  return arr;
};

export const Routes = (role, permissions, auth) => {
  return role === "undefined"
    ? unauthorizedRoutes
    : getRoles(role, permissions, auth);
};
