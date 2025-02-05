import { combineReducers } from "redux";

import counterReducer from "./slices/counter/counterSlice";
import toasterReducer from "./slices/toaster/toasterslice";
import authUserReducer from "./slices/authUser/authUserSlice";

export default combineReducers({
  counterReducer,
  toasterReducer,
  authUserReducer,
});
