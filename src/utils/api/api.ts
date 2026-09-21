import axios from "axios";
import apiConst from "../../consts/api/apiConst";
import { useStoreToken } from "@/store/zustand/token/useStoreToken";
import { useStoreWhatsappAccount } from "@/store/zustand/whatsapp/useStoreWhatsappAccount";

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

    // Which WhatsApp number this call is about. Missing header = the primary
    // number, so older clients and background jobs keep working unchanged.
    const accountId = useStoreWhatsappAccount.getState().activeAccountId;

    if (accountId) {
      config.headers["x-wa-account"] = accountId;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;