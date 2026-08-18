import { whatsappGroupDetail } from "@/features/groups/api/whatsapp.group.api";
import { useQuery } from "@tanstack/react-query";

export const useWhatsappGroupDetail = (jid?: string) => {
    return useQuery({
        queryKey: ["whatsapp-group-detail", jid],
        queryFn: () => whatsappGroupDetail(jid!),
        enabled: Boolean(jid),
        refetchOnWindowFocus: false,
    });
};
