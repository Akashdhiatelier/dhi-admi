import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  show: false,
  isHeader: false,
  message: "",
  type: "",
  delay: 3000,
};

export const toasterSlice = createSlice({
  name: "toaster",
  initialState,
  reducers: {
    showUpdatedToasterMessage: (state, action) => {
      state.show = true;
      state.isHeader = action.payload?.isHeader || false;
      state.message = action.payload.message;
      state.type = action.payload.type;
      state.delay = action.payload?.delay || 3000;
    },
    resetToaster: (state) => {
      state.show = false;
      state.message = "";
      state.type = "";
    },
  },
});

export const { showUpdatedToasterMessage, resetToaster } = toasterSlice.actions;

export default toasterSlice.reducer;
