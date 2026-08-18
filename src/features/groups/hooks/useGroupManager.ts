import {
    deleteGroupManager,
    getGroupManager,
    getGroupWarnings,
    saveGroupManager,
    type GroupManagerConfig,
} from "@/features/groups/api/groupManager.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGroupManager = (jid?: string) => {
    return useQuery({
        queryKey: ["group-manager", jid],
        queryFn: () => getGroupManager(jid!),
        enabled: Boolean(jid),
    });
};

export const useSaveGroupManager = (jid?: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: Omit<GroupManagerConfig, "_id" | "userId" | "createdAt" | "updatedAt">) =>
            saveGroupManager(jid!, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["group-manager", jid] });
        },
    });
};

export const useDeleteGroupManager = (jid?: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => deleteGroupManager(jid!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["group-manager", jid] });
        },
    });
};

export const useGroupWarnings = (jid?: string) => {
    return useQuery({
        queryKey: ["group-warnings", jid],
        queryFn: () => getGroupWarnings(jid!),
        enabled: Boolean(jid),
        refetchInterval: 15000,
    });
};
