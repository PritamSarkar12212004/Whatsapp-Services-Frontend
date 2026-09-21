import { whatsappDisconnect } from "@/features/dashboard/api/whatsapp.disconnect.api";
import { useMutation } from "@tanstack/react-query";

/**
 * Full WhatsApp logout (POST /whatsapp/disconnect) — used as the last-resort
 * recovery when a session is stuck and no QR code ever shows up.
 */
export const useWhatsappDisconnect = () => {
    return useMutation({
        mutationFn: whatsappDisconnect,
    });
};
