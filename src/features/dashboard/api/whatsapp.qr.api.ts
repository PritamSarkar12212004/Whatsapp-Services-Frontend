import apiConst from "@/consts/api/apiConst";
import api from "@/utils/api/api";
import type { WhatsappQRResponse } from "@/features/dashboard/types/whatsapp.types";

export const whatsappQR = async (): Promise<WhatsappQRResponse> => {
    const response = await api.get(apiConst.Whatsapp.qr);
    return response.data;
};