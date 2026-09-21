import apiConst from "@/consts/api/apiConst";
import api from "@/utils/api/api";

export interface WhatsappConnectPayload {
    /**
     * Rebuild the socket even if one already exists. The backend only restarts
     * a healthy connection when this is set, so a session wedged in
     * "connecting" (no QR, no open) can actually be cleared from the UI.
     */
    force?: boolean;
}

export const whatsappConnect = async (payload?: WhatsappConnectPayload) => {
    const response = await api.post(apiConst.Whatsapp.connect, payload ?? {});
    return response.data;
};