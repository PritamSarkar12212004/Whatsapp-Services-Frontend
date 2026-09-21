import apiConst from "@/consts/api/apiConst";
import api from "@/utils/api/api";

export type AccountStatus =
    | "connected"
    | "connecting"
    | "qr_required"
    | "disconnected"
    | "logged_out"
    | "error";

export interface WhatsappAccount {
    /** `null` for the primary number. */
    accountId: string | null;
    label: string;
    isPrimary: boolean;
    phoneNumber: string | null;
    profileName: string | null;
    status: AccountStatus;
    connected: boolean;
    qrPending: boolean;
    lastConnectedAt: string | null;
}

interface ApiResponse<T> {
    status: string;
    data: T;
}

export const fetchAccounts = async (): Promise<WhatsappAccount[]> => {
    const res = await api.get<ApiResponse<WhatsappAccount[]>>(
        apiConst.Whatsapp.accounts,
    );
    return res.data.data;
};

export const createAccount = async (
    label: string,
): Promise<WhatsappAccount> => {
    const res = await api.post<ApiResponse<WhatsappAccount>>(
        apiConst.Whatsapp.accounts,
        { label },
    );
    return res.data.data;
};

export const renameAccount = async (
    accountId: string,
    label: string,
): Promise<WhatsappAccount> => {
    const res = await api.patch<ApiResponse<WhatsappAccount>>(
        `${apiConst.Whatsapp.accounts}/${accountId}`,
        { label },
    );
    return res.data.data;
};

export const removeAccount = async (accountId: string): Promise<void> => {
    await api.delete(`${apiConst.Whatsapp.accounts}/${accountId}`);
};
