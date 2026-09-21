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
    /** The number as WhatsApp reports it (what actually got linked). */
    phoneNumber: string | null;
    /** What was typed when the number was added. */
    expectedPhoneNumber?: string | null;
    /** The linked number is not the one that was entered. */
    numberMismatch?: boolean;
    profileName: string | null;
    status: AccountStatus;
    connected: boolean;
    qrPending: boolean;
    lastConnectedAt: string | null;
}

/** Digits only — pasted numbers arrive as "+91 98765 43210" or "098765…". */
export const normalizePhone = (value: string) =>
    value.replace(/\D/g, "").replace(/^0+/, "");

/** WhatsApp numbers are 8–15 digits including the country code. */
export const isValidPhone = (value: string) => {
    const digits = normalizePhone(value);
    return digits.length >= 8 && digits.length <= 15;
};

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

export const createAccount = async (input: {
    label: string;
    phoneNumber: string;
}): Promise<WhatsappAccount> => {
    const res = await api.post<ApiResponse<WhatsappAccount>>(
        apiConst.Whatsapp.accounts,
        { label: input.label, phoneNumber: normalizePhone(input.phoneNumber) },
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
