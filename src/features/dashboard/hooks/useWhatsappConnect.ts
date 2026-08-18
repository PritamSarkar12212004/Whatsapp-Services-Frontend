import { whatsappConnect } from "@/features/dashboard/api/whatsapp.connect.api";
import { useMutation } from "@tanstack/react-query";

export const useWhatsappConnect = () => {
    return useMutation({
        mutationFn: whatsappConnect,
    });
};