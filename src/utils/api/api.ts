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

/**
 * A request can fail because of the selected number and not because anything is
 * broken:
 *   - the number was removed (or belongs to someone else) → 404 from the API,
 *   - the deployed backend does not allow the `x-wa-account` header yet, so the
 *     browser's preflight blocks the request and axios reports no response.
 *
 * In both cases the answer is the same: drop the header, keep the app working
 * on the primary number, and remember that by clearing the selection. Only one
 * retry per request, and only when a number was actually selected — a plain
 * network outage still surfaces as an error.
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error?.config as
      | (typeof error.config & { _waAccountRetried?: boolean })
      | undefined;

    const usedAccountHeader = Boolean(config?.headers?.["x-wa-account"]);

    if (!config || !usedAccountHeader || config._waAccountRetried) {
      return Promise.reject(error);
    }

    const status = error?.response?.status;
    const message = String(error?.response?.data?.message ?? "");

    const method = String(config.method ?? "get").toUpperCase();

    // "Unknown account" means the API refused the request before it ran, so
    // retrying is safe for any method.
    const rejectedNumber =
      (status === 404 || status === 400) && /whatsapp account/i.test(message);

    // No response at all is different: the server may well have processed it
    // (the reply just never made it back), so only read-only calls are retried —
    // never a create or a send.
    const blockedBeforeSending = !error?.response && method === "GET";

    if (!rejectedNumber && !blockedBeforeSending) {
      return Promise.reject(error);
    }

    config._waAccountRetried = true;
    delete config.headers["x-wa-account"];
    useStoreWhatsappAccount.getState().setActiveAccount(null);

    console.warn(
      "[whatsapp] The selected number was not accepted by the server — " +
        "continued with the primary number instead.",
    );

    return api.request(config);
  }
);

export default api;