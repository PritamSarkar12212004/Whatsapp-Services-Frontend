declare module "react-qr-code" {
    import type { ComponentType } from "react";

    interface QRCodeProps {
        value: string;
        size?: number;
        className?: string;
        bgColor?: string;
        fgColor?: string;
        level?: "L" | "M" | "Q" | "H";
    }

    const QRCode: ComponentType<QRCodeProps>;
    export default QRCode;
}