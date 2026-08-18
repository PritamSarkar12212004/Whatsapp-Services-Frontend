import { whatsappQR } from "@/features/dashboard/api/whatsapp.qr.api";
import { useQuery } from "@tanstack/react-query";

export const useWhatsappQR = () => {
    return useQuery({
        queryKey: ["whatsapp-qr"],
        queryFn: whatsappQR,
        enabled: false,
    });
};