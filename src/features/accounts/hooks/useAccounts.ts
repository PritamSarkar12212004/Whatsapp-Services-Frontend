import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createAccount,
    fetchAccounts,
    removeAccount,
    renameAccount,
} from "../api/accounts.api";

/** Every number on this login, with its live connection state. */
export const useAccounts = () =>
    useQuery({
        queryKey: ["whatsapp-accounts"],
        queryFn: fetchAccounts,
        // Status (and the QR) has to advance on its own while a number links.
        refetchInterval: (query) => {
            const accounts = query.state.data;
            if (!accounts?.length) return 10000;
            const busy = accounts.some(
                (a) =>
                    a.status === "connecting" ||
                    a.status === "qr_required" ||
                    a.status === "disconnected",
            );
            return busy ? 2500 : false;
        },
        refetchOnWindowFocus: false,
    });

export const useCreateAccount = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (input: { label: string; phoneNumber: string }) =>
            createAccount(input),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["whatsapp-accounts"] }),
    });
};

export const useRenameAccount = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ accountId, label }: { accountId: string; label: string }) =>
            renameAccount(accountId, label),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["whatsapp-accounts"] }),
    });
};

export const useRemoveAccount = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (accountId: string) => removeAccount(accountId),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["whatsapp-accounts"] }),
    });
};
