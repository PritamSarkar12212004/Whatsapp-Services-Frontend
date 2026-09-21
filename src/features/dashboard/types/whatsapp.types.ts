export interface WhatsappStatusResponse {
    status:
        | "disconnected"
        | "connecting"
        | "qr_required"
        | "connected"
        | "logged_out"
        // The session manager reports "error" when a socket cannot even be
        // built (auth-state load failure, …). Without it the gate fell back to
        // the "Connecting to WhatsApp…" branch and hid the real problem.
        | "error";
    phoneNumber?: string;
    /** Milliseconds the session has been stuck in "connecting", if any. */
    connectingFor?: number | null;
}

export interface WhatsappQRResponse {
    qr: string;
}