import React, { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import Animation from "@/components/ui/animation/Animation";
import { AnimationConst } from "@/consts/animation/AnimationConst";
import { useWhatsappGroupDetail } from "@/features/groups/hooks/useWhatsappGroupDetail";
import { MemberRow } from "@/features/groups/components/MemberRow";
import { getInitials } from "@/features/groups/components/memberHelpers";
import {
    ArrowLeftOutlined,
    ApartmentOutlined,
    TeamOutlined,
    SearchOutlined,
    ReloadOutlined,
    ThunderboltOutlined,
    UserAddOutlined,
    CrownOutlined,
    CalendarOutlined,
    PhoneOutlined,
} from "@ant-design/icons";

/** Full-screen shell — sidebar stays, everything else fills the screen. */
const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="w-full h-screen">
        <Sidebar />
        <div className="flex h-screen flex-col lg:ml-64">{children}</div>
    </div>
);

const GroupDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { data, isLoading, isError, error, refetch, isFetching } =
        useWhatsappGroupDetail(id);
    const [memberSearch, setMemberSearch] = useState("");
    const [showMembers, setShowMembers] = useState(false);

    const group = data?.data;

    const members = useMemo(() => {
        if (!group) return [];

        const list = [...group.participants];

        if (memberSearch.trim()) {
            const q = memberSearch.trim().toLowerCase();
            return list.filter(
                (m) =>
                    (m.name ?? "").toLowerCase().includes(q) ||
                    (m.number ?? "").includes(q),
            );
        }

        return list.sort((a, b) => {
            if (a.isAdmin !== b.isAdmin) return a.isAdmin ? -1 : 1;
            return (a.name ?? "").localeCompare(b.name ?? "");
        });
    }, [group, memberSearch]);

    const adminCount = group?.participants.filter((m) => m.isAdmin).length ?? 0;

    if (isLoading) {
        return (
            <Shell>
                <div className="flex flex-1 items-center justify-center">
                    <Animation
                        source={AnimationConst.Loader}
                        height={200}
                        width={200}
                        loop={true}
                        className="mx-auto"
                    />
                </div>
            </Shell>
        );
    }

    if (isError || !group) {
        return (
            <Shell>
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-md rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
                        <h2 className="text-lg font-semibold text-red-700">
                            Failed to load group details
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
            </Shell>
        );
    }

    const initials = getInitials(group.subject);
    const createdDate = group.creation
        ? new Date(group.creation).toLocaleDateString()
        : null;
    const totalMembers = group.size ?? group.participants.length;

    return (
        <Shell>
            {/* ==================== HEADER ==================== */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 lg:px-6">
                <div className="flex items-center gap-3">
                    <Link
                        to="/groups"
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50 hover:text-gray-700"
                    >
                        <ArrowLeftOutlined />
                    </Link>

                    <div>
                        <h1 className="text-xl font-semibold text-gray-900 lg:text-2xl">
                            {group.isCommunity
                                ? "Community Details"
                                : "Group Details"}
                        </h1>

                        <p className="mt-0.5 text-sm text-gray-500">
                            Overview, stats and member directory
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Refresh"
                    >
                        <ReloadOutlined spin={isFetching} />
                    </button>                        {group.canMessage && (
                            <Link
                                to={`/groups/${encodeURIComponent(id!)}/automation`}
                                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-emerald-500/25 transition hover:bg-emerald-700"
                            >
                                <ThunderboltOutlined />
                                Automation
                            </Link>
                        )}
                    </div>
                </div>

            <div className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-6">
                <div className="space-y-6">
                        {/* ==================== HERO CARD ==================== */}
                        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                            {/* Gradient accent */}
                            <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600" />

                            <div className="p-6">
                                <div className="flex flex-wrap items-center gap-4">
                                    {group.profilePicUrl ? (
                                        <img
                                            src={group.profilePicUrl}
                                            alt={group.subject}
                                            className="h-20 w-20 rounded-2xl object-cover ring-4 ring-emerald-50"
                                        />
                                    ) : (
                                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-2xl font-bold text-emerald-700">
                                            {initials}
                                        </div>
                                    )}

                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h2 className="text-2xl font-bold text-gray-900">
                                                {group.subject}
                                            </h2>

                                            {group.isCommunity && (
                                                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                                                    Community
                                                </span>
                                            )}

                                            {group.isCommunityAnnounce && (
                                                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
                                                    Announcement
                                                </span>
                                            )}

                                            {group.isOwnedByMe && (
                                                <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                                                    ⭐ Owner
                                                </span>
                                            )}
                                        </div>

                                        <p className="mt-1 text-sm text-gray-500">
                                            {group.desc || "No description set"}
                                        </p>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                    <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3.5">
                                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500">
                                            <TeamOutlined /> Total Members
                                        </div>
                                        <p className="mt-1 text-xl font-bold text-gray-900">
                                            {totalMembers}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3.5">
                                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500">
                                            <CrownOutlined /> Admins
                                        </div>
                                        <p className="mt-1 text-xl font-bold text-gray-900">
                                            {adminCount}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3.5">
                                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500">
                                            <CalendarOutlined /> Created
                                        </div>
                                        <p className="mt-1 truncate text-sm font-bold text-gray-900">
                                            {createdDate || "Unknown"}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3.5">
                                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500">
                                            <PhoneOutlined /> Owner
                                        </div>
                                        <p className="mt-1 truncate text-sm font-bold text-gray-900">
                                            {group.ownerNumber
                                                ? `+${group.ownerNumber}`
                                                : "Unknown"}
                                        </p>
                                    </div>
                                </div>

                                {/* Message authority */}
                                <div
                                    className={`mt-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${
                                        group.canMessage
                                            ? "bg-emerald-50 text-emerald-700"
                                            : "bg-red-50 text-red-600"
                                    }`}
                                >
                                    {group.canMessage ? (
                                        <>
                                            <span className="text-base">
                                                ✓
                                            </span>
                                            You can send messages in this{" "}
                                            {group.isCommunity
                                                ? "community"
                                                : "group"}
                                            {group.amIAdmin
                                                ? " — you are an admin"
                                                : ""}
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-base">
                                                ✗
                                            </span>
                                            You cannot send messages — only
                                            admins can message in this{" "}
                                            {group.isCommunity
                                                ? "community"
                                                : "group"}
                                        </>
                                    )}
                                </div>

                                {/* Settings chips */}
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                                            group.restrict
                                                ? "bg-amber-50 text-amber-700"
                                                : "bg-gray-100 text-gray-500"
                                        }`}
                                    >
                                        {group.restrict
                                            ? "🔒 Admin-only settings"
                                            : "All members can edit settings"}
                                    </span>

                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                                            group.announce
                                                ? "bg-amber-50 text-amber-700"
                                                : "bg-gray-100 text-gray-500"
                                        }`}
                                    >
                                        {group.announce
                                            ? "📢 Admin-only messages"
                                            : "All members can message"}
                                    </span>

                                    {group.memberAddMode && (
                                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                                            ➕ All members can add
                                        </span>
                                    )}

                                    {group.joinApprovalMode && (
                                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                                            ✅ Join approval on
                                        </span>
                                    )}

                                    {group.inviteCode && (
                                        <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">
                                            🔗 Invite link available
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ==================== MEMBERS ==================== */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <TeamOutlined className="text-base text-emerald-600" />

                                    <h3 className="text-sm font-semibold text-gray-900">
                                        Members
                                    </h3>

                                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                                        {totalMembers}
                                    </span>
                                </div>

                                <button
                                    onClick={() => setShowMembers((v) => !v)}
                                    className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                        showMembers
                                            ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                            : "bg-emerald-600 text-white hover:bg-emerald-700"
                                    }`}
                                >
                                    {showMembers ? (
                                        "Hide"
                                    ) : (
                                        <>
                                            <UserAddOutlined />
                                            Show Members
                                        </>
                                    )}
                                </button>
                            </div>

                            {showMembers && (
                                <div className="mt-4 space-y-3">
                                    <div className="relative">
                                        <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                                        <input
                                            type="text"
                                            value={memberSearch}
                                            onChange={(e) =>
                                                setMemberSearch(e.target.value)
                                            }
                                            placeholder="Search name or number..."
                                            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-emerald-500 focus:bg-white"
                                        />
                                    </div>

                                    {!members.length && (
                                        <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">
                                            <ApartmentOutlined className="text-2xl text-gray-300" />

                                            <p className="mt-2 text-sm text-gray-500">
                                                No members found
                                            </p>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        {members.map((m) => (
                                            <MemberRow
                                                key={m.jid}
                                                member={m}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

        </Shell>
    );
};

export default GroupDetailPage;
