import axios from "axios";
const headers = {     
    headers: { 'Content-Type': 'multipart/form-data' }
}
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
		.get("models/get-all" + filter)
		.then((res) => {
			return res.data
		})
		.catch((error) => Promise.reject(error?.response.data));
};
export const get = async (keyword) => {
	return await axios
		.get("models/get?q="+keyword)
		.then((res) => {
			return res.data
		})
		.catch((error) => Promise.reject(error?.response.data));
};
export const getOne = async (id) => {
	return await axios
		.get("models/get/" + id)
		.then((res) => {
			return res.data
		})
		.catch((error) => Promise.reject(error?.response.data));
};
export const create = async (payload) => {
	return await axios
		.post("models/add", payload,headers)
		.then((res) => {
			return res.data
		})
		.catch((error) => Promise.reject(error?.response.data));
};
export const update = async (id, payload) => {
	return await axios
		.put("models/update/" + id, payload,headers)
		.then((res) => {
			return res.data
		})
		.catch((error) => Promise.reject(error?.response.data));
};
export const upload = async (id, payload) => {
	return await axios
		.put("models/upload/" + id, payload,headers)
		.then((res) => {
			return res.data
		})
		.catch((error) => Promise.reject(error?.response.data));
};
export const updateConfig = async (id, payload) => {
	return await axios
		.put("models/update-model-config/" + id, payload)
		.then((res) => {
			return res.data
		})
		.catch((error) => Promise.reject(error?.response.data));
};
export const remove = async (id) => {
	return await axios
		.put("models/delete/" + id)
		.then((res) => {
			return res.data
		})
		.catch((error) => Promise.reject(error?.response.data));
};
export const multiUpdate = async (payload) => {
	return await axios
		.put("models/multi-update", payload)
		.then((res) => {
			return res.data
		})
		.catch((error) => Promise.reject(error?.response.data));
};
export const multiRemove = async (payload) => {
	return await axios
		.put("models/multi-delete", payload)
		.then((res) => {
			return res.data
		})
		.catch((error) => Promise.reject(error?.response.data));
};
export const createVariation = async (id, payload) => {
	return await axios
		.post("models/create-variation/" + id, payload,headers)
		.then((res) => {
			return res.data
		})
		.catch((error) => Promise.reject(error?.response.data));
};
export const updateVariation = async (payload) => {
	return await axios
		.put("models/update-variation", payload,headers)
		.then((res) => {
			return res.data
		})
		.catch((error) => Promise.reject(error?.response.data));
};
export const removeVariation = async (id) => {
	return await axios
		.delete("models/delete-variation/"+id)
		.then((res) => {
			return res.data
		})
		.catch((error) => Promise.reject(error?.response.data));
};