import { useEffect, useRef } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import Animation from "@/components/ui/animation/Animation";
import WhatsappQRCode from "@/components/ui/whatsapp/WhatsappQRCode";
import { AnimationConst } from "@/consts/animation/AnimationConst";
import { useWhatsappConnect } from "@/features/dashboard/hooks/useWhatsappConnect";
import { useWhatsappQR } from "@/features/dashboard/hooks/useWhatsappQR";
import { useWhatsappStatus } from "@/features/dashboard/hooks/useWhatsappStatus";
import { useStoreBascData } from "@/store/zustand/user/useStoreBascData";
import { useStoreToken } from "@/store/zustand/token/useStoreToken";

/**
 * Gates the whole app behind an active WhatsApp connection.
 *
 * When the session is logged out / disconnected / connecting / QR-required,
 * ONLY a full-screen QR screen is shown — no sidebar, no pages, nothing else.
 * Once the QR is scanned and the status becomes "connected", the app renders.
 */
const WhatsappGate = () => {
    const navigate = useNavigate();

    const clearToken = useStoreToken((state) => state.clearToken);
    const clearUser = useStoreBascData((state) => state.clearUser);

    const {
        data,
        isLoading,
        isError,
        error,
        refetch: refetchStatus,
    } = useWhatsappStatus();

    const {
        mutate: connectWhatsApp,
        isPending: isConnecting,
        error: connectError,
        reset: resetConnect,
    } = useWhatsappConnect();

    const {
        data: qrData,
        isFetching: isQRLoading,
        isError: isQRError,
        refetch: fetchQR,
    } = useWhatsappQR();

    const connectTriggeredRef = useRef(false);
    const qrFetchedRef = useRef(false);

    // Auto-start the connection after a logout / disconnect so the QR code
    // appears by itself — the user shouldn't have to click anything.
    useEffect(() => {
        if (
            (data?.status === "disconnected" || data?.status === "logged_out") &&
            !connectTriggeredRef.current
        ) {
            connectTriggeredRef.current = true;
            connectWhatsApp(undefined, {
                onSuccess: () => refetchStatus(),
            });
        }

        if (
            data?.status !== "disconnected" &&
            data?.status !== "logged_out"
        ) {
            connectTriggeredRef.current = false;
        }
    }, [data?.status, connectWhatsApp, refetchStatus]);

    // Fetch the QR code as soon as the backend says it is needed.
    useEffect(() => {
        if (data?.status === "qr_required" && !qrFetchedRef.current) {
            qrFetchedRef.current = true;
            fetchQR();
        }

        if (data?.status !== "qr_required") {
            qrFetchedRef.current = false;
        }
    }, [data?.status, fetchQR]);

    // WhatsApp QR codes expire quickly — refresh automatically while shown
    // so the user never scans a stale code.
    useEffect(() => {
        if (data?.status !== "qr_required") return;

        const id = setInterval(() => {
            fetchQR();
        }, 20000);

        return () => clearInterval(id);
    }, [data?.status, fetchQR]);

    const handleRetryStatus = () => {
        refetchStatus();
    };

    const handleRetryConnect = () => {
        resetConnect();
        connectWhatsApp(undefined, {
            onSuccess: () => refetchStatus(),
        });
    };

    const handleWebsiteLogout = () => {
        clearToken();
        clearUser();
        navigate("/auth", { replace: true });
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-gray-50">
                <Animation
                    source={AnimationConst.Loader}
                    height={200}
                    width={200}
                    loop={true}
                    className="mx-auto"
                />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 p-6">
                <div className="w-full max-w-md rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
                    <h2 className="text-lg font-semibold text-red-700">
                        Failed to load WhatsApp status
                    </h2>

                    <p className="mt-2 text-sm text-red-600">
                        {error instanceof Error
                            ? error.message
                            : "Something went wrong."}
                    </p>

                    <button
                        onClick={handleRetryStatus}
                        className="mt-6 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // Connected — show the actual app.
    if (data?.status === "connected") {
        return <Outlet />;
    }

    // ==================== NOT CONNECTED — QR ONLY ====================
    const showQRCard = data?.status === "qr_required";

    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-50 p-6">
            <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900">
                    Connect WhatsApp
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                    Scan this QR code with WhatsApp → Linked Devices → Link a
                    Device
                </p>

                {showQRCard ? (
                    <>
                        <div className="mt-6 flex items-center justify-center">
                            {isQRLoading && (
                                <div className="flex flex-col items-center gap-3">
                                    <Animation
                                        source={AnimationConst.Loader}
                                        height={120}
                                        width={120}
                                        loop={true}
                                    />
                                    <p className="text-sm text-gray-500">
                                        Generating QR code...
                                    </p>
                                </div>
                            )}

                            {!isQRLoading && isQRError && (
                                <div className="flex flex-col items-center gap-3">
                                    <p className="text-sm text-red-500">
                                        Failed to load QR code.
                                    </p>
                                    <button
                                        onClick={() => fetchQR()}
                                        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
                                    >
                                        Retry
                                    </button>
                                </div>
                            )}

                            {!isQRLoading && !isQRError && qrData?.qr && (
                                <div className="rounded-xl border border-gray-200 bg-white p-4">
                                    <WhatsappQRCode
                                        value={qrData.qr}
                                        size={220}
                                    />
                                </div>
                            )}

                            {!isQRLoading && !isQRError && !qrData?.qr && (
                                <div className="flex flex-col items-center gap-3">
                                    <p className="text-sm text-gray-500">
                                        QR code is not available yet.
                                    </p>
                                    <button
                                        onClick={() => fetchQR()}
                                        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
                                    >
                                        Refresh QR
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex items-center justify-center gap-2">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                            <p className="text-sm text-gray-500">
                                Waiting for QR scan...
                            </p>
                        </div>

                        <button
                            onClick={() => fetchQR()}
                            className="mt-4 text-sm font-medium text-emerald-600 transition hover:text-emerald-700"
                        >
                            Refresh QR
                        </button>
                    </>
                ) : (
                    <div className="mt-6 flex flex-col items-center gap-4">
                        {isConnecting && (
                            <Animation
                                source={AnimationConst.Loader}
                                height={160}
                                width={160}
                                loop={true}
                            />
                        )}

                        {connectError ? (
                            <>
                                <p className="text-sm text-red-500">
                                    {connectError instanceof Error
                                        ? connectError.message
                                        : "Failed to connect WhatsApp."}
                                </p>
                                <button
                                    onClick={handleRetryConnect}
                                    className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
                                >
                                    Retry
                                </button>
                            </>
                        ) : (
                            <>
                                <p className="text-lg font-medium text-gray-700">
                                    Connecting to WhatsApp...
                                </p>
                                <button
                                    onClick={handleRetryConnect}
                                    className="mt-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                                >
                                    Retry
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>

            <button
                onClick={handleWebsiteLogout}
                className="mt-6 text-sm font-medium text-gray-400 transition hover:text-red-500"
            >
                Logout of the app
            </button>
        </div>
    );
};

export default WhatsappGate;
