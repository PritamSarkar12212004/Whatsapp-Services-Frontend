import { useEffect, useState } from "react";
import type { ComponentType } from "react";

interface QRCodeProps {
    value: string;
    size?: number;
    className?: string;
}

type QRCodeComponentType = ComponentType<QRCodeProps>;

interface WhatsappQRCodeProps {
    value: string;
    size?: number;
    className?: string;
}

/**
 * Renders a QR code from raw QR data/string.
 *
 * Uses `react-qr-code` (loaded lazily) to render the QR matrix.
 * If the library is not installed, a helpful message is shown instead
 * of breaking the build. Install it with:
 *
 *   npm install react-qr-code
 */
const WhatsappQRCode = ({ value, size = 220, className = "" }: WhatsappQRCodeProps) => {
    const [QRCodeComponent, setQRCodeComponent] = useState<QRCodeComponentType | null>(null);
    const [libraryMissing, setLibraryMissing] = useState(false);

    useEffect(() => {
        let mounted = true;

        import("react-qr-code")
            .then((mod) => {
                if (mounted) {
                    setQRCodeComponent(() => mod.default as QRCodeComponentType);
                }
            })
            .catch(() => {
                if (mounted) {
                    setLibraryMissing(true);
                }
            });

        return () => {
            mounted = false;
        };
    }, []);

    if (libraryMissing) {
        return (
            <div className="flex h-[220px] w-[220px] flex-col items-center justify-center gap-2 text-center">
                <p className="text-sm text-red-500">QR library is not installed.</p>
                <code className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">
                    npm install react-qr-code
                </code>
            </div>
        );
    }

    if (!QRCodeComponent) {
        return (
            <div className="flex h-[220px] w-[220px] items-center justify-center">
                <span className="text-sm text-gray-400">Loading QR...</span>
            </div>
        );
    }

    return <QRCodeComponent value={value} size={size} className={className} />;
};

export default WhatsappQRCode;