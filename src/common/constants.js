import {
  IconBrandAirtable,
  IconFolder,
  IconHome2,
  IconLayersSubtract,
  IconListDetails,
  IconLogout,
  IconSettings,
  IconUser,
  IconUserPlus,
  IconUsers,
} from "@tabler/icons-react";

export const NAV_ITEMS = [
  {
    name: "Dashboard",
    to: "/dashboard",
    icon: <IconHome2 size={20} stroke={1.2} className="nav-icon me-2" />,
  },
  {
    name: "Users",
    to: "/users",
    icon: <IconUsers size={20} stroke={1.2} className="nav-icon me-2" />,
  },
  {
    name: "Categories",
    to: "/categories",
    icon: <IconListDetails size={20} stroke={1.2} className="nav-icon me-2" />,
  },
  {
    name: "Materials",
    to: "/materials",
    icon: (
      <IconLayersSubtract size={20} stroke={1.2} className="nav-icon me-2" />
    ),
  },
  {
    name: "Models",
    to: "/models",
    icon: (
      <IconBrandAirtable size={20} stroke={1.2} className="nav-icon me-2" />
    ),
  },
  {
    name: "Projects",
    to: "/projects",
    icon: <IconFolder size={20} stroke={1.2} className="nav-icon me-2" />,
  },
  {
    name: "Role & Permission",
    to: "/roles",
    icon: <IconUserPlus size={20} stroke={1.2} className="nav-icon me-2" />,
  },
];

export const ACCOUNT_DROPDOWN_ITEMS = [
  {
    icon: <IconUser size={20} stroke={1.2} className="nav-icon me-2" />,
    value: "My Profile",
    to: "",
  },
  {
    icon: <IconSettings size={20} stroke={1.2} className="nav-icon me-2" />,
    value: "Settings",
    to: "/settings/my-account",
  },
  {
    icon: <IconLogout size={20} stroke={1.2} className="nav-icon me-2" />,
    value: "Logout",
    to: "/logout",
  },
];

export const PAGE_LENGTH = [10, 25, 50, 100];

export const ROLES = [
  {
    roleName: "ADMIN",
  },
  {
    roleName: "USER",
  },
];

export const ROLE_TYPES = {
  read: false,
  write: false,
  update: false,
  delete: false,
};
export const ROLE_TYPES_TRUE = {
  read: true,
  write: true,
  update: true,
  delete: true,
};

export const ROLE_MODULES = [
  {
    name: "Dashboard",
    ...ROLE_TYPES,
  },
  {
    name: "Users",
    ...ROLE_TYPES,
  },
  {
    name: "Categories",
    ...ROLE_TYPES,
  },
  {
    name: "Materials",
    ...ROLE_TYPES,
  },
  {
    name: "Models",
    ...ROLE_TYPES,
  },
  {
    name: "Projects",
    ...ROLE_TYPES,
  },
  {
    name: "Role & Permission",
    ...ROLE_TYPES,
  },
  {
    name: "My Profile",
    read: true,
    write: true,
    update: true,
    delete: true,
  },
  {
    name: "Settings",
    read: true,
    write: true,
    update: true,
    delete: true,
  },
];
export const DEFAULT_CONFIRM_MODAL = {
  show: false,
  isLoading: false,
  title: "Are you sure?",
  description:
    "Do you really want to remove this data? what you've done can't be undone.",
  actionBtnText: "Delete",
  action: "Delete",
};
