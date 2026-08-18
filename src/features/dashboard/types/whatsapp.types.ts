export interface WhatsappStatusResponse {
    status:
        | "disconnected"
        | "connecting"
        | "qr_required"
        | "connected"
        | "logged_out";
    phoneNumber?: string;
}

export interface WhatsappQRResponse {
    qr: string;
}