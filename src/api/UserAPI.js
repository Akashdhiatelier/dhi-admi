import axios from "axios";
const headers = {     
    headers: { 'Content-Type': 'multipart/form-data' }
}
export const getAll = async (param, extra = "") => {
	let filter =
		"?" +
		extra +
		(param
			? Object.keys(param)
					.filter((key) => param[key] !== "")
					.map(function (key) {
						return encodeURIComponent(key) + "=" + encodeURIComponent(param[key]);
					})
					.join("&")
			: "");
	return await axios
		.get("users/get-all" + filter)
		.then((res) => {
			return res.data
		})
		.catch((error) => Promise.reject(error?.response.data));
};
export const getOne = async (id) => {
	return await axios
		.get("users/get/" + id)
		.then((res) => {
			return res.data
		})
		.catch((error) => Promise.reject(error?.response.data));
};
export const create = async (payload) => {
	return await axios
		.post("auth/register", payload,headers)
		.then((res) => {
			return res.data
		})
		.catch((error) => Promise.reject(error?.response.data));
};
export const update = async (id, payload) => {
	return await axios
		.put("users/update/" + id, payload,headers)
		.then((res) => {
			return res.data
		})
		.catch((error) => Promise.reject(error?.response.data));
};
export const remove = async (id) => {
	return await axios
		.put("users/delete/" + id)
		.then((res) => {
			return res.data
		})
		.catch((error) => Promise.reject(error?.response.data));
};
export const multiUpdate = async (payload) => {
	return await axios
		.put("users/multi-update", payload)
		.then((res) => {
			return res.data
		})
		.catch((error) => Promise.reject(error?.response.data));
};
export const multiRemove = async (payload) => {
	return await axios
		.put("users/multi-delete", payload)
		.then((res) => {
			return res.data
		})
		.catch((error) => Promise.reject(error?.response.data));
};
export const getProfile = async (payload) => {
	return await axios
		.get("profile/get")
		.then((res) => {
			return res.data
		})
		.catch((error) => Promise.reject(error?.response.data));
};
export const updateProfile = async (payload) => {
	return await axios
		.put("profile/update",payload,headers)
		.then((res) => {
			return res.data
		})
		.catch((error) => Promise.reject(error?.response.data));
};
export const updatePassword = async (payload) => {
	return await axios
		.put("profile/set-password/", payload)
		.then((res) => {
			return res.data
		})
		.catch((error) => Promise.reject(error?.response.data));
};
export const removeAccount = async () => {
	return await axios
		.put("profile/delete-profile")
		.then((res) => {
			return res.data
		})
		.catch((error) => Promise.reject(error?.response.data));
};