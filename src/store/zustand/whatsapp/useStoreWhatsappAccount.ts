import zustandConst from "@/consts/zustand/zustandConst";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Which WhatsApp number the app is working as.
 *
 * `null` is the primary number — the one the account was created with. Every
 * API call carries this as the `x-wa-account` header (see utils/api/api.ts), so
 * sessions, QR codes, bots and group rules all follow the selection.
 */
interface WhatsappAccountStore {
    activeAccountId: string | null;
    setActiveAccount: (accountId: string | null) => void;
}

export const useStoreWhatsappAccount = create<WhatsappAccountStore>()(
    persist(
        (set) => ({
            activeAccountId: null,

            setActiveAccount: (accountId) => {
                set({ activeAccountId: accountId ?? null });
            },
        }),
        {
            name: zustandConst.whatsappAccount,
            storage: createJSONStorage(() => localStorage),
        },
    ),
);
