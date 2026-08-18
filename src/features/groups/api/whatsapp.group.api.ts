import apiConst from "@/consts/api/apiConst";
import api from "@/utils/api/api";

export interface GroupParticipant {
    jid: string;
    number: string | null;
    name: string | null;
    isAdmin: boolean;
    isSuperAdmin: boolean;
}

export interface GroupCommunity {
    jid: string;
    subject: string | null;
}

export interface WhatsappGroupDetail {
    id: string;
    subject: string;
    desc: string | null;
    size: number;
    isCommunity: boolean;
    isCommunityAnnounce: boolean;
    restrict: boolean;
    announce: boolean;
    memberAddMode: boolean;
    joinApprovalMode: boolean;
    creation: number | null;
    owner: string | null;
    ownerNumber: string | null;
    amIAdmin: boolean;
    canMessage: boolean;
    isOwnedByMe: boolean;
    inviteCode: string | null;
    profilePicUrl: string | null;
    community: GroupCommunity | null;
    participants: GroupParticipant[];
}

export interface WhatsappGroupDetailResponse {
    status: string;
    data: WhatsappGroupDetail;
}

export const whatsappGroupDetail = async (
    jid: string,
): Promise<WhatsappGroupDetailResponse> => {
    const response = await api.get(
        apiConst.Whatsapp.groupDetail + encodeURIComponent(jid),
    );
    return response.data;
};
