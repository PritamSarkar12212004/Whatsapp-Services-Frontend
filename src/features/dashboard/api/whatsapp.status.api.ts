import apiConst from "@/consts/api/apiConst";
import api from "@/utils/api/api";
import type { WhatsappStatusResponse } from "@/features/dashboard/types/whatsapp.types";

export const whatsappSatus = async (): Promise<WhatsappStatusResponse> => {
    const response = await api.get(apiConst.Whatsapp.status);
    return response.data;
};