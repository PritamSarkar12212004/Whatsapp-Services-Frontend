import { useQueryClient } from "@tanstack/react-query";
import { useStoreWhatsappAccount } from "@/store/zustand/whatsapp/useStoreWhatsappAccount";

/**
 * Switch the number the app works as.
 *
 * Everything cached belongs to the previous number (bots, groups, status), so
 * the cache is dropped and the open screens refetch with the new header. The
 * selection itself is persisted, so a reload keeps the same number.
 */
export const useSwitchAccount = () => {
    const qc = useQueryClient();
    const activeAccountId = useStoreWhatsappAccount((s) => s.activeAccountId);
    const setActiveAccount = useStoreWhatsappAccount((s) => s.setActiveAccount);

    const switchTo = async (accountId: string | null) => {
        const next = accountId ?? null;
        if (next === activeAccountId) return;

        setActiveAccount(next);
        await qc.cancelQueries();
        qc.clear(); // observers refetch under the newly selected number
    };

    return { activeAccountId, switchTo };
};
