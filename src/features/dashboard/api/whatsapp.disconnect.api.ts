import apiConst from "@/consts/api/apiConst";
import api from "@/utils/api/api";

/**
 * Full WhatsApp logout — unlinks the device and deletes the stored credentials,
 * so the next connect is guaranteed to hand out a fresh QR code. Used by the
 * connect screen when a session is wedged and no QR ever arrives.
 */
export const whatsappDisconnect = async () => {
    const response = await api.post(apiConst.Whatsapp.disconnect);
    return response.data;
};
