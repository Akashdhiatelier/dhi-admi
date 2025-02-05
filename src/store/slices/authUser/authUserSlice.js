import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  first_name: "",
  last_name: "",
  email: "",
  avatar: "",
  avatar_url: "",
  auth: "",
  role: "",
  token:"",
  permissions: ""
};

export const authUserSlice = createSlice({
  name: "authUser",
  initialState,
  reducers: {
    addAuthData: (state, action) => {
      state.first_name = action.payload.first_name;
      state.last_name = action.payload.last_name;
      state.email = action.payload.email;
      state.avatar = action.payload.avatar;
      state.avatar_url = action.payload.avatar_url;
      state.auth = action.payload.auth;
      state.role = action.payload.role;
      state.token = action.payload.token
      state.permissions = action.payload.permissions;
    },

    resetAuthData: (state, action) => {
      state.first_name = "";
      state.last_name = "";
      state.email = "";
      state.avatar = "";
      state.avatar_url = "";
      state.auth = "";
      state.role = "";
      state.token="";
      state.permissions = "";
    },
  },
});

export const { addAuthData, resetAuthData } = authUserSlice.actions;

export default authUserSlice.reducer;
