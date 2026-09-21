import { whatsappQR } from "@/features/dashboard/api/whatsapp.qr.api";
import { useStoreWhatsappAccount } from "@/store/zustand/whatsapp/useStoreWhatsappAccount";
import { useQuery } from "@tanstack/react-query";

/** QR code of the number the app is currently acting as. */
export const useWhatsappQR = () => {
    const activeAccountId = useStoreWhatsappAccount((s) => s.activeAccountId);

    return useQuery({
        queryKey: ["whatsapp-qr", activeAccountId],
        queryFn: whatsappQR,
        enabled: false,
    });
};