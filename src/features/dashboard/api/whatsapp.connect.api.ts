import apiConst from "@/consts/api/apiConst";
import api from "@/utils/api/api";

export const whatsappConnect = async () => {
    const response = await api.post(apiConst.Whatsapp.connect);
    return response.data;
};