import React, { useMemo, useState } from "react";
import {
    HomeOutlined,
    SendOutlined,
    ContactsOutlined,
    TeamOutlined,
    FileTextOutlined,
    WhatsAppOutlined,
    SettingOutlined,
    LogoutOutlined,
    DownOutlined,
    MenuOutlined,
    CloseOutlined,
    SyncOutlined,
} from "@ant-design/icons";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useStoreToken } from "@/store/zustand/token/useStoreToken";
import { useStoreBascData } from "@/store/zustand/user/useStoreBascData";
import { useWhatsappStatus } from "@/features/dashboard/hooks/useWhatsappStatus";
import { useWhatsappConnect } from "@/features/dashboard/hooks/useWhatsappConnect";
import api from "@/utils/api/api";
import apiConst from "@/consts/api/apiConst";

interface NavChild {
    label: string;
    path: string;
    icon: React.ReactNode;
}

interface NavItem {
    label: string;
    path?: string;
    icon: React.ReactNode;
    children?: NavChild[];
}

interface NavGroup {
    label: string;
    items: NavItem[];
}

const navGroups: NavGroup[] = [
    {
        label: "Main",
        items: [{ label: "Dashboard", path: "/", icon: <HomeOutlined /> }],
    },
    {
        label: "Features",
        items: [
            {
                label: "Templates",
                icon: <FileTextOutlined />,
                children: [
                    { label: "All Templates", path: "/templates", icon: <FileTextOutlined /> },
                ],
            },
            {
                label: "Contacts",
                icon: <ContactsOutlined />,
                children: [
                    { label: "All Contacts", path: "/contacts", icon: <ContactsOutlined /> },
                    { label: "Groups", path: "/contacts/groups", icon: <TeamOutlined /> },
                ],
            },
            { label: "Campaigns", path: "/campaigns", icon: <SendOutlined /> },
            { label: "Groups & Communities", path: "/groups", icon: <TeamOutlined /> },
        ],
    },
    {
        label: "More",
        items: [
            { label: "Settings", path: "/settings", icon: <SettingOutlined /> },
        ],
    },
];

const statusConfig: Record<
    string,
    { label: string; dot: string; text: string; badge: string }
> = {
    connected: {
        label: "Connected",
        dot: "bg-emerald-500",
        text: "text-emerald-700",
        badge: "bg-emerald-50",
    },
    connecting: {
        label: "Connecting…",
        dot: "bg-amber-500 animate-pulse",
        text: "text-amber-700",
        badge: "bg-amber-50",
    },
    qr_required: {
        label: "QR Required",
        dot: "bg-amber-500 animate-pulse",
        text: "text-amber-700",
        badge: "bg-amber-50",
    },
    disconnected: {
        label: "Disconnected",
        dot: "bg-red-500",
        text: "text-red-600",
        badge: "bg-red-50",
    },
    logged_out: {
        label: "Logged Out — QR Required",
        dot: "bg-amber-500 animate-pulse",
        text: "text-amber-700",
        badge: "bg-amber-50",
    },
};

const Sidebar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const clearToken = useStoreToken((state) => state.clearToken);
    const user = useStoreBascData((state) => state.user);
    const clearUser = useStoreBascData((state) => state.clearUser);

    const { data: statusData, refetch: refetchStatus } = useWhatsappStatus();
    const { mutate: connectWhatsApp, isPending: isConnecting } = useWhatsappConnect();

    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
    const [syncing, setSyncing] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [logoutOpen, setLogoutOpen] = useState(false);
    const [waLoggingOut, setWaLoggingOut] = useState(false);

    // Auto-expand a submenu when one of its children is active.
    const expandedMenus = useMemo(() => {
        const expanded: Record<string, boolean> = {};
        for (const group of navGroups) {
            for (const item of group.items) {
                if (
                    item.children?.some(
                        (child) =>
                            location.pathname === child.path ||
                            location.pathname.startsWith(child.path + "/"),
                    )
                ) {
                    expanded[item.label] = true;
                }
            }
        }
        return expanded;
    }, [location.pathname]);

    const isMenuOpen = (label: string) =>
        openMenus[label] ?? expandedMenus[label] ?? false;

    const toggleMenu = (label: string) => {
        setOpenMenus((prev) => ({ ...prev, [label]: !isMenuOpen(label) }));
    };

    const handleConnect = () => {
        connectWhatsApp(undefined, {
            onSuccess: () => {
                refetchStatus();
                toast.success("WhatsApp connection started");
            },
            onError: (err: Error) => {
                toast.error(err.message || "Failed to connect WhatsApp");
            },
        });
    };

    const handleSyncContacts = async () => {
        setSyncing(true);
        try {
            const res = await api.post(apiConst.Whatsapp.syncContacts);
            const data = res.data?.data;
            if (data) {
                toast.success(
                    `Contacts synced: ${data.inserted} inserted, ${data.updated} updated`,
                );
            } else {
                toast.success(res.data?.message || "Contacts synced");
            }
        } catch (err: any) {
            toast.error(
                err?.response?.data?.message || "Failed to sync contacts",
            );
        } finally {
            setSyncing(false);
        }
    };

    const handleLogout = () => {
        setLogoutOpen(true);
    };

    const handleWebsiteLogout = () => {
        setLogoutOpen(false);
        clearToken();
        clearUser();
        navigate("/auth", { replace: true });
    };

    const handleWhatsAppLogout = async () => {
        setWaLoggingOut(true);
        try {
            await api.post(apiConst.Whatsapp.disconnect);
            refetchStatus();
            toast.success(
                "WhatsApp logged out — scan the QR again to reconnect. Your data (contacts, templates, campaigns) is safe",
            );
        } catch (err: any) {
            toast.error(
                err?.response?.data?.message || "Failed to disconnect WhatsApp",
            );
        } finally {
            setWaLoggingOut(false);
            setLogoutOpen(false);
        }
    };

    const status = statusData?.status || "disconnected";
    const cfg = statusConfig[status] || statusConfig.disconnected;
    const connected = status === "connected";

    const initials = useMemo(() => {
        const name = user?.fullName || user?.wpnumber || "U";
        const parts = String(name).trim().split(/\s+/);
        const first = parts[0]?.[0] || "U";
        const last = parts[1]?.[0] || "";
        return (first + last).toUpperCase();
    }, [user]);

    const closeMobile = () => setMobileOpen(false);

    return (
        <>
            {/* Mobile hamburger */}
            <button
                onClick={() => setMobileOpen((v) => !v)}
                className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:bg-gray-50 lg:hidden"
                aria-label="Toggle menu"
            >
                {mobileOpen ? <CloseOutlined /> : <MenuOutlined />}
            </button>

            {/* Mobile backdrop */}
            {mobileOpen && (
                <div
                    onClick={closeMobile}
                    className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
                />
            )}

            <aside
                className={`fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-300 ${
                    mobileOpen ? "translate-x-0" : "-translate-x-full"
                } lg:translate-x-0`}
            >
                {/* ==================== BRAND ==================== */}
                <div className="flex h-16 shrink-0 items-center gap-3 border-b border-gray-100 px-5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-sm">
                        <WhatsAppOutlined />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold leading-tight text-gray-900">
                            WhatsApp Services
                        </h1>
                        <p className="text-[11px] text-gray-400">
                            Messaging Platform
                        </p>
                    </div>
                </div>

                {/* ==================== WHATSAPP STATUS ==================== */}
                <div className="shrink-0 border-b border-gray-100 p-3">
                    <div className={`rounded-xl border p-3 ${cfg.badge}`}>
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2 text-xs font-semibold">
                                <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                                <span className={cfg.text}>{cfg.label}</span>
                            </span>
                            {connected && statusData?.phoneNumber && (
                                <span className="text-[10px] text-gray-400">
                                    +{statusData.phoneNumber}
                                </span>
                            )}
                        </div>

                        {connected ? (
                            <button
                                onClick={handleSyncContacts}
                                disabled={syncing}
                                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <SyncOutlined spin={syncing} />
                                {syncing ? "Syncing…" : "Sync Contacts"}
                            </button>
                        ) : status === "qr_required" ? (
                            <button
                                onClick={() => {
                                    closeMobile();
                                    navigate("/");
                                }}
                                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-50"
                            >
                                <WhatsAppOutlined />
                                Scan QR on Dashboard
                            </button>
                        ) : (
                            <button
                                onClick={handleConnect}
                                disabled={isConnecting}
                                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <WhatsAppOutlined />
                                {isConnecting ? "Connecting…" : "Connect WhatsApp"}
                            </button>
                        )}
                    </div>
                </div>

                {/* ==================== NAVIGATION ==================== */}
                <nav className="flex-1 overflow-y-auto px-3 py-4 [scrollbar-width:thin]">
                    {navGroups.map((group) => (
                        <div key={group.label} className="mb-5">
                            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                {group.label}
                            </p>

                            <div className="space-y-1">
                                {group.items.map((item) => {
                                    if (item.children) {
                                        const isOpen = isMenuOpen(item.label);

                                        return (
                                            <div key={item.label}>
                                                <button
                                                    onClick={() => toggleMenu(item.label)}
                                                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition ${
                                                        isOpen
                                                            ? "bg-emerald-50 font-semibold text-emerald-600"
                                                            : "text-gray-600 hover:bg-gray-100"
                                                    }`}
                                                >
                                                    <span className="flex items-center gap-3">
                                                        <span className="text-base">{item.icon}</span>
                                                        <span>{item.label}</span>
                                                    </span>
                                                    <DownOutlined
                                                        className={`text-[10px] transition-transform ${
                                                            isOpen ? "rotate-180" : ""
                                                        }`}
                                                    />
                                                </button>

                                                {isOpen && (
                                                    <div className="ml-4 mt-1 space-y-1 border-l border-gray-200 pl-2">
                                                        {item.children.map((child) => (
                                                            <NavLink
                                                                key={child.path}
                                                                to={child.path}
                                                                onClick={closeMobile}
                                                                className={({ isActive }) =>
                                                                    `flex items-center gap-3 rounded-lg px-3 py-2 text-xs transition ${
                                                                        isActive
                                                                            ? "bg-emerald-50 font-semibold text-emerald-600"
                                                                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                                                                    }`
                                                                }
                                                            >
                                                                <span>{child.icon}</span>
                                                                <span>{child.label}</span>
                                                            </NavLink>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    }

                                    return (
                                        <NavLink
                                            key={item.path}
                                            to={item.path!}
                                            end={item.path === "/"}
                                            onClick={closeMobile}
                                            className={({ isActive }) =>
                                                `group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                                                    isActive
                                                        ? "bg-emerald-50 font-semibold text-emerald-600"
                                                        : "text-gray-600 hover:bg-gray-100"
                                                }`
                                            }
                                        >
                                            <span className="text-base">{item.icon}</span>
                                            <span>{item.label}</span>
                                        </NavLink>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* ==================== USER / LOGOUT ==================== */}
                <div className="shrink-0 border-t border-gray-100 p-3">
                    <div className="flex items-center gap-3 rounded-xl px-2 py-2">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                            {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-gray-900">
                                {user?.fullName || "User"}
                            </p>
                            <p className="truncate text-xs text-gray-400">
                                {user?.wpnumber || "WhatsApp user"}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-500 transition hover:bg-red-50"
                    >
                        <LogoutOutlined />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {logoutOpen && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="mb-1 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Logout
                            </h3>
                            <button
                                onClick={() => setLogoutOpen(false)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100"
                            >
                                ✕
                            </button>
                        </div>
                        <p className="mb-5 text-sm text-gray-500">
                            What would you like to do? Your data (contacts, templates,
                            campaigns) stays safe either way.
                        </p>

                        <div className="space-y-2.5">
                            <button
                                onClick={handleWebsiteLogout}
                                className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-left transition hover:border-emerald-300 hover:bg-emerald-50"
                            >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-lg text-emerald-600">
                                    <LogoutOutlined />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-gray-800">
                                        Website logout
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        Sign out of the app — the token will be removed and
                                        the next login will require OTP
                                    </p>
                                </div>
                            </button>

                            <button
                                onClick={handleWhatsAppLogout}
                                disabled={waLoggingOut}
                                className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-left transition hover:border-red-300 hover:bg-red-50 disabled:opacity-60"
                            >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-lg text-red-600">
                                    <WhatsAppOutlined />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-gray-800">
                                        {waLoggingOut
                                            ? "Logging out…"
                                            : "WhatsApp logout"}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        Full logout — the WhatsApp device will be
                                        unlinked and you will need to scan the QR
                                        again. Your data (contacts, templates)
                                        stays safe in the DB
                                    </p>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Sidebar;
