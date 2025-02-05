
import axios from "axios";
export const login = async (payload)=>{
    return await axios.post("auth/login",payload).then((res)=>{
        return res.data
    }).catch((error) =>Promise.reject(error?.response.data));
}
export const forgotPassword = async (payload)=>{
    return await axios.post("auth/forgot-password",payload).then((res)=>{
        return res.data
    }).catch((error) =>Promise.reject(error?.response.data));
}
export const verify = async (token)=>{
    return await axios.get("auth/verify/"+token).then((res)=>{
        return res.data
    }).catch((error) =>Promise.reject(error?.response.data));
}
export const resetPassword = async (token,payload)=>{
    return await axios.put("auth/reset-password/"+token,payload).then((res)=>{
        return res.data
    }).catch((error) =>Promise.reject(error?.response.data));
}
export const logout = async ()=>{
    return await axios.get("logout").then((res)=>{
        return res.data
    }).catch((error) =>Promise.reject(error?.response.data));
}