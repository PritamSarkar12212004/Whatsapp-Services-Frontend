import apiConst from "@/consts/api/apiConst";
import api from "@/utils/api/api";

export interface WhatsappGroup {
    id: string;
    subject: string;
    desc: string | null;
    size: number;
    isCommunity: boolean;
    isCommunityAnnounce: boolean;
    linkedParent: string | null;
    creation: number | null;
    restrict: boolean;
    announce: boolean;
    isOwnedByMe: boolean;
    ownerNumber: string | null;
    amIAdmin: boolean;
    canMessage: boolean;
}

export interface WhatsappGroupsResponse {
    status: string;
    data: WhatsappGroup[];
}

export const whatsappGroups = async (): Promise<WhatsappGroupsResponse> => {
    const response = await api.get(apiConst.Whatsapp.groups);
    return response.data;
};
