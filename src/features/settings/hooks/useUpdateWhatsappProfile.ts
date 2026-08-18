import {
    updateWhatsappProfileAbout,
    updateWhatsappProfileName,
    updateWhatsappProfilePicture,
} from "@/features/settings/api/whatsapp.profile.api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useUpdateWhatsappProfile = () => {
    const queryClient = useQueryClient();

    const invalidateProfile = () => {
        queryClient.invalidateQueries({ queryKey: ["whatsapp-profile"] });
    };

    const updateName = useMutation({
        mutationFn: updateWhatsappProfileName,
        onSuccess: invalidateProfile,
    });

    const updateAbout = useMutation({
        mutationFn: updateWhatsappProfileAbout,
        onSuccess: invalidateProfile,
    });

    const updatePicture = useMutation({
        mutationFn: updateWhatsappProfilePicture,
        onSuccess: invalidateProfile,
    });

    return { updateName, updateAbout, updatePicture };
};
