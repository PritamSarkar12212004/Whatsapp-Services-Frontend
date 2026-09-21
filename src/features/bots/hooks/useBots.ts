import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    attachBotToGroup,
    createBot,
    deleteBot,
    detachBotFromGroup,
    duplicateBot,
    fetchBot,
    fetchBots,
    fetchGroupBots,
    setBotStatus,
    simulateBot,
    updateBot,
} from "../api/bots.api";
import type { Bot, BotInput, BotStatus } from "../types/bot.types";

export const useBots = () =>
    useQuery({
        queryKey: ["bots"],
        queryFn: fetchBots,
        refetchInterval: 15000,
    });

export const useBot = (id?: string | null) =>
    useQuery({
        queryKey: ["bots", id],
        queryFn: () => fetchBot(id as string),
        enabled: !!id,
    });

export const useGroupBots = (jid?: string | null) =>
    useQuery({
        queryKey: ["bots", "group", jid],
        queryFn: () => fetchGroupBots(jid as string),
        enabled: !!jid,
        refetchInterval: 15000,
    });

/** Invalidate every bot-related query after a mutation. */
const useBotInvalidate = () => {
    const qc = useQueryClient();
    return (id?: string) => {
        qc.invalidateQueries({ queryKey: ["bots"] });
        if (id) qc.invalidateQueries({ queryKey: ["bots", id] });
    };
};

export const useCreateBot = () => {
    const invalidate = useBotInvalidate();
    return useMutation({
        mutationFn: (input: BotInput) => createBot(input),
        onSuccess: () => invalidate(),
    });
};

export const useUpdateBot = () => {
    const invalidate = useBotInvalidate();
    return useMutation({
        mutationFn: ({ id, input }: { id: string; input: BotInput }) =>
            updateBot(id, input),
        onSuccess: (_data, vars) => invalidate(vars.id),
    });
};

export const useDeleteBot = () => {
    const invalidate = useBotInvalidate();
    return useMutation({
        mutationFn: (id: string) => deleteBot(id),
        onSuccess: () => invalidate(),
    });
};

export const useDuplicateBot = () => {
    const invalidate = useBotInvalidate();
    return useMutation({
        mutationFn: (id: string) => duplicateBot(id),
        onSuccess: () => invalidate(),
    });
};

export const useSetBotStatus = () => {
    const invalidate = useBotInvalidate();
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: BotStatus }) =>
            setBotStatus(id, status),
        // Optimistic toggle — the switch must feel instant.
        onMutate: async ({ id, status }) => {
            await qc.cancelQueries({ queryKey: ["bots"] });
            const previous = qc.getQueryData<Bot[]>(["bots"]);
            qc.setQueryData<Bot[]>(["bots"], (old) =>
                (old || []).map((b) => (b._id === id ? { ...b, status } : b)),
            );
            return { previous };
        },
        onError: (_err, _vars, ctx) => {
            if (ctx?.previous) qc.setQueryData(["bots"], ctx.previous);
        },
        onSettled: (_data, _err, vars) => invalidate(vars.id),
    });
};

export const useAttachBotGroup = () => {
    const invalidate = useBotInvalidate();
    return useMutation({
        mutationFn: ({
            id,
            jid,
            subject,
            enabled,
        }: {
            id: string;
            jid: string;
            subject: string;
            enabled?: boolean;
        }) => attachBotToGroup(id, jid, subject, enabled),
        onSuccess: (_data, vars) => invalidate(vars.id),
    });
};

export const useDetachBotGroup = () => {
    const invalidate = useBotInvalidate();
    return useMutation({
        mutationFn: ({ id, jid }: { id: string; jid: string }) =>
            detachBotFromGroup(id, jid),
        onSuccess: (_data, vars) => invalidate(vars.id),
    });
};

export const useSimulateBot = () =>
    useMutation({
        mutationFn: ({
            id,
            text,
            senderName,
        }: {
            id: string;
            text: string;
            senderName?: string;
        }) => simulateBot(id, text, senderName),
    });
