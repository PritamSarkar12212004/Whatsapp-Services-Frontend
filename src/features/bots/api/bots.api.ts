import apiConst from "@/consts/api/apiConst";
import api from "@/utils/api/api";
import type {
    Bot,
    BotInput,
    BotStatus,
    GroupBotsResponse,
    SimulateResult,
} from "../types/bot.types";

interface ApiResponse<T> {
    status: string;
    data: T;
}

export const fetchBots = async (): Promise<Bot[]> => {
    const res = await api.get<ApiResponse<Bot[]>>(apiConst.Bots.list);
    return res.data.data;
};

export const fetchBot = async (id: string): Promise<Bot> => {
    const res = await api.get<ApiResponse<Bot>>(`${apiConst.Bots.base}${id}`);
    return res.data.data;
};

export const createBot = async (input: BotInput): Promise<Bot> => {
    const res = await api.post<ApiResponse<Bot>>(apiConst.Bots.list, input);
    return res.data.data;
};

export const updateBot = async (
    id: string,
    input: BotInput,
): Promise<Bot> => {
    const res = await api.patch<ApiResponse<Bot>>(
        `${apiConst.Bots.base}${id}`,
        input,
    );
    return res.data.data;
};

export const deleteBot = async (id: string): Promise<void> => {
    await api.delete(`${apiConst.Bots.base}${id}`);
};

export const duplicateBot = async (id: string): Promise<Bot> => {
    const res = await api.post<ApiResponse<Bot>>(
        `${apiConst.Bots.base}${id}/duplicate`,
    );
    return res.data.data;
};

export const setBotStatus = async (
    id: string,
    status: BotStatus,
): Promise<Bot> => {
    const res = await api.post<ApiResponse<Bot>>(
        `${apiConst.Bots.base}${id}/status`,
        { status },
    );
    return res.data.data;
};

/** Switch a bot on/off inside one WhatsApp group. */
export const attachBotToGroup = async (
    id: string,
    jid: string,
    subject: string,
    enabled = true,
): Promise<Bot> => {
    const res = await api.post<ApiResponse<Bot>>(
        `${apiConst.Bots.base}${id}/groups`,
        { jid, subject, enabled },
    );
    return res.data.data;
};

export const detachBotFromGroup = async (
    id: string,
    jid: string,
): Promise<Bot> => {
    const res = await api.delete<ApiResponse<Bot>>(
        `${apiConst.Bots.base}${id}/groups/${encodeURIComponent(jid)}`,
    );
    return res.data.data;
};

/** Bots live in a group + bots that could be attached to it. */
export const fetchGroupBots = async (
    jid: string,
): Promise<GroupBotsResponse> => {
    const res = await api.get<ApiResponse<GroupBotsResponse>>(
        `${apiConst.Bots.groupBots}${encodeURIComponent(jid)}`,
    );
    return res.data.data;
};

export const simulateBot = async (
    id: string,
    text: string,
    senderName?: string,
): Promise<SimulateResult> => {
    const res = await api.post<ApiResponse<SimulateResult>>(
        `${apiConst.Bots.base}${id}/simulate`,
        { text, senderName },
    );
    return res.data.data;
};
