import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import Animation from "@/components/ui/animation/Animation";
import { AnimationConst } from "@/consts/animation/AnimationConst";
import { useWhatsappGroups } from "@/features/groups/hooks/useWhatsappGroups";
import type { WhatsappGroup } from "@/features/groups/api/whatsapp.groups.api";
import {
    TeamOutlined,
    ApartmentOutlined,
    SearchOutlined,
    ReloadOutlined,
} from "@ant-design/icons";

const AVATAR_COLORS = [
    "bg-emerald-100 text-emerald-700",
    "bg-blue-100 text-blue-700",
    "bg-amber-100 text-amber-700",
    "bg-purple-100 text-purple-700",
    "bg-rose-100 text-rose-700",
    "bg-cyan-100 text-cyan-700",
];

const GroupCard: React.FC<{ group: WhatsappGroup }> = ({ group }) => {
    const initials = useMemo(() => {
        const parts = String(group.subject).trim().split(/\s+/);
        const first = parts[0]?.[0] || "G";
        const last = parts[1]?.[0] || "";
        return (first + last).toUpperCase();
    }, [group.subject]);

    const colorIndex =
        Math.abs(
            group.subject
                .split("")
                .reduce((acc, ch) => acc + ch.charCodeAt(0), 0),
        ) % AVATAR_COLORS.length;

    return (
        <Link
            to={`/groups/${encodeURIComponent(group.id)}`}
            className="group flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-emerald-300 hover:shadow-md"
        >
            <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${AVATAR_COLORS[colorIndex]}`}
            >
                {initials}
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold text-gray-900 group-hover:text-emerald-700">
                        {group.subject}
                    </p>

                    {group.isOwnedByMe ? (
                        <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                            ⭐ Owner
                        </span>
                    ) : (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
                            Member
                        </span>
                    )}

                    {group.isCommunity && (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                            Community
                        </span>
                    )}

                    {group.canMessage ? (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                            ✓ Can message
                        </span>
                    ) : (
                        <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600">
                            ✗ Cannot message
                        </span>
                    )}

                    {group.isCommunityAnnounce && (
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                            Announcement
                        </span>
                    )}

                    {group.announce && !group.isCommunity && (
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                            Admin Only
                        </span>
                    )}
                </div>

                <p className="mt-0.5 text-xs text-gray-400">
                    {group.size} members
                </p>

                {group.desc && (
                    <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                        {group.desc}
                    </p>
                )}
            </div>

            <span className="mt-1 shrink-0 text-xs text-gray-300 transition group-hover:text-emerald-500">
                →
            </span>
        </Link>
    );
};

type OwnershipFilter = "all" | "mine" | "others";
type MessageFilter = "all" | "can" | "cannot";

const GroupsPage: React.FC = () => {
    const { data, isLoading, isError, error, refetch, isFetching } =
        useWhatsappGroups();
    const [search, setSearch] = useState("");
    const [ownership, setOwnership] = useState<OwnershipFilter>("all");
    const [messageAccess, setMessageAccess] =
        useState<MessageFilter>("all");

    const allGroups = useMemo(() => data?.data ?? [], [data]);

    const mineCount = allGroups.filter((g) => g.isOwnedByMe).length;
    const othersCount = allGroups.length - mineCount;
    const canMessageCount = allGroups.filter((g) => g.canMessage).length;
    const cannotMessageCount = allGroups.length - canMessageCount;

    const groups = useMemo(() => {
        let list = allGroups;

        if (ownership === "mine") {
            list = list.filter((g) => g.isOwnedByMe);
        } else if (ownership === "others") {
            list = list.filter((g) => !g.isOwnedByMe);
        }

        if (messageAccess === "can") {
            list = list.filter((g) => g.canMessage);
        } else if (messageAccess === "cannot") {
            list = list.filter((g) => !g.canMessage);
        }

        if (!search.trim()) return list;

        const q = search.trim().toLowerCase();
        return list.filter(
            (g) =>
                g.subject.toLowerCase().includes(q) ||
                (g.desc ?? "").toLowerCase().includes(q),
        );
    }, [allGroups, ownership, messageAccess, search]);

    const communities = groups.filter((g) => g.isCommunity);
    const announceGroups = groups.filter(
        (g) => !g.isCommunity && g.isCommunityAnnounce,
    );
    const regularGroups = groups.filter(
        (g) => !g.isCommunity && !g.isCommunityAnnounce,
    );

    if (isLoading) {
        return (
            <MainLayout>
                <div className="flex h-full items-center justify-center">
                    <Animation
                        source={AnimationConst.Loader}
                        height={200}
                        width={200}
                        loop={true}
                        className="mx-auto"
                    />
                </div>
            </MainLayout>
        );
    }

    if (isError) {
        return (
            <MainLayout>
                <div className="flex h-full items-center justify-center">
                    <div className="w-full max-w-md rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
                        <h2 className="text-lg font-semibold text-red-700">
                            Failed to load WhatsApp groups
                        </h2>

                        <p className="mt-2 text-sm text-red-600">
                            {error instanceof Error
                                ? error.message
                                : "Something went wrong."}
                        </p>

                        <button
                            onClick={() => refetch()}
                            className="mt-6 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </MainLayout>
        );
    }

    const renderSection = (
        title: string,
        icon: React.ReactNode,
        items: WhatsappGroup[],
    ) => {
        if (!items.length) return null;

        return (
            <div>
                <div className="flex items-center gap-2">
                    <span className="text-base text-emerald-600">{icon}</span>
                    <h2 className="text-sm font-semibold text-gray-900">
                        {title}
                    </h2>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                        {items.length}
                    </span>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                    {items.map((g) => (
                        <GroupCard key={g.id} group={g} />
                    ))}
                </div>
            </div>
        );
    };

    return (
        <MainLayout>
            <div className="flex h-full flex-col">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">
                            Groups & Communities
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            All WhatsApp groups and communities in your account
                        </p>
                    </div>

                    <button
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <ReloadOutlined spin={isFetching} />
                        Refresh
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto py-6">
                    <div className="max-w-4xl space-y-8">
                        {/* Stats + filters */}
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm ring-1 ring-gray-200">
                                Total: {allGroups.length}
                            </span>

                            <button
                                onClick={() => setOwnership("all")}
                                className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                                    ownership === "all"
                                        ? "bg-emerald-600 text-white"
                                        : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50"
                                }`}
                            >
                                All ({allGroups.length})
                            </button>

                            <button
                                onClick={() => setOwnership("mine")}
                                className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                                    ownership === "mine"
                                        ? "bg-emerald-600 text-white"
                                        : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50"
                                }`}
                            >
                                ⭐ Mine ({mineCount})
                            </button>

                            <button
                                onClick={() => setOwnership("others")}
                                className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                                    ownership === "others"
                                        ? "bg-emerald-600 text-white"
                                        : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50"
                                }`}
                            >
                                Others' ({othersCount})
                            </button>
                        </div>

                        {/* Message access filter */}
                        <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4">
                            <span className="text-xs font-semibold text-gray-400">
                                Message access:
                            </span>

                            <button
                                onClick={() => setMessageAccess("all")}
                                className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                                    messageAccess === "all"
                                        ? "bg-emerald-600 text-white"
                                        : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50"
                                }`}
                            >
                                All ({allGroups.length})
                            </button>

                            <button
                                onClick={() => setMessageAccess("can")}
                                className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                                    messageAccess === "can"
                                        ? "bg-emerald-600 text-white"
                                        : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50"
                                }`}
                            >
                                ✓ Can message ({canMessageCount})
                            </button>

                            <button
                                onClick={() => setMessageAccess("cannot")}
                                className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                                    messageAccess === "cannot"
                                        ? "bg-red-600 text-white"
                                        : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50"
                                }`}
                            >
                                ✗ Cannot message ({cannotMessageCount})
                            </button>
                        </div>

                        <div className="relative">
                            <SearchOutlined className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search groups or communities..."
                                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                            />
                        </div>

                        {!groups.length && (
                            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
                                <ApartmentOutlined className="text-3xl text-gray-300" />

                                <p className="mt-3 text-sm font-medium text-gray-700">
                                    No groups or communities found
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                    {search
                                        ? "Try a different search"
                                        : "Groups and communities you join on WhatsApp will appear here"}
                                </p>
                            </div>
                        )}

                        {renderSection(
                            "Communities",
                            <ApartmentOutlined />,
                            communities,
                        )}

                        {renderSection(
                            "Announcement Groups",
                            <TeamOutlined />,
                            announceGroups,
                        )}

                        {renderSection("Groups", <TeamOutlined />, regularGroups)}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default GroupsPage;
