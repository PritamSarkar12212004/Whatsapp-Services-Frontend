import React from "react";
import { Link, useParams } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import { toast } from "sonner";
import { Spinner } from "@/features/crm/components/CrmUi";
import {
    GroupAutomationSkeleton,
    RecipientListSkeleton,
} from "@/components/ui/skeleton/PageSkeletons";
import { Skeleton } from "@/components/ui/skeleton/Skeleton";
import { useWhatsappGroupDetail } from "@/features/groups/hooks/useWhatsappGroupDetail";
import {
    useAttachBotGroup,
    useDetachBotGroup,
    useGroupBots,
} from "@/features/bots/hooks/useBots";
import { enabledTriggerCount } from "@/features/bots/types/bot.types";
import {
    useGroupManager,
    useSaveGroupManager,
} from "@/features/groups/hooks/useGroupManager";
import type { ManagerRule } from "@/features/groups/api/groupManager.api";
import {
    ArrowLeftOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    DeleteOutlined,
    MessageOutlined,
    PlusOutlined,
    ThunderboltOutlined,
    WarningOutlined,
} from "@ant-design/icons";

/** Rule types that answer messages or member events on their own. */
const MESSAGE_RULE_TYPES: ManagerRule["type"][] = ["auto_reply", "welcome", "goodbye"];

const ruleLabel = (rule: ManagerRule) => {
    if (rule.type === "auto_reply") {
        return rule.trigger
            ? `Replies when a message contains “${rule.trigger}”`
            : "Auto-reply rule";
    }
    return rule.type === "welcome"
        ? "Welcome message — when a member joins"
        : "Goodbye message — when a member leaves";
};

/** Full-screen shell — sidebar stays, everything else fills the screen. */
const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="w-full h-screen">
        <Sidebar />
        <div className="flex h-screen flex-col lg:ml-64">{children}</div>
    </div>
);

const chip =
    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold";

const GroupAutomationPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { data: detailData, isLoading } = useWhatsappGroupDetail(id);
    const { data: botsData, isLoading: botsLoading } = useGroupBots(id);
    const { data: managerData } = useGroupManager(id);

    const attach = useAttachBotGroup();
    const detach = useDetachBotGroup();
    const saveManager = useSaveGroupManager(id);

    // Which bot is mid-attach / mid-detach, so only that row shows a spinner.
    const attachingId = attach.isPending ? attach.variables?.id : null;
    const detachingId = detach.isPending ? detach.variables?.id : null;

    const manager = managerData?.data ?? null;
    const messageRules = (manager?.rules ?? []).filter((r) =>
        MESSAGE_RULE_TYPES.includes(r.type),
    );

    /**
     * These older rules still run when no bot trigger matches, which is why a
     * group can answer on its own. Saving sends the whole config back.
     */
    const saveRules = (rules: ManagerRule[]) => {
        if (!manager) return;

        saveManager.mutate(
            {
                groupJid: manager.groupJid,
                groupSubject: manager.groupSubject || group?.subject || "",
                settings: manager.settings,
                commands: manager.commands,
                rules,
                schedules: manager.schedules,
            },
            {
                onSuccess: () => toast.success("Group message rules updated"),
                onError: () => toast.error("Could not update the message rules"),
            },
        );
    };

    const group = detailData?.data;
    const attached = botsData?.attached ?? [];
    const available = botsData?.available ?? [];
    const canMessage = group?.canMessage !== false;

    // Only the very first paint waits for a skeleton; the moment the bot list
    // (a plain database read) is in, the page renders and the group name fills
    // in on its own — the live WhatsApp lookup never holds the screen back.
    if (isLoading && botsLoading && !manager) {
        return (
            <Shell>
                <GroupAutomationSkeleton />
            </Shell>
        );
    }

    return (
        <Shell>
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3 lg:px-6">
                <div className="flex min-w-0 items-center gap-3">
                    <Link
                        to={`/groups/${encodeURIComponent(id!)}`}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50 hover:text-gray-700"
                        title="Back to group"
                    >
                        <ArrowLeftOutlined />
                    </Link>

                    <div className="min-w-0">
                        <h1 className="text-xl font-semibold text-gray-900 lg:text-2xl">
                            Automation
                        </h1>

                        {/* The name comes from WhatsApp, so it shimmers in rather
                            than delaying the rest of the page. */}
                        <div className="mt-0.5 truncate text-sm text-gray-500">
                            {group?.subject ? (
                                <>
                                    {group.subject} · bots you switch on here reply in
                                    this group
                                </>
                            ) : (
                                <Skeleton className="h-3.5 w-64 max-w-full" />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-6">
                <div className="mx-auto max-w-4xl space-y-4">
                    {!canMessage && (
                        <div className="rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700">
                            You don&apos;t have permission to send messages in this group, so
                            bots can&apos;t reply here. Attach stays disabled until the group
                            allows it (you need to be a member with send rights).
                        </div>
                    )}

                    {/* Attached bots */}
                    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-sm text-emerald-700">
                                    <ThunderboltOutlined />
                                </span>
                                <h2 className="text-sm font-semibold text-gray-900">
                                    Bots in this group
                                </h2>
                                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500">
                                    {attached.length}
                                </span>
                            </div>

                            <Link
                                to="/bots"
                                className="text-[11px] font-semibold text-emerald-700 transition hover:text-emerald-800"
                            >
                                Manage all bots →
                            </Link>
                        </div>

                        <div className="mt-3 space-y-2">
                            {botsLoading && <RecipientListSkeleton rows={2} />}

                            {!botsLoading && !attached.length && (
                                <p className="rounded-xl border border-dashed border-gray-300 p-5 text-center text-xs text-gray-400">
                                    No bot is switched on here yet. Attach one from the list
                                    below — or create one in{" "}
                                    <Link
                                        to="/bots"
                                        className="font-semibold text-emerald-700 hover:text-emerald-800"
                                    >
                                        Bots
                                    </Link>
                                    .
                                </p>
                            )}

                            {attached.map((bot) => (
                                <div
                                    key={bot._id}
                                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 p-3"
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium text-gray-900">
                                                {bot.name}
                                            </p>
                                            <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                                <span className={`${chip} bg-emerald-50 text-emerald-700`}>
                                                    <ThunderboltOutlined />{" "}
                                                    {enabledTriggerCount(bot)} trigger
                                                    {enabledTriggerCount(bot) === 1
                                                        ? ""
                                                        : "s"}
                                                </span>
                                                <span className={`${chip} bg-gray-100 text-gray-500`}>
                                                    <MessageOutlined />{" "}
                                                    {bot.stats?.replied ?? 0} replies
                                                </span>
                                                {bot.status !== "active" && (
                                                    <span
                                                        className={`${chip} bg-gray-100 text-gray-500`}
                                                    >
                                                        <CloseCircleOutlined /> Paused
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() =>
                                                detach.mutate(
                                                    { id: bot._id, jid: id as string },
                                                    {
                                                        onSuccess: () =>
                                                            toast.success(
                                                                `${bot.name} removed from this group`,
                                                            ),
                                                        onError: () =>
                                                            toast.error("Remove failed"),
                                                    },
                                                )
                                            }
                                            disabled={
                                                detachingId === bot._id ||
                                                detach.isPending
                                            }
                                            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-gray-400 transition hover:bg-red-100 hover:text-red-500 disabled:cursor-wait disabled:opacity-60"
                                            title={
                                                detachingId === bot._id
                                                    ? "Removing…"
                                                    : "Remove from this group"
                                            }
                                        >
                                            {detachingId === bot._id ? (
                                                <Spinner />
                                            ) : (
                                                <DeleteOutlined />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Available bots */}
                    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center gap-2.5">
                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-sm text-blue-700">
                                <PlusOutlined />
                            </span>
                            <h2 className="text-sm font-semibold text-gray-900">
                                Attach another bot
                            </h2>
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500">
                                {available.length}
                            </span>
                        </div>

                        <div className="mt-3 space-y-2">
                            {botsLoading && <RecipientListSkeleton rows={2} />}

                            {!botsLoading && !available.length && (
                                <p className="rounded-xl border border-dashed border-gray-300 p-5 text-center text-xs text-gray-400">
                                    Every bot you own is already attached here. Create a new
                                    one in{" "}
                                    <Link
                                        to="/bots"
                                        className="font-semibold text-emerald-700 hover:text-emerald-800"
                                    >
                                        Bots
                                    </Link>{" "}
                                    to add more automation.
                                </p>
                            )}

                            {available.map((bot) => (
                                <div
                                    key={bot._id}
                                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 p-3"
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium text-gray-900">
                                                {bot.name}
                                            </p>
                                            {bot.status !== "active" && (
                                                <p className="text-[11px] text-gray-400">
                                                    Paused globally
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() =>
                                            attach.mutate(
                                                {
                                                    id: bot._id,
                                                    jid: id as string,
                                                    subject: group?.subject ?? "",
                                                },
                                                {
                                                    onSuccess: () =>
                                                        toast.success(
                                                            `${bot.name} activated in this group`,
                                                        ),
                                                    onError: () =>
                                                        toast.error("Attach failed"),
                                                },
                                            )
                                        }
                                        disabled={!canMessage || attach.isPending}
                                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-wait disabled:bg-gray-200 disabled:text-gray-400"
                                    >
                                        {attachingId === bot._id ? (
                                            <>
                                                <Spinner />
                                                Attaching…
                                            </>
                                        ) : (
                                            "Attach"
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Older keyword rules that still answer on their own */}
                    {!!messageRules.length && (
                        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                            <div className="flex items-start gap-3">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-sm text-amber-700">
                                    <WarningOutlined />
                                </span>

                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="text-sm font-semibold text-gray-900">
                                            This group has older message rules
                                        </h2>

                                        {saveManager.isPending && (
                                            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-gray-500">
                                                <Spinner /> Saving…
                                            </span>
                                        )}
                                    </div>

                                    <p className="mt-1 text-[11px] leading-relaxed text-gray-600">
                                        They reply when no bot trigger matches, which is why
                                        the group can answer on its own. Switch off or delete
                                        anything you no longer want.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-3 space-y-2">
                                {messageRules.map((rule) => {
                                    const busy = saveManager.isPending;

                                    return (
                                        <div
                                            key={`${rule.type}-${rule.trigger}-${rule.value}`}
                                            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-3"
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium text-gray-900">
                                                    {ruleLabel(rule)}
                                                </p>

                                                <p className="mt-0.5 truncate text-[11px] text-gray-500">
                                                    {rule.enabled
                                                        ? "Replies with: "
                                                        : "Paused — "}
                                                    {rule.value || "no message set"}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    disabled={busy}
                                                    onClick={() =>
                                                        saveRules(
                                                            (manager?.rules ?? []).map(
                                                                (r) =>
                                                                    r === rule
                                                                        ? {
                                                                              ...r,
                                                                              enabled:
                                                                                  !r.enabled,
                                                                          }
                                                                        : r,
                                                            ),
                                                        )
                                                    }
                                                    title={
                                                        rule.enabled
                                                            ? "Switch this rule off"
                                                            : "Switch this rule on"
                                                    }
                                                    className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                                        rule.enabled
                                                            ? "bg-emerald-700 text-white hover:bg-emerald-800"
                                                            : "border border-gray-200 bg-white text-gray-600 hover:border-emerald-300 hover:text-emerald-700"
                                                    }`}
                                                >
                                                    {rule.enabled ? (
                                                        <CheckCircleOutlined />
                                                    ) : (
                                                        <CloseCircleOutlined />
                                                    )}
                                                    {rule.enabled ? "On" : "Off"}
                                                </button>

                                                <button
                                                    disabled={busy}
                                                    onClick={() =>
                                                        saveRules(
                                                            (manager?.rules ?? []).filter(
                                                                (r) => r !== rule,
                                                            ),
                                                        )
                                                    }
                                                    title="Delete this rule"
                                                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl text-gray-400 transition hover:bg-red-100 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <DeleteOutlined />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    <p className="px-1 text-[11px] leading-relaxed text-gray-400">
                        Bots reply first when one of their triggers matches. Everything else
                        in this group — keyword auto-replies, welcome and goodbye messages,
                        banned words, anti-link, anti-flood and schedules — lives in the
                        group&apos;s moderation config, and the message rules above are the
                        part that answers on its own.
                    </p>
                </div>
            </div>
        </Shell>
    );
};

export default GroupAutomationPage;
