import apiConst from "@/consts/api/apiConst";
import api from "@/utils/api/api";

interface CallOtpApiPayload {
    phone: string;
}

export const callOtpApi = async (data: CallOtpApiPayload) => {
    const response = await api.post(apiConst.AUTH.callAuthOtp, data);
    return response.data;
};