import axios from "axios";
import apiConst from "../../consts/api/apiConst";
import { useStoreToken } from "@/store/zustand/token/useStoreToken";

const api = axios.create({
  baseURL: apiConst.BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = useStoreToken.getState().token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;