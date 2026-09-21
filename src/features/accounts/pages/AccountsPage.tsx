import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import Sidebar from "@/components/layout/Sidebar";
import WhatsappQRCode from "@/components/ui/whatsapp/WhatsappQRCode";
import { Field, Modal, PrimaryButton, SecondaryButton, Spinner, inputCls } from "@/features/crm/components/CrmUi";
import { useWhatsappQR } from "@/features/dashboard/hooks/useWhatsappQR";
import { useWhatsappConnect } from "@/features/dashboard/hooks/useWhatsappConnect";
import {
    useCreateAccount,
    useRenameAccount,
    useRemoveAccount,
    useAccounts,
} from "../hooks/useAccounts";
import { useSwitchAccount } from "../hooks/useSwitchAccount";
import type { AccountStatus, WhatsappAccount } from "../api/accounts.api";
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    DeleteOutlined,
    EditOutlined,
    LinkOutlined,
    PlusOutlined,
    StarFilled,
    WhatsAppOutlined,
} from "@ant-design/icons";

const chip =
    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold";

const STATUS_STYLE: Record<AccountStatus, { label: string; className: string }> =
    {
        connected: {
            label: "Connected",
            className: "bg-emerald-50 text-emerald-700",
        },
        connecting: {
            label: "Connecting…",
            className: "bg-amber-50 text-amber-700",
        },
        qr_required: {
            label: "QR required",
            className: "bg-amber-50 text-amber-700",
        },
        disconnected: {
            label: "Disconnected",
            className: "bg-red-50 text-red-600",
        },
        logged_out: {
            label: "Logged out",
            className: "bg-red-50 text-red-600",
        },
        error: { label: "Error", className: "bg-red-50 text-red-600" },
    };

/** Full-screen shell — the sidebar stays, everything else fills the screen. */
const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="w-full h-screen">
        <Sidebar />
        <div className="flex h-screen flex-col lg:ml-64">{children}</div>
    </div>
);

const AccountsPage: React.FC = () => {
    const navigate = useNavigate();
    const [params, setParams] = useSearchParams();

    const { data: accounts, isLoading } = useAccounts();
    const { activeAccountId, switchTo } = useSwitchAccount();

    const createAccount = useCreateAccount();
    const renameAccount = useRenameAccount();
    const removeAccount = useRemoveAccount();

    const [addOpen, setAddOpen] = useState(params.get("add") === "1");
    const [label, setLabel] = useState("");
    const [renameTarget, setRenameTarget] = useState<WhatsappAccount | null>(null);
    const [renameValue, setRenameValue] = useState("");
    const [removeTarget, setRemoveTarget] = useState<WhatsappAccount | null>(null);

    const list = useMemo(() => accounts ?? [], [accounts]);

    const active = useMemo(
        () => list.find((a) => (a.accountId ?? null) === activeAccountId) ?? null,
        [list, activeAccountId],
    );

    const openAdd = () => {
        setLabel("");
        setAddOpen(true);

        // Drop `?add=1` so a reload doesn't reopen the dialog.
        const next = new URLSearchParams(params);
        next.delete("add");
        setParams(next, { replace: true });
    };

    const submitAdd = () => {
        createAccount.mutate(label.trim(), {
            onSuccess: async (account) => {
                setAddOpen(false);
                toast.success("Number added — scan the QR to link it");
                // The new number becomes the one we are working as, so its QR
                // (fetched with the account header) shows up right here.
                await switchTo(account.accountId ?? null);
            },
            onError: () => toast.error("Could not add the number"),
        });
    };

    // ==================== QR for the selected number ====================
    const {
        data: qrData,
        isFetching: qrLoading,
        refetch: fetchQR,
    } = useWhatsappQR();

    const { mutate: connectWhatsApp, isPending: connecting } = useWhatsappConnect();

    const qrFetchedRef = useRef(false);

    useEffect(() => {
        if (active?.status === "qr_required" && !qrFetchedRef.current) {
            qrFetchedRef.current = true;
            fetchQR();
        }
        if (active?.status !== "qr_required") qrFetchedRef.current = false;
    }, [active?.status, fetchQR]);

    useEffect(() => {
        if (active?.status !== "qr_required") return;

        // QR codes expire — keep the one on screen fresh.
        const id = setInterval(() => fetchQR(), 20000);
        return () => clearInterval(id);
    }, [active?.status, fetchQR]);

    useEffect(() => {
        if (
            active &&
            (active.status === "disconnected" || active.status === "logged_out")
        ) {
            connectWhatsApp(undefined, {
                onError: () => toast.error("Could not start the connection"),
            });
        }
    }, [active?.accountId, active?.status, connectWhatsApp]);

    return (
        <Shell>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3 lg:px-6">
                <div className="min-w-0">
                    <h1 className="text-xl font-semibold text-gray-900 lg:text-2xl">
                        WhatsApp numbers
                    </h1>
                    <p className="mt-0.5 text-sm text-gray-500">
                        Link several numbers to one login — each one keeps its own
                        session, bots and group rules
                    </p>
                </div>

                <button
                    onClick={openAdd}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
                >
                    <PlusOutlined /> Add a number
                </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-6">
                <div className="mx-auto max-w-4xl space-y-4">
                    {isLoading && (
                        <p className="flex items-center gap-2 text-sm text-gray-400">
                            <Spinner /> Loading numbers…
                        </p>
                    )}

                    {/* The selected number, with its QR when it needs linking */}
                    {active && active.status === "qr_required" && (
                        <section className="rounded-2xl border border-emerald-200 bg-white p-5 text-center shadow-sm">
                            <h2 className="text-sm font-semibold text-gray-900">
                                Link{" "}
                                {active.label ||
                                    (active.isPrimary
                                        ? "your primary number"
                                        : "this number")}
                            </h2>
                            <p className="mt-1 text-xs text-gray-500">
                                WhatsApp → Linked Devices → Link a Device
                            </p>

                            <div className="mt-4 flex items-center justify-center">
                                {qrLoading && !qrData?.qr ? (
                                    <div className="flex flex-col items-center gap-3">
                                        <Spinner />
                                        <p className="text-xs text-gray-400">
                                            Generating QR…
                                        </p>
                                    </div>
                                ) : qrData?.qr ? (
                                    <div
                                        className="rounded-xl border border-gray-200 p-3"
                                        style={{ backgroundColor: "#ffffff" }}
                                    >
                                        <WhatsappQRCode value={qrData.qr} size={200} />
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2">
                                        <p className="text-xs text-gray-500">
                                            QR not available yet.
                                        </p>
                                        <button
                                            onClick={() => fetchQR()}
                                            className="rounded-lg bg-emerald-700 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-emerald-800"
                                        >
                                            Refresh QR
                                        </button>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    <section className="space-y-2">
                        {list.map((account) => {
                            const isActive =
                                (account.accountId ?? null) === activeAccountId;
                            const style = STATUS_STYLE[account.status];
                            const name =
                                account.label ||
                                (account.isPrimary
                                    ? "Primary number"
                                    : `Number ${account.accountId?.slice(0, 4) ?? ""}`);

                            return (
                                <div
                                    key={account.accountId ?? "primary"}
                                    className={`flex flex-wrap items-center gap-3 rounded-2xl border bg-white p-3.5 shadow-sm transition ${
                                        isActive
                                            ? "border-emerald-300"
                                            : "border-gray-200 hover:border-emerald-200"
                                    }`}
                                >
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white">
                                        <WhatsAppOutlined />
                                    </span>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            <p className="truncate text-sm font-semibold text-gray-900">
                                                {name}
                                            </p>

                                            {account.isPrimary && (
                                                <span className={`${chip} bg-emerald-700 text-white`}>
                                                    <StarFilled /> Primary
                                                </span>
                                            )}

                                            {isActive && (
                                                <span className={`${chip} bg-emerald-50 text-emerald-700`}>
                                                    <CheckCircleOutlined /> Selected
                                                </span>
                                            )}
                                        </div>

                                        <p className="mt-0.5 truncate text-[11px] text-gray-500">
                                            {account.phoneNumber
                                                ? `+${account.phoneNumber} · `
                                                : ""}
                                            <span className={style.className}>
                                                {style.label}
                                            </span>
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                        <button
                                            onClick={() => {
                                                setRenameTarget(account);
                                                setRenameValue(account.label || "");
                                            }}
                                            disabled={account.isPrimary}
                                            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-gray-400 transition hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                                            title={
                                                account.isPrimary
                                                    ? "The primary number cannot be renamed"
                                                    : "Rename"
                                            }
                                        >
                                            <EditOutlined />
                                        </button>

                                        <button
                                            onClick={() => setRemoveTarget(account)}
                                            disabled={account.isPrimary}
                                            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-gray-400 transition hover:bg-red-100 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                                            title={
                                                account.isPrimary
                                                    ? "The primary number cannot be removed"
                                                    : "Remove this number"
                                            }
                                        >
                                            <DeleteOutlined />
                                        </button>

                                        {isActive ? (
                                            <button
                                                onClick={() =>
                                                    account.status === "connected"
                                                        ? navigate("/")
                                                        : connectWhatsApp(undefined, {
                                                              onError: () =>
                                                                  toast.error(
                                                                      "Could not start the connection",
                                                                  ),
                                                          })
                                                }
                                                disabled={connecting}
                                                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-60"
                                            >
                                                {connecting ? <Spinner /> : <LinkOutlined />}
                                                {connecting
                                                    ? "Starting…"
                                                    : account.status === "connected"
                                                      ? "Open app"
                                                      : "Connect"}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() =>
                                                    switchTo(account.accountId ?? null)
                                                }
                                                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 transition hover:border-emerald-300 hover:text-emerald-700"
                                            >
                                                <CheckCircleOutlined /> Use this number
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </section>

                    <p className="px-1 text-[11px] leading-relaxed text-gray-400">
                        Bots, group rules and connection state belong to the number
                        that created them. Contacts, templates, campaigns and message
                        logs are still shared by the login — moving them per number is
                        the next step.
                    </p>
                </div>
            </div>

            {/* ---------------- Add ---------------- */}
            <Modal
                open={addOpen}
                onClose={() => {
                    if (!createAccount.isPending) setAddOpen(false);
                }}
                title="Add a WhatsApp number"
                footer={
                    <>
                        <SecondaryButton
                            onClick={() => setAddOpen(false)}
                            disabled={createAccount.isPending}
                        >
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton
                            onClick={submitAdd}
                            disabled={createAccount.isPending}
                        >
                            {createAccount.isPending ? <Spinner /> : <PlusOutlined />}
                            {createAccount.isPending ? "Adding…" : "Add number"}
                        </PrimaryButton>
                    </>
                }
            >
                <div className="space-y-3">
                    <Field
                        label="Name this number"
                        hint="Shown in the sidebar switcher — e.g. Sales, Support"
                    >
                        <input
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            placeholder="e.g. Sales"
                            className={inputCls}
                            autoFocus
                        />
                    </Field>

                    <p className="text-[11px] leading-relaxed text-gray-500">
                        After adding, a QR code appears — scan it from WhatsApp →
                        Linked Devices to link the number.
                    </p>
                </div>
            </Modal>

            {/* ---------------- Rename ---------------- */}
            <Modal
                open={!!renameTarget}
                onClose={() => {
                    if (!renameAccount.isPending) setRenameTarget(null);
                }}
                title="Rename this number"
                footer={
                    <>
                        <SecondaryButton
                            onClick={() => setRenameTarget(null)}
                            disabled={renameAccount.isPending}
                        >
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton
                            disabled={renameAccount.isPending || !renameTarget}
                            onClick={() => {
                                if (!renameTarget?.accountId) return;
                                renameAccount.mutate(
                                    {
                                        accountId: renameTarget.accountId,
                                        label: renameValue.trim(),
                                    },
                                    {
                                        onSuccess: () => {
                                            setRenameTarget(null);
                                            toast.success("Number renamed");
                                        },
                                        onError: () =>
                                            toast.error("Could not rename the number"),
                                    },
                                );
                            }}
                        >
                            {renameAccount.isPending ? <Spinner /> : null}
                            {renameAccount.isPending ? "Saving…" : "Save name"}
                        </PrimaryButton>
                    </>
                }
            >
                <Field label="Label">
                    <input
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        placeholder="e.g. Support"
                        className={inputCls}
                    />
                </Field>
            </Modal>

            {/* ---------------- Remove ---------------- */}
            <Modal
                open={!!removeTarget}
                onClose={() => {
                    if (!removeAccount.isPending) setRemoveTarget(null);
                }}
                title="Remove this number?"
                footer={
                    <>
                        <SecondaryButton
                            onClick={() => setRemoveTarget(null)}
                            disabled={removeAccount.isPending}
                        >
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton
                            disabled={removeAccount.isPending}
                            onClick={() => {
                                if (!removeTarget?.accountId) return;
                                removeAccount.mutate(removeTarget.accountId, {
                                    onSuccess: async () => {
                                        setRemoveTarget(null);
                                        toast.success("Number removed");
                                        if (
                                            activeAccountId ===
                                            removeTarget?.accountId
                                        ) {
                                            await switchTo(null);
                                        }
                                    },
                                    onError: () =>
                                        toast.error("Could not remove the number"),
                                });
                            }}
                        >
                            {removeAccount.isPending ? <Spinner /> : <CloseCircleOutlined />}
                            {removeAccount.isPending ? "Removing…" : "Remove number"}
                        </PrimaryButton>
                    </>
                }
            >
                <p className="text-sm text-gray-600">
                    {removeTarget?.phoneNumber
                        ? `+${removeTarget.phoneNumber} will be unlinked from WhatsApp.`
                        : "This number will be unlinked from WhatsApp."}{" "}
                    Its bots and group rules stay in the database but become
                    unreachable.
                </p>
            </Modal>
        </Shell>
    );
};

export default AccountsPage;
