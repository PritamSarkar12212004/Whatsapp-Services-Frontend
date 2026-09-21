import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { GroupsPageSkeleton } from "@/components/ui/skeleton/PageSkeletons";
import { useWhatsappGroups } from "@/features/groups/hooks/useWhatsappGroups";
import type { WhatsappGroup } from "@/features/groups/api/whatsapp.groups.api";
import {
    TeamOutlined,
    ApartmentOutlined,
    SearchOutlined,
    ReloadOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    StarFilled,
    ArrowRightOutlined,
    NotificationOutlined,
} from "@ant-design/icons";

/**
 * Avatar tiles are picked by hashing the group name. The stops are deliberately
 * deep (700/800) so the white initials keep ~5:1 contrast on every tile.
 */
const AVATAR_GRADIENTS = [
    "from-emerald-700 to-teal-800",
    "from-sky-700 to-blue-800",
    "from-amber-700 to-orange-800",
    "from-violet-700 to-purple-800",
    "from-rose-700 to-pink-800",
    "from-cyan-700 to-sky-800",
];

const avatarGradient = (subject: string) => {
    const sum = String(subject)
        .split("")
        .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return AVATAR_GRADIENTS[Math.abs(sum) % AVATAR_GRADIENTS.length];
};

const chip =
    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold";

/** One square group / community tile. */
const GroupCard: React.FC<{ group: WhatsappGroup }> = ({ group }) => {
    const initials = useMemo(() => {
        const parts = String(group.subject).trim().split(/\s+/);
        const first = parts[0]?.[0] || "G";
        const last = parts[1]?.[0] || "";
        return (first + last).toUpperCase();
    }, [group.subject]);

    const extras: { label: string; className: string }[] = [];
    if (group.isCommunity) {
        extras.push({ label: "Community", className: "bg-emerald-50 text-emerald-700" });
    }
    if (group.isCommunityAnnounce) {
        extras.push({ label: "Announcement", className: "bg-blue-50 text-blue-700" });
    }
    if (group.announce && !group.isCommunity) {
        extras.push({ label: "Admin only", className: "bg-amber-50 text-amber-700" });
    }

    return (
        <Link
            to={`/groups/${encodeURIComponent(group.id)}`}
            className="group relative flex aspect-square flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white p-3 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg sm:p-4"
        >
            {/* Soft accent glow that fades in on hover */}
            <span className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-emerald-500/10 opacity-0 blur-2xl transition duration-300 group-hover:opacity-100" />

            <div className="flex items-start justify-between gap-2">
                <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-xs font-bold text-white shadow-sm sm:h-11 sm:w-11 sm:text-sm ${avatarGradient(
                        group.subject,
                    )}`}
                >
                    {initials}
                </div>

                <div className="flex flex-col items-end gap-1">
                    {group.isOwnedByMe ? (
                        <span className={`${chip} bg-emerald-700 text-white`}>
                            <StarFilled /> Owner
                        </span>
                    ) : (
                        <span className={`${chip} bg-gray-100 text-gray-500`}>
                            Member
                        </span>
                    )}

                    {group.canMessage ? (
                        <span
                            title="You can send messages here"
                            className={`${chip} bg-emerald-50 text-emerald-700`}
                        >
                            <CheckCircleOutlined /> Send
                        </span>
                    ) : (
                        <span
                            title="Read-only — messaging is disabled for you here"
                            className={`${chip} bg-red-50 text-red-600`}
                        >
                            <CloseCircleOutlined /> Read only
                        </span>
                    )}
                </div>
            </div>

            {/* Centred in the square so tall tiles never look half-empty */}
            <div className="mt-2 flex min-h-0 flex-1 flex-col justify-center">
                <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-gray-900 transition group-hover:text-emerald-700 sm:text-sm">
                    {group.subject}
                </p>

                {group.desc && (
                    <p className="mt-1 line-clamp-1 text-[11px] leading-relaxed text-gray-400 sm:line-clamp-2 xl:line-clamp-3">
                        {group.desc}
                    </p>
                )}

                {extras.length > 0 && (
                    <div className="mt-2 flex max-h-5 flex-wrap gap-1 overflow-hidden">
                        {extras.map((e) => (
                            <span key={e.label} className={`${chip} ${e.className}`}>
                                {e.label}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-2.5">
                <span className="truncate text-[11px] font-medium text-gray-400">
                    {group.size.toLocaleString()} members
                </span>
                <ArrowRightOutlined className="text-[11px] text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-emerald-600" />
            </div>
        </Link>
    );
};

type OwnershipFilter = "all" | "mine" | "others";
type MessageFilter = "all" | "can" | "cannot";

const segmented =
    "inline-flex flex-wrap items-center gap-1 rounded-xl bg-gray-100 p-1";

const segmentBtn = (on: boolean, danger = false) =>
    `cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
        on
            ? danger
                ? "bg-red-600 text-white shadow-sm"
                : "bg-white text-emerald-700 shadow-sm"
            : "text-gray-600 hover:text-gray-900"
    }`;

const GroupsPage: React.FC = () => {
    const { data, isLoading, isError, error, refetch, isFetching } =
        useWhatsappGroups();
    const [search, setSearch] = useState("");
    const [ownership, setOwnership] = useState<OwnershipFilter>("all");
    const [messageAccess, setMessageAccess] = useState<MessageFilter>("all");

    const allGroups = useMemo(() => data?.data ?? [], [data]);

    const mineCount = allGroups.filter((g) => g.isOwnedByMe).length;
    const othersCount = allGroups.length - mineCount;
    const canMessageCount = allGroups.filter((g) => g.canMessage).length;
    const cannotMessageCount = allGroups.length - canMessageCount;
    const communityCount = allGroups.filter((g) => g.isCommunity).length;

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

    const filtersActive =
        ownership !== "all" || messageAccess !== "all" || !!search.trim();

    const clearFilters = () => {
        setOwnership("all");
        setMessageAccess("all");
        setSearch("");
    };

    if (isLoading) {
        return (
            <MainLayout>
                <GroupsPageSkeleton />
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

    const stats = [
        {
            label: "Groups & communities",
            value: allGroups.length,
            icon: <TeamOutlined />,
            tone: "bg-emerald-50 text-emerald-700",
        },
        {
            label: "Communities",
            value: communityCount,
            icon: <ApartmentOutlined />,
            tone: "bg-blue-50 text-blue-700",
        },
        {
            label: "Owned by me",
            value: mineCount,
            icon: <StarFilled />,
            tone: "bg-amber-50 text-amber-700",
        },
        {
            label: "Can message",
            value: canMessageCount,
            icon: <CheckCircleOutlined />,
            tone: "bg-purple-100 text-purple-700",
        },
    ];

    const renderSection = (
        title: string,
        icon: React.ReactNode,
        items: WhatsappGroup[],
    ) => {
        if (!items.length) return null;

        return (
            <section>
                <div className="mb-3 flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-sm text-emerald-700">
                        {icon}
                    </span>
                    <h2 className="text-sm font-semibold text-gray-900">
                        {title}
                    </h2>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500">
                        {items.length}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
                    {items.map((g) => (
                        <GroupCard key={g.id} group={g} />
                    ))}
                </div>
            </section>
        );
    };

    return (
        <MainLayout>
            <div className="flex h-full flex-col">
                <div className="flex flex-wrap items-center justify-between gap-3">
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
                        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <ReloadOutlined spin={isFetching} />
                        Refresh
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto py-5">
                    <div className="space-y-5">
                        {/* Snapshot stats */}
                        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                            {stats.map((s) => (
                                <div
                                    key={s.label}
                                    className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3.5 shadow-sm"
                                >
                                    <span
                                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm ${s.tone}`}
                                    >
                                        {s.icon}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-lg font-semibold leading-none text-gray-900">
                                            {s.value.toLocaleString()}
                                        </p>
                                        <p className="mt-1 truncate text-[11px] font-medium text-gray-400">
                                            {s.label}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Filters + search */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
                            <div className="flex flex-wrap items-center gap-2">
                                <div className={segmented}>
                                    <button
                                        onClick={() => setOwnership("all")}
                                        className={segmentBtn(ownership === "all")}
                                    >
                                        All ({allGroups.length})
                                    </button>
                                    <button
                                        onClick={() => setOwnership("mine")}
                                        className={segmentBtn(ownership === "mine")}
                                    >
                                        <StarFilled /> Mine ({mineCount})
                                    </button>
                                    <button
                                        onClick={() => setOwnership("others")}
                                        className={segmentBtn(ownership === "others")}
                                    >
                                        Others&apos; ({othersCount})
                                    </button>
                                </div>

                                <div className={segmented}>
                                    <button
                                        onClick={() => setMessageAccess("all")}
                                        className={segmentBtn(messageAccess === "all")}
                                    >
                                        Any access
                                    </button>
                                    <button
                                        onClick={() => setMessageAccess("can")}
                                        className={segmentBtn(messageAccess === "can")}
                                    >
                                        <CheckCircleOutlined /> Can message (
                                        {canMessageCount})
                                    </button>
                                    <button
                                        onClick={() => setMessageAccess("cannot")}
                                        className={segmentBtn(
                                            messageAccess === "cannot",
                                            true,
                                        )}
                                    >
                                        <CloseCircleOutlined /> Cannot (
                                        {cannotMessageCount})
                                    </button>
                                </div>
                            </div>

                            <div className="mt-3 flex items-center gap-2">
                                <div className="relative flex-1">
                                    <SearchOutlined className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />

                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search groups or communities..."
                                        className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                    />
                                </div>

                                {filtersActive && (
                                    <button
                                        onClick={clearFilters}
                                        className="shrink-0 cursor-pointer rounded-xl px-3 py-2.5 text-xs font-semibold text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>

                        {!groups.length && (
                            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
                                <ApartmentOutlined className="text-3xl text-gray-300" />

                                <p className="mt-3 text-sm font-medium text-gray-700">
                                    No groups or communities found
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                    {filtersActive
                                        ? "No match for the current filters"
                                        : "Groups and communities you join on WhatsApp will appear here"}
                                </p>

                                {filtersActive && (
                                    <button
                                        onClick={clearFilters}
                                        className="mt-4 cursor-pointer rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 transition hover:border-emerald-300 hover:text-emerald-700"
                                    >
                                        Clear filters
                                    </button>
                                )}
                            </div>
                        )}

                        {renderSection(
                            "Communities",
                            <ApartmentOutlined />,
                            communities,
                        )}

                        {renderSection(
                            "Announcement Groups",
                            <NotificationOutlined />,
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
