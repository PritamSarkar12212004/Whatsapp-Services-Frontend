import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useWhatsappGroupDetail } from "@/features/groups/hooks/useWhatsappGroupDetail";
import { Spinner } from "@/features/crm/components/CrmUi";
import type { BotGroupLink } from "../types/bot.types";
import {
    ArrowRightOutlined,
    CloseCircleOutlined,
} from "@ant-design/icons";

/**
 * Group tiles pick their gradient from the name, so a group looks the same
 * everywhere. The stops are deep (700/800) to keep the white initials legible.
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

const initialsOf = (subject: string) => {
    const parts = String(subject).trim().split(/\s+/);
    return ((parts[0]?.[0] || "G") + (parts[1]?.[0] || "")).toUpperCase();
};

/**
 * One group the bot is live in: photo (or initials), title, and what the group
 * looks like — members, community, whether you can post — plus a way in.
 */
const BotGroupRow: React.FC<{ group: BotGroupLink }> = ({ group }) => {
    // Group details come from WhatsApp, so a row shows its title straight away
    // and fills in the rest when the lookup answers (it can also fail — then we
    // leave the numbers out instead of guessing).
    const { data, isLoading } = useWhatsappGroupDetail(group.jid);
    const [brokenPhoto, setBrokenPhoto] = useState(false);

    const info = data?.data;
    const title = info?.subject || group.subject || group.jid;
    const photo = brokenPhoto ? null : info?.profilePicUrl || null;

    const initials = useMemo(() => initialsOf(title), [title]);

    const meta: string[] = [];
    if (info?.size) meta.push(`${info.size} members`);
    if (info?.isCommunity) meta.push("Community");
    else if (info?.isCommunityAnnounce) meta.push("Announcement");
    if (info?.amIAdmin) meta.push("You are an admin");
    if (info?.canMessage === false) meta.push("Read-only");

    return (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white p-2.5 transition hover:border-emerald-300">
            {photo ? (
                <img
                    src={photo}
                    alt=""
                    onError={() => setBrokenPhoto(true)}
                    className="h-10 w-10 shrink-0 rounded-xl object-cover"
                />
            ) : (
                <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-xs font-bold text-white shadow-sm ${avatarGradient(
                        title,
                    )}`}
                >
                    {initials}
                </span>
            )}

            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{title}</p>
                <p className="mt-0.5 flex items-center gap-1.5 truncate text-[11px] text-gray-500">
                    {isLoading && <Spinner />}
                    {isLoading
                        ? "Reading group details…"
                        : meta.join(" · ") || "Group details unavailable"}
                </p>
            </div>

            {group.enabled === false && (
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
                    <CloseCircleOutlined /> Paused
                </span>
            )}

            <Link
                to={`/groups/${encodeURIComponent(group.jid)}/automation`}
                title="Open this group's automation"
                className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-700 transition hover:bg-emerald-100"
            >
                Open <ArrowRightOutlined />
            </Link>
        </div>
    );
};

export default BotGroupRow;
