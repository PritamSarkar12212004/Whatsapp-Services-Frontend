import React from "react";
import { CopyOutlined, CrownOutlined } from "@ant-design/icons";
import type { GroupParticipant } from "@/features/groups/api/whatsapp.group.api";
import {
    copyNumber,
    getInitials,
} from "@/features/groups/components/memberHelpers";

export const MemberRow: React.FC<{ member: GroupParticipant }> = ({
    member,
}) => {
    const displayName =
        member.name || (member.number ? `+${member.number}` : "Unknown");
    const initials = getInitials(member.name || member.number || "?");

    return (
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 transition hover:border-emerald-300">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                {initials}
            </div>

            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">
                    {displayName}
                </p>

                <p className="truncate text-xs text-gray-400">
                    {member.number
                        ? `+${member.number}`
                        : "Number unavailable"}
                </p>
            </div>

            {(member.isAdmin || member.isSuperAdmin) && (
                <span
                    className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        member.isSuperAdmin
                            ? "bg-amber-50 text-amber-700"
                            : "bg-blue-50 text-blue-700"
                    }`}
                >
                    <CrownOutlined />
                    {member.isSuperAdmin ? "Super Admin" : "Admin"}
                </span>
            )}

            {member.number && (
                <button
                    onClick={() => copyNumber(member.number)}
                    className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-gray-400 transition hover:bg-emerald-50 hover:text-emerald-600"
                    title="Copy number"
                >
                    <CopyOutlined />
                </button>
            )}
        </div>
    );
};
