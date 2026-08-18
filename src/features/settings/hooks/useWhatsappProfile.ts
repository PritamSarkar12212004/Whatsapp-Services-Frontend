import { whatsappProfile } from "@/features/settings/api/whatsapp.profile.api";
import { useQuery } from "@tanstack/react-query";

export const useWhatsappProfile = () => {
    return useQuery({
        queryKey: ["whatsapp-profile"],
        queryFn: whatsappProfile,
        retry: 1,
    });
};
