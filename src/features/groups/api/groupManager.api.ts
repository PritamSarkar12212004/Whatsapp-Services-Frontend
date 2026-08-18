import apiConst from "@/consts/api/apiConst";
import api from "@/utils/api/api";

export type ManagerRuleType =
    | "welcome"
    | "goodbye"
    | "auto_reply"
    | "banned_words"
    | "anti_link"
    | "anti_flood";

export interface ManagerRule {
    type: ManagerRuleType;
    trigger: string;
    value: string;
    enabled: boolean;
}

export interface GroupManagerSettings {
    warningMessage: string;
    strikeLimit: number;
    autoDelete: boolean;
}

export interface GroupCommands {
    enabled: boolean;
    rulesText: string;
    helpText: string;
}

export interface ScheduleRule {
    _id?: string;
    name: string;
    type: "daily" | "weekly" | "once";
    time: string;
    daysOfWeek: number[];
    date: string | null;
    templateId: string | null;
    message: string;
    enabled: boolean;
    lastRunAt?: string | null;
}

export interface GroupManagerConfig {
    _id?: string;
    userId?: string;
    groupJid: string;
    groupSubject: string;
    settings: GroupManagerSettings;
    commands: GroupCommands;
    rules: ManagerRule[];
    schedules: ScheduleRule[];
    createdAt?: string;
    updatedAt?: string;
}

export interface GroupWarning {
    _id: string;
    groupJid: string;
    groupSubject: string;
    memberJid: string;
    memberName: string;
    memberNumber: string | null;
    reason: string;
    message: string;
    strikes: number;
    action: string;
    createdAt: string;
}

const managerUrl = (jid: string) =>
    `${apiConst.Whatsapp.groupManager}${encodeURIComponent(jid)}/manager`;

export const getGroupManager = async (
    jid: string,
): Promise<{ status: string; data: GroupManagerConfig | null }> => {
    const response = await api.get(managerUrl(jid));
    return response.data;
};

export const saveGroupManager = async (
    jid: string,
    payload: Omit<GroupManagerConfig, "_id" | "userId" | "createdAt" | "updatedAt">,
): Promise<{ status: string; data: GroupManagerConfig }> => {
    const response = await api.post(managerUrl(jid), payload);
    return response.data;
};

export const deleteGroupManager = async (
    jid: string,
): Promise<{ status: string; deleted: boolean }> => {
    const response = await api.delete(managerUrl(jid));
    return response.data;
};

export const getGroupWarnings = async (
    jid: string,
): Promise<{ status: string; data: GroupWarning[] }> => {
    const response = await api.get(
        `${apiConst.Whatsapp.groupManager}${encodeURIComponent(jid)}/warnings`,
    );
    return response.data;
};
