import React, { useState } from "react";
import {
    HomeOutlined,
    SendOutlined,
    FileTextOutlined,
    ContactsOutlined,
    TeamOutlined,
    ApiOutlined,
    BarChartOutlined,
    SettingOutlined,
    LogoutOutlined,
    MessageOutlined,
    AudioOutlined,
    VideoCameraOutlined,
    DownOutlined,
    TagsOutlined,
} from "@ant-design/icons";
import { NavLink, useNavigate } from "react-router-dom";

interface MenuItem {
    label: string;
    path?: string;
    icon: React.ReactNode;
    children?: MenuItem[];
}

const Sidebar: React.FC = () => {
    const navigate = useNavigate();

    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
        Templates: true,
        Contacts: false,
    });

    const menuItems: MenuItem[] = [
        {
            label: "Dashboard",
            path: "/",
            icon: <HomeOutlined />,
        },

        {
            label: "Campaigns",
            path: "/campaigns",
            icon: <SendOutlined />,
        },

        {
            label: "Templates",
            icon: <FileTextOutlined />,
            children: [
                {
                    label: "All Templates",
                    path: "/templates",
                    icon: <FileTextOutlined />,
                },
                {
                    label: "Message",
                    path: "/templates/message",
                    icon: <MessageOutlined />,
                },
                {
                    label: "Audio",
                    path: "/templates/audio",
                    icon: <AudioOutlined />,
                },
                {
                    label: "Video",
                    path: "/templates/video",
                    icon: <VideoCameraOutlined />,
                },
            ],
        },

        {
            label: "Contacts",
            icon: <ContactsOutlined />,
            children: [
                {
                    label: "All Contacts",
                    path: "/contacts",
                    icon: <ContactsOutlined />,
                },
                {
                    label: "Groups",
                    path: "/contacts/groups",
                    icon: <TeamOutlined />,
                },
                {
                    label: "Tags",
                    path: "/contacts/tags",
                    icon: <TagsOutlined />,
                },
            ],
        },

        {
            label: "API & Developers",
            path: "/developers",
            icon: <ApiOutlined />,
        },

        {
            label: "Analytics",
            path: "/analytics",
            icon: <BarChartOutlined />,
        },

        {
            label: "Settings",
            path: "/settings",
            icon: <SettingOutlined />,
        },
    ];

    const toggleMenu = (label: string) => {
        setOpenMenus((prev) => ({
            ...prev,
            [label]: !prev[label],
        }));
    };

    const handleLogout = () => {
        navigate("/auth", { replace: true });
    };

    return (
        <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-gray-200 bg-white">



            {/* ================= NAVIGATION ================= */}

            <nav className="flex-1 overflow-y-auto px-3 py-5">

                <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Workspace
                </p>

                <div className="space-y-1">

                    {menuItems.map((item) => {

                        // ================= PARENT WITH CHILDREN =================

                        if (item.children) {

                            const isOpen = openMenus[item.label];

                            return (
                                <div key={item.label}>

                                    <button
                                        onClick={() => toggleMenu(item.label)}
                                        className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm text-gray-600 transition hover:bg-gray-100"
                                    >

                                        <div className="flex items-center gap-3">

                                            <span className="text-base">
                                                {item.icon}
                                            </span>

                                            <span>
                                                {item.label}
                                            </span>

                                        </div>

                                        <DownOutlined
                                            className={`text-[10px] transition-transform ${isOpen
                                                    ? "rotate-180"
                                                    : ""
                                                }`}
                                        />

                                    </button>

                                    {isOpen && (
                                        <div className="ml-4 mt-1 space-y-1 border-l border-gray-200 pl-2">

                                            {item.children.map((child) => (

                                                <NavLink
                                                    key={child.path}
                                                    to={child.path!}
                                                    className={({ isActive }) =>
                                                        `flex items-center gap-3 rounded-lg px-3 py-2 text-xs transition-all ${isActive
                                                            ? "bg-emerald-50 font-semibold text-emerald-600"
                                                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                                                        }`
                                                    }
                                                >

                                                    <span>
                                                        {child.icon}
                                                    </span>

                                                    <span>
                                                        {child.label}
                                                    </span>

                                                </NavLink>

                                            ))}

                                        </div>
                                    )}

                                </div>
                            );
                        }

                        // ================= NORMAL MENU =================

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path!}
                                end={item.path === "/"}
                                className={({ isActive }) =>
                                    `group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${isActive
                                        ? "bg-emerald-50 font-semibold text-emerald-600"
                                        : "text-gray-600 hover:bg-gray-100"
                                    }`
                                }
                            >

                                <span className="text-base">
                                    {item.icon}
                                </span>

                                <span>
                                    {item.label}
                                </span>

                            </NavLink>
                        );
                    })}

                </div>
            </nav>

            {/* ================= BOTTOM ================= */}

            <div className="shrink-0 border-t border-gray-200 p-3">

                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-500 transition hover:bg-red-50"
                >

                    <LogoutOutlined />

                    <span>
                        Logout
                    </span>

                </button>

            </div>

        </aside>
    );
};

export default Sidebar;