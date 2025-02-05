import axios from "axios";
export const getAll = async (param) => {
	let filter =
		"?" +
		(param
			? Object.keys(param)
					.filter((key) => param[key] !== "")
					.map(function (key) {
						return encodeURIComponent(key) + "=" + encodeURIComponent(param[key]);
					})
					.join("&")
			: "");
	return await axios
		.get("roles/get-all" + filter)
		.then((res) => {
			return res.data
		})
		.catch((error) => Promise.reject(error?.response.data));
};
export const getOne = async (id) => {
	return await axios
		.get("role-permission/get/" + id)
		.then((res) => {
			return res.data
		})
		.catch((error) => Promise.reject(error?.response.data));
};
export const create = async (payload) => {
	return await axios
		.post("/role-permission/add", payload)
		.then((res) => {
			return res.data
		})
		.catch((error) => Promise.reject(error?.response.data));
};
export const update = async (id, payload) => {
	return await axios
		.put("role-permission/update/" + id, payload)
		.then((res) => {
			return res.data
		})
		.catch((error) => Promise.reject(error?.response.data));
};
export const remove = async (id) => {
	return await axios
		.put("roles/delete/" + id)
		.then((res) => {
			return res.data
		})
		.catch((error) => Promise.reject(error?.response.data));
};
export const multiUpdate = async (payload) => {
	return await axios
		.put("roles/multi-update", payload)
		.then((res) => {
			return res.data
		})
		.catch((error) => Promise.reject(error?.response.data));
};
export const multiRemove = async (payload) => {
	return await axios
		.put("roles/multi-delete", payload)
		.then((res) => {
			return res.data
		})
		.catch((error) => Promise.reject(error?.response.data));
};

export const getAllRoleModule = async () => {
	return await axios
		.get("modules/get-all")
		.then((res) => {
			return res.data
		})
		.catch((error) => Promise.reject(error?.response.data));
};