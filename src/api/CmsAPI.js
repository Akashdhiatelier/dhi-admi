import axios from "axios";
export const getOne = async (slug,payload) => {
	return await axios
		.get("/cms/"+slug)
		.then((res) => {
			return res.data
		})
		.catch((error) => Promise.reject(error?.response.data));
};
export const update = async (slug, payload) => {
	return await axios
		.put("/cms/" + slug, payload)
		.then((res) => {
			return res.data
		})
		.catch((error) => Promise.reject(error?.response.data));
};