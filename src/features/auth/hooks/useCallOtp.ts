import { callOtpApi } from "@/features/auth/api/auth.callOtp.api";
import { useMutation } from "@tanstack/react-query";

export const useCallOtp = () => {
    return useMutation({
        mutationFn: callOtpApi,
    });
};