import axios from "axios";
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
		.get("/categories/get-all" + filter)
		.then((res) => {
			return res.data
		})
		.catch((error) => Promise.reject(error?.response.data));
};
export const getOne = async (id) => {
	return await axios
		.get("/categories/get/" + id)
		.then((res) => {
			return res.data
		})
		.catch((error) => Promise.reject(error?.response.data));
};
export const create = async (payload) => {
	return await axios
		.post("/categories/add", payload)
		.then((res) => {
			return res.data
		})
		.catch((error) => Promise.reject(error?.response.data));
};
export const update = async (id, payload) => {
	return await axios
		.put("/categories/update/" + id, payload)
		.then((res) => {
			return res.data
		})
		.catch((error) => Promise.reject(error?.response.data));
};
export const remove = async (id) => {
	return await axios
		.put("/categories/delete/" + id)
		.then((res) => {
			return res.data
		})
		.catch((error) => Promise.reject(error?.response.data));
};
export const multiUpdate = async (payload) => {
	return await axios
		.put("categories/multi-update", payload)
		.then((res) => {
			return res.data
		})
		.catch((error) => Promise.reject(error?.response.data));
};
export const multiRemove = async (payload) => {
	return await axios
		.put("categories/multi-delete", payload)
		.then((res) => {
			return res.data
		})
		.catch((error) => Promise.reject(error?.response.data));
};
