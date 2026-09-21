import React, { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import Sidebar from "@/components/layout/Sidebar";
import { GroupDetailSkeleton } from "@/components/ui/skeleton/PageSkeletons";
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
    CrownOutlined,
    CalendarOutlined,
    PhoneOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    DownOutlined,
    UpOutlined,
    LockOutlined,
    MessageOutlined,
    UserAddOutlined,
    SafetyCertificateOutlined,
    LinkOutlined,
    StarFilled,
    SoundOutlined,
} from "@ant-design/icons";

/** Full-screen shell — sidebar stays, everything else fills the screen. */
const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="w-full h-screen">
        <Sidebar />
        <div className="flex h-screen flex-col lg:ml-64">{children}</div>
    </div>
);

const chip =
    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold";

const segmented = "inline-flex flex-wrap items-center gap-1 rounded-xl bg-gray-100 p-1";

const segmentBtn = (on: boolean) =>
    `cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
        on ? "bg-white text-emerald-700 shadow-sm" : "text-gray-600 hover:text-gray-900"
    }`;

/** One "group setting" tile: icon, label and current value. */
const SettingRow: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string;
    on: boolean;
}> = ({ icon, label, value, on }) => (
    <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/70 px-3 py-2.5">
        <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm ${
                on ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
            }`}
        >
            {icon}
        </span>

        <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-gray-900">{label}</p>
            <p className="truncate text-[11px] text-gray-500">{value}</p>
        </div>
    </div>
);

const GroupDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { data, isLoading, isError, error, refetch, isFetching } =
        useWhatsappGroupDetail(id);
    const [memberSearch, setMemberSearch] = useState("");
    const [memberFilter, setMemberFilter] = useState<"all" | "admins" | "members">("all");
    const [showMembers, setShowMembers] = useState(false);

    const group = data?.data;

    const members = useMemo(() => {
        if (!group) return [];

        let list = [...group.participants].sort((a, b) => {
            if (a.isAdmin !== b.isAdmin) return a.isAdmin ? -1 : 1;
            return (a.name ?? "").localeCompare(b.name ?? "");
        });

        if (memberFilter === "admins") {
            list = list.filter((m) => m.isAdmin || m.isSuperAdmin);
        } else if (memberFilter === "members") {
            list = list.filter((m) => !m.isAdmin && !m.isSuperAdmin);
        }

        if (memberSearch.trim()) {
            const q = memberSearch.trim().toLowerCase();
            list = list.filter(
                (m) =>
                    (m.name ?? "").toLowerCase().includes(q) ||
                    (m.number ?? "").includes(q),
            );
        }

        return list;
    }, [group, memberSearch, memberFilter]);

    const adminCount = group?.participants.filter((m) => m.isAdmin).length ?? 0;

    if (isLoading) {
        return (
            <Shell>
                <GroupDetailSkeleton />
            </Shell>
        );
    }

    if (isError || !group) {
        return (
            <Shell>
                <div className="flex flex-1 items-center justify-center p-4">
                    <div className="w-full max-w-md rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
                        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600 text-xl text-white">
                            <CloseCircleOutlined />
                        </span>

                        <h2 className="mt-4 text-lg font-semibold text-red-700">
                            Failed to load group details
                        </h2>

                        <p className="mt-2 text-sm text-red-600">
                            {error instanceof Error
                                ? error.message
                                : "Something went wrong."}
                        </p>

                        <button
                            onClick={() => refetch()}
                            className="mt-6 cursor-pointer rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            </Shell>
        );
    }

    const initials = getInitials(group.subject);
    const createdDate = group.creation
        ? new Date(group.creation).toLocaleDateString(undefined, {
              day: "numeric",
              month: "short",
              year: "numeric",
          })
        : null;
    const totalMembers = group.size ?? group.participants.length;
    const plainMembers = Math.max(totalMembers - adminCount, 0);
    const isGroup = group.isCommunity ? "community" : "group";

    const copyInvite = () => {
        if (!group.inviteCode) return;

        const url = `https://chat.whatsapp.com/${group.inviteCode}`;
        navigator.clipboard
            .writeText(url)
            .then(() => toast.success("Invite link copied"))
            .catch(() => toast.error("Copy failed"));
    };

    const stats = [
        {
            label: "Members",
            value: totalMembers,
            icon: <TeamOutlined />,
            tone: "bg-emerald-50 text-emerald-700",
        },
        {
            label: "Admins",
            value: adminCount,
            icon: <CrownOutlined />,
            tone: "bg-amber-50 text-amber-700",
        },
        {
            label: "Created",
            value: createdDate || "Unknown",
            icon: <CalendarOutlined />,
            tone: "bg-blue-50 text-blue-700",
        },
        {
            label: "Owner",
            value: group.ownerNumber ? `+${group.ownerNumber}` : "Unknown",
            icon: <PhoneOutlined />,
            tone: "bg-violet-50 text-violet-700",
        },
    ];

    return (
        <Shell>
            {/* ==================== HEADER ==================== */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3 lg:px-6">
                <div className="flex min-w-0 items-center gap-3">
                    <Link
                        to="/groups"
                        title="Back to groups"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition hover:border-emerald-300 hover:text-emerald-700"
                    >
                        <ArrowLeftOutlined />
                    </Link>

                    <div className="min-w-0">
                        <h1 className="truncate text-lg font-semibold text-gray-900 lg:text-xl">
                            {group.isCommunity ? "Community Details" : "Group Details"}
                        </h1>

                        <p className="mt-0.5 truncate text-xs text-gray-500 lg:text-sm">
                            Overview, settings and member directory
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => refetch()}
                        disabled={isFetching}
                        title="Refresh"
                        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <ReloadOutlined spin={isFetching} />
                    </button>

                    {group.canMessage ? (
                        <Link
                            to={`/groups/${encodeURIComponent(id!)}/automation`}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                        >
                            <ThunderboltOutlined />
                            Automation
                        </Link>
                    ) : (
                        <span
                            title="Only admins can message here"
                            className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-3 py-2.5 text-xs font-semibold text-gray-500"
                        >
                            <LockOutlined />
                            Read only
                        </span>
                    )}
                </div>
            </div>

            {/* ==================== BODY ==================== */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-6">
                <div className="space-y-5">
                    {/* -------------------- HERO -------------------- */}
                    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
                        <div className="relative h-24 bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700">
                            <span className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
                            <span className="pointer-events-none absolute left-1/3 top-4 h-20 w-20 rounded-full bg-white/10 blur-2xl" />
                        </div>

                        <div className="px-5 pb-5">
                            <div className="flex flex-wrap items-end justify-between gap-4">
                                <div className="flex min-w-0 items-end gap-4">
                                    <div className="-mt-12 shrink-0">
                                        {group.profilePicUrl ? (
                                            <img
                                                src={group.profilePicUrl}
                                                alt={group.subject}
                                                className="h-20 w-20 rounded-2xl object-cover shadow-lg"
                                            />
                                        ) : (
                                            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-700 to-teal-800 text-2xl font-bold text-white shadow-lg">
                                                {initials}
                                            </div>
                                        )}
                                    </div>

                                    <div className="min-w-0 pb-0.5">
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            <h2 className="truncate text-xl font-bold text-gray-900 lg:text-2xl">
                                                {group.subject}
                                            </h2>

                                            {group.isCommunity && (
                                                <span className={`${chip} bg-emerald-50 text-emerald-700`}>
                                                    <ApartmentOutlined /> Community
                                                </span>
                                            )}

                                            {group.isCommunityAnnounce && (
                                                <span className={`${chip} bg-blue-50 text-blue-700`}>
                                                    <SoundOutlined /> Announcement
                                                </span>
                                            )}

                                            {group.isOwnedByMe && (
                                                <span className={`${chip} bg-emerald-700 text-white`}>
                                                    <StarFilled /> Owner
                                                </span>
                                            )}

                                            {group.amIAdmin && !group.isOwnedByMe && (
                                                <span className={`${chip} bg-amber-50 text-amber-700`}>
                                                    <CrownOutlined /> Admin
                                                </span>
                                            )}
                                        </div>

                                        <p className="mt-1.5 line-clamp-2 text-sm text-gray-500">
                                            {group.desc || "No description set"}
                                        </p>
                                    </div>
                                </div>

                                {group.inviteCode && (
                                    <button
                                        onClick={copyInvite}
                                        className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-700 transition hover:border-emerald-300 hover:text-emerald-700"
                                    >
                                        <LinkOutlined />
                                        Copy invite link
                                    </button>
                                )}
                            </div>

                            {/* Message authority */}
                            <div
                                className={`mt-5 flex items-start gap-3 rounded-2xl border p-3.5 ${
                                    group.canMessage
                                        ? "border-emerald-200 bg-emerald-50"
                                        : "border-red-200 bg-red-50"
                                }`}
                            >
                                <span
                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base text-white ${
                                        group.canMessage ? "bg-emerald-700" : "bg-red-600"
                                    }`}
                                >
                                    {group.canMessage ? (
                                        <CheckCircleOutlined />
                                    ) : (
                                        <CloseCircleOutlined />
                                    )}
                                </span>

                                <div className="min-w-0">
                                    <p
                                        className={`text-sm font-semibold ${
                                            group.canMessage
                                                ? "text-emerald-700"
                                                : "text-red-700"
                                        }`}
                                    >
                                        {group.canMessage
                                            ? `You can message in this ${isGroup}`
                                            : `Read-only ${isGroup}`}
                                    </p>

                                    <p
                                        className={`mt-0.5 text-xs ${
                                            group.canMessage
                                                ? "text-emerald-700"
                                                : "text-red-600"
                                        }`}
                                    >
                                        {group.canMessage
                                            ? group.amIAdmin
                                                ? "You are an admin here — bots and campaigns can post."
                                                : "Your number already has send permission here."
                                            : "Only admins can send messages here, so bots and campaigns cannot post."}
                                    </p>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                                {stats.map((s) => (
                                    <div
                                        key={s.label}
                                        className="rounded-2xl border border-gray-100 bg-gray-50/70 p-3.5"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm ${s.tone}`}
                                            >
                                                {s.icon}
                                            </span>
                                            <span className="truncate text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                                                {s.label}
                                            </span>
                                        </div>

                                        <p className="mt-2 truncate text-lg font-bold text-gray-900">
                                            {s.value}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Settings */}
                            <div className="mt-5">
                                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                                    Group settings
                                </p>

                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                    <SettingRow
                                        icon={<LockOutlined />}
                                        label="Edit group info"
                                        value={
                                            group.restrict
                                                ? "Admins only"
                                                : "Any member can edit"
                                        }
                                        on={group.restrict}
                                    />

                                    <SettingRow
                                        icon={<MessageOutlined />}
                                        label="Send messages"
                                        value={
                                            group.announce
                                                ? "Admins only"
                                                : "Any member can send"
                                        }
                                        on={group.announce}
                                    />

                                    <SettingRow
                                        icon={<UserAddOutlined />}
                                        label="Add members"
                                        value={
                                            group.memberAddMode
                                                ? "Any member can add"
                                                : "Admins only"
                                        }
                                        on={group.memberAddMode}
                                    />

                                    <SettingRow
                                        icon={<SafetyCertificateOutlined />}
                                        label="Join approval"
                                        value={
                                            group.joinApprovalMode
                                                ? "On — admin approves"
                                                : "Off — anyone with the link"
                                        }
                                        on={group.joinApprovalMode}
                                    />

                                    {group.community && (
                                        <SettingRow
                                            icon={<ApartmentOutlined />}
                                            label="Community"
                                            value={group.community.subject ?? "Linked community"}
                                            on
                                        />
                                    )}

                                    {group.inviteCode && (
                                        <SettingRow
                                            icon={<LinkOutlined />}
                                            label="Invite link"
                                            value="Available to share"
                                            on
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* -------------------- MEMBERS -------------------- */}
                    <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-sm text-emerald-700">
                                    <TeamOutlined />
                                </span>

                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900">
                                        Members
                                    </h3>

                                    <p className="text-[11px] text-gray-500">
                                        {totalMembers} member
                                        {totalMembers === 1 ? "" : "s"} · {adminCount}
                                        {" admin"}
                                        {adminCount === 1 ? "" : "s"} ·{" "}
                                        {group.participants.length} loaded
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowMembers((v) => !v)}
                                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 transition hover:border-emerald-300 hover:text-emerald-700"
                            >
                                {showMembers ? <UpOutlined /> : <DownOutlined />}
                                {showMembers ? "Hide list" : "Show list"}
                            </button>
                        </div>

                        {showMembers && (
                            <>
                                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                                    <div className={segmented}>
                                        {(
                                            [
                                                ["all", "All", group.participants.length],
                                                ["admins", "Admins", adminCount],
                                                ["members", "Members", plainMembers],
                                            ] as const
                                        ).map(([value, label, count]) => (
                                            <button
                                                key={value}
                                                onClick={() => setMemberFilter(value)}
                                                className={segmentBtn(
                                                    memberFilter === value,
                                                )}
                                            >
                                                {label}{" "}
                                                <span className="opacity-60">
                                                    {count}
                                                </span>
                                            </button>
                                        ))}
                                    </div>

                                    <div className="relative w-full sm:w-72">
                                        <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                                        <input
                                            type="text"
                                            value={memberSearch}
                                            onChange={(e) =>
                                                setMemberSearch(e.target.value)
                                            }
                                            placeholder="Search name or number…"
                                            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:bg-white"
                                        />
                                    </div>
                                </div>

                                {members.length ? (
                                    <>
                                        <div className="mt-3 grid grid-cols-1 gap-2 lg:grid-cols-2">
                                            {members.map((m) => (
                                                <MemberRow key={m.jid} member={m} />
                                            ))}
                                        </div>

                                        <p className="mt-3 text-[11px] text-gray-500">
                                            Showing {members.length} of{" "}
                                            {group.participants.length} loaded
                                            participants
                                        </p>
                                    </>
                                ) : (
                                    <div className="mt-4 rounded-2xl border border-dashed border-gray-300 p-8 text-center">
                                        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-100 text-lg text-gray-400">
                                            <ApartmentOutlined />
                                        </span>

                                        <p className="mt-3 text-sm font-semibold text-gray-700">
                                            {memberSearch.trim()
                                                ? "No members match your search"
                                                : memberFilter === "admins"
                                                  ? "No admins found"
                                                  : "No members found"}
                                        </p>

                                        {(memberSearch.trim() ||
                                            memberFilter !== "all") && (
                                            <button
                                                onClick={() => {
                                                    setMemberSearch("");
                                                    setMemberFilter("all");
                                                }}
                                                className="mt-3 cursor-pointer rounded-xl border border-gray-200 px-3.5 py-2 text-xs font-semibold text-gray-700 transition hover:border-emerald-300 hover:text-emerald-700"
                                            >
                                                Clear filters
                                            </button>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Shell>
    );
};

export default GroupDetailPage;
