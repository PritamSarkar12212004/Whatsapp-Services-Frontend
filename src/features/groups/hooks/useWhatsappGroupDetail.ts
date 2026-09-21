import { whatsappGroupDetail } from "@/features/groups/api/whatsapp.group.api";
import { useQuery } from "@tanstack/react-query";

export const useWhatsappGroupDetail = (jid?: string) => {
    return useQuery({
        queryKey: ["whatsapp-group-detail", jid],
        queryFn: () => whatsappGroupDetail(jid!),
        enabled: Boolean(jid),
        // The lookup runs live on WhatsApp, so a group already read in the last
        // few minutes is served straight from cache — no second wait.
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
};
