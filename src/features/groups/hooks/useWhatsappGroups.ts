import { whatsappGroups } from "@/features/groups/api/whatsapp.groups.api";
import { useQuery } from "@tanstack/react-query";

export const useWhatsappGroups = () => {
    return useQuery({
        queryKey: ["whatsapp-groups"],
        queryFn: whatsappGroups,
        refetchOnWindowFocus: false,
    });
};
