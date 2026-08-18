import { verifyOtpApi } from "@/features/auth/api/auth.verifyOtp.api";
import { useMutation } from "@tanstack/react-query";

export const useVerifyOtp = () => {
    return useMutation({
        mutationFn: verifyOtpApi,
    });
};