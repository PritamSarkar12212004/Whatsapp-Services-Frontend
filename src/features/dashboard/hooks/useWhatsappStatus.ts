import { whatsappSatus } from "@/features/dashboard/api/whatsapp.status.api";
import { useQuery } from "@tanstack/react-query";

export const useWhatsappStatus = () => {
    return useQuery({
        queryKey: ["whatsapp-status"],
        queryFn: whatsappSatus,
        // Keep polling until the WhatsApp session is fully connected so the
        // state machine advances on its own (e.g. after logout the app goes
        // logged_out -> connecting -> qr_required -> connected).
        refetchInterval: (query) => {
            const status = query.state.data?.status;
            return status === "connected" ? false : 2500;
        },
    });
};