import axios from "axios";

const BaseAPI: string = "http://192.168.100.108"
const Port: string = "8000"

const axiosInstance = axios.create({
    baseURL: `${BaseAPI}:${Port}`,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("authToken");
        if (token && !config.url?.includes("/auth-token/")) {
            config.headers.Authorization = `Token ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);



export default axiosInstance;