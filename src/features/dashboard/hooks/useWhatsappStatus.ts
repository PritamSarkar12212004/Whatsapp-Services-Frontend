import { whatsappSatus } from "@/features/dashboard/api/whatsapp.status.api";
import { useStoreWhatsappAccount } from "@/store/zustand/whatsapp/useStoreWhatsappAccount";
import { useQuery } from "@tanstack/react-query";

/** Status of the number the app is currently acting as. */
export const useWhatsappStatus = () => {
    const activeAccountId = useStoreWhatsappAccount((s) => s.activeAccountId);

    return useQuery({
        // Per number, so switching never shows the previous number's state.
        queryKey: ["whatsapp-status", activeAccountId],
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