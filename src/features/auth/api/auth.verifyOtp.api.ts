import apiConst from "@/consts/api/apiConst";
import api from "@/utils/api/api";

interface VerifyOtpApiPayload {
    phone: string;
    otp: string;
}

export const verifyOtpApi = async (data: VerifyOtpApiPayload) => {
    const response = await api.post(apiConst.AUTH.verify_otp, data);
    return response.data;
};