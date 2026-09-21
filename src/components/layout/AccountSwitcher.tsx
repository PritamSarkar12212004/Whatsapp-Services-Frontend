import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    CheckOutlined,
    DownOutlined,
    ExclamationCircleOutlined,
    LoadingOutlined,
    PlusOutlined,
    SettingOutlined,
    WhatsAppOutlined,
} from "@ant-design/icons";
import { useAccounts } from "@/features/accounts/hooks/useAccounts";
import { useSwitchAccount } from "@/features/accounts/hooks/useSwitchAccount";
import type { AccountStatus } from "@/features/accounts/api/accounts.api";

/** Same colour language as the connection badge, per number. */
const statusDot: Record<AccountStatus, string> = {
    connected: "bg-emerald-500",
    connecting: "bg-amber-500 animate-pulse",
    qr_required: "bg-amber-500 animate-pulse",
    disconnected: "bg-red-500",
    logged_out: "bg-red-500",
    error: "bg-red-500",
};

const statusLabel: Record<AccountStatus, string> = {
    connected: "Connected",
    connecting: "Connecting…",
    qr_required: "QR required",
    disconnected: "Disconnected",
    logged_out: "Logged out",
    error: "Error",
};

const initialsOf = (name: string) => {
    const parts = String(name).trim().split(/\s+/);
    return ((parts[0]?.[0] || "W") + (parts[1]?.[0] || "")).toUpperCase();
};

/**
 * Sidebar switcher — one login, several WhatsApp numbers.
 *
 * Switching only changes which number the app acts as; the backend keeps each
 * number's session, bots and group rules apart.
 */
const AccountSwitcher: React.FC = () => {
    const navigate = useNavigate();
    const { data: accounts, isLoading } = useAccounts();
    const { activeAccountId, switchTo } = useSwitchAccount();

    const [open, setOpen] = useState(false);
    const boxRef = useRef<HTMLDivElement | null>(null);

    // Close on an outside click or Escape — a dropdown inside the sidebar
    // should never trap the user.
    useEffect(() => {
        if (!open) return;

        const onClick = (event: MouseEvent) => {
            if (!boxRef.current?.contains(event.target as Node)) setOpen(false);
        };
        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") setOpen(false);
        };

        document.addEventListener("mousedown", onClick);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onClick);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

    const list = useMemo(() => accounts ?? [], [accounts]);

    const active = useMemo(
        () => list.find((a) => (a.accountId ?? null) === activeAccountId) ?? null,
        [list, activeAccountId],
    );

    const title =
        active?.label ||
        (active?.isPrimary ? "Primary number" : "Select a number") ||
        "Select a number";

    const subtitle = active?.phoneNumber
        ? `+${active.phoneNumber}`
        : active
          ? statusLabel[active.status]
          : isLoading
            ? "Loading numbers…"
            : "No number connected";

    return (
        <div ref={boxRef} className="relative shrink-0 border-b border-gray-100 p-3">
            <button
                onClick={() => setOpen((v) => !v)}
                className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-white p-2.5 text-left transition hover:border-emerald-300"
                title="Switch WhatsApp number"
            >
                <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-[11px] font-bold text-white">
                    {active ? initialsOf(title) : <WhatsAppOutlined />}
                    <span
                        className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${
                            statusDot[active?.status ?? "disconnected"]
                        }`}
                    />
                </span>

                <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-semibold text-gray-900">
                        {title}
                    </span>
                    <span
                        className={`block truncate text-[10px] ${
                            active?.numberMismatch ? "text-amber-600" : "text-gray-400"
                        }`}
                    >
                        {active?.numberMismatch
                            ? `Linked +${active.phoneNumber} — not the number you entered`
                            : subtitle}
                    </span>
                </span>

                <DownOutlined
                    className={`shrink-0 text-[10px] text-gray-400 transition ${
                        open ? "rotate-180" : ""
                    }`}
                />
            </button>

            {open && (
                <div className="absolute left-3 right-3 top-[calc(100%-4px)] z-50 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                    <div className="max-h-64 overflow-y-auto py-1">
                        {isLoading && (
                            <p className="flex items-center gap-2 px-3 py-2 text-[11px] text-gray-400">
                                <LoadingOutlined /> Loading numbers…
                            </p>
                        )}

                        {list.map((account) => {
                            const isActive =
                                (account.accountId ?? null) === activeAccountId;
                            const label =
                                account.label ||
                                (account.isPrimary
                                    ? "Primary number"
                                    : `Number ${
                                          account.accountId?.slice(0, 4) ?? ""
                                      }`);

                            return (
                                <button
                                    key={account.accountId ?? "primary"}
                                    onClick={async () => {
                                        setOpen(false);
                                        await switchTo(account.accountId ?? null);
                                    }}
                                    className={`flex w-full cursor-pointer items-center gap-2.5 px-3 py-2 text-left transition hover:bg-emerald-50 ${
                                        isActive ? "bg-emerald-50/60" : ""
                                    }`}
                                >
                                    <span
                                        className={`h-2 w-2 shrink-0 rounded-full ${
                                            statusDot[account.status]
                                        }`}
                                    />

                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate text-xs font-medium text-gray-800">
                                            {label}
                                        </span>
                                        <span
                                            className={`block truncate text-[10px] ${
                                                account.numberMismatch
                                                    ? "text-amber-600"
                                                    : "text-gray-400"
                                            }`}
                                        >
                                            {account.numberMismatch && (
                                                <ExclamationCircleOutlined className="mr-1" />
                                            )}
                                            {account.phoneNumber
                                                ? `+${account.phoneNumber}`
                                                : statusLabel[account.status]}
                                            {account.numberMismatch
                                                ? " — not the number you entered"
                                                : ""}
                                        </span>
                                    </span>

                                    {isActive && (
                                        <CheckOutlined className="shrink-0 text-xs text-emerald-600" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <div className="border-t border-gray-100">
                        <button
                            onClick={() => {
                                setOpen(false);
                                navigate("/accounts");
                            }}
                            className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-[11px] font-semibold text-gray-600 transition hover:bg-gray-50"
                        >
                            <SettingOutlined /> Manage numbers
                        </button>

                        <button
                            onClick={() => {
                                setOpen(false);
                                navigate("/accounts?add=1");
                            }}
                            className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-[11px] font-semibold text-emerald-700 transition hover:bg-emerald-50"
                        >
                            <PlusOutlined /> Connect another number
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountSwitcher;
