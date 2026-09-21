import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import {
    CloseOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    DeleteOutlined,
    PlusOutlined,
    SaveOutlined,
    SendOutlined,
    ThunderboltOutlined,
} from "@ant-design/icons";
import {
    Field,
    PrimaryButton,
    SecondaryButton,
    Select,
    Spinner,
    inputCls,
} from "@/features/crm/components/CrmUi";
import {
    BOT_CATEGORIES,
    TRIGGER_TYPES,
    type Bot,
    type BotCategory,
    type MediaType,
    type TriggerType,
} from "../types/bot.types";
import { useUpdateBot } from "../hooks/useBots";
import WordTagInput from "./WordTagInput";
import RuleMediaFields from "./RuleMediaFields";
import RuleMentionToggle from "./RuleMentionToggle";
import BotGroupRow from "./BotGroupRow";

/** Surface the real reason — a blocked PATCH is not a validation error. */
const errMsg = (err: unknown, fallback: string) => {
    const e = err as {
        response?: { data?: { message?: string } };
        request?: unknown;
    };
    if (e?.response?.data?.message) return e.response.data.message;
    if (e?.request && !e?.response) {
        return "Server refused the request — the latest backend needs to be deployed";
    }
    return fallback;
};

/** Trigger types that don't need a "match this text" value. */
const VALUELESS: TriggerType[] = [
    "any",
    "new_member",
    "returning_member",
    "new_customer",
    "returning_customer",
];

/** A trigger being edited — `key` only exists for React, never saved. */
interface RuleDraft {
    key: string;
    name: string;
    type: TriggerType;
    value: string;
    reply: string;
    mention: boolean;
    enabled: boolean;
    priority: number;
    caseSensitive: boolean;
    mediaType: MediaType;
    mediaUrl: string | null;
    delayMs: number;
    cooldownSec: number;
}

interface Draft {
    name: string;
    description: string;
    category: BotCategory;
    status: "active" | "inactive";
    rules: RuleDraft[];
}

let seq = 0;
const uid = () => `r${Date.now().toString(36)}-${++seq}`;

const toDraft = (bot: Bot): Draft => ({
    name: bot.name,
    description: bot.description ?? "",
    category: bot.category,
    status: bot.status,
    rules: (bot.triggers ?? []).map((t) => ({
        key: t._id || uid(),
        name: t.name ?? "",
        type: t.type,
        value: t.value ?? "",
        reply: t.reply ?? "",
        mention: !!t.mention,
        enabled: t.enabled !== false,
        priority: t.priority ?? 100,
        caseSensitive: !!t.caseSensitive,
        mediaType: t.mediaType ?? "text",
        mediaUrl: t.mediaUrl ?? null,
        delayMs: t.delayMs ?? 0,
        cooldownSec: t.cooldownSec ?? 5,
    })),
});

const chip = "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold";

const ruleTitle = (rule: RuleDraft) =>
    rule.name.trim() ||
    TRIGGER_TYPES.find((t) => t.value === rule.type)?.label ||
    "Rule";

/**
 * Read + edit one bot without leaving the list: basics, filter rules and the
 * groups it is switched on in. Saves through the existing PATCH endpoint.
 */
const BotDetailsDrawer: React.FC<{
    bot: Bot;
    onClose: () => void;
}> = ({ bot, onClose }) => {
    const updateBot = useUpdateBot();

    // Seeded once per bot: the caller gives this drawer a `key` of the bot id,
    // so opening another bot remounts it and a background refetch never wipes
    // what is being typed.
    const [draft, setDraft] = useState<Draft>(() => toDraft(bot));

    const original = useMemo(() => JSON.stringify(toDraft(bot)), [bot]);
    const dirty = JSON.stringify(draft) !== original;
    const saving = updateBot.isPending;

    // Rules whose reply tags the sender with @their handle.
    const taggedCount = draft.rules.filter((r) => r.mention).length;

    const setRule = (key: string, patch: Partial<RuleDraft>) =>
        setDraft((d) => ({
            ...d,
            rules: d.rules.map((r) => (r.key === key ? { ...r, ...patch } : r)),
        }));

    const addRule = () =>
        setDraft((d) => {
            const nextPriority =
                (d.rules.length
                    ? Math.max(...d.rules.map((r) => r.priority || 0))
                    : 0) + 10;

            return {
                ...d,
                rules: [
                    ...d.rules,
                    {
                        key: uid(),
                        name: "",
                        type: "keyword",
                        value: "",
                        reply: "",
                        mention: false,
                        enabled: true,
                        priority: nextPriority,
                        caseSensitive: false,
                        mediaType: "text",
                        mediaUrl: null,
                        delayMs: 0,
                        cooldownSec: 5,
                    },
                ],
            };
        });

    const removeRule = (key: string) =>
        setDraft((d) => ({ ...d, rules: d.rules.filter((r) => r.key !== key) }));

    const save = () => {
        if (!draft.name.trim()) {
            toast.error("Bot name is required");
            return;
        }

        const started = draft.rules.filter(
            (r) => r.value.trim() || r.reply.trim() || VALUELESS.includes(r.type),
        );

        const incomplete = started.find(
            (r) => !VALUELESS.includes(r.type) && !r.value.trim(),
        );
        if (incomplete) {
            toast.error(`“${ruleTitle(incomplete)}” needs the text to match`);
            return;
        }

        const missingReply = started.find((r) => !r.reply.trim());
        if (missingReply) {
            toast.error(`“${ruleTitle(missingReply)}” needs a reply message`);
            return;
        }

        const missingMedia = started.find(
            (r) => r.mediaType !== "text" && !r.mediaUrl?.trim(),
        );
        if (missingMedia) {
            toast.error(`“${ruleTitle(missingMedia)}” needs a media URL`);
            return;
        }

        updateBot.mutate(
            {
                id: bot._id,
                input: {
                    name: draft.name.trim(),
                    description: draft.description.trim(),
                    category: draft.category,
                    status: draft.status,
                    triggers: started.map((r) => ({
                        name: r.name.trim() || ruleTitle(r),
                        type: r.type,
                        value: VALUELESS.includes(r.type) ? "" : r.value.trim(),
                        reply: r.reply.trim(),
                        mention: r.mention,
                        caseSensitive: r.caseSensitive,
                        mediaType: r.mediaType,
                        mediaUrl: r.mediaUrl,
                        enabled: r.enabled,
                        priority: r.priority,
                        delayMs: r.delayMs,
                        cooldownSec: r.cooldownSec,
                    })),
                },
            },
            {
                onSuccess: () => toast.success("Bot updated"),
                onError: (err) => toast.error(errMsg(err, "Could not save the bot")),
            },
        );
    };

    return (
        <div
            className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm"
            onClick={() => {
                if (!saving) onClose();
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative flex h-full w-full max-w-2xl flex-col border-l border-gray-200 bg-white shadow-2xl"
            >
                {/* ---------------- Header ---------------- */}
                <div className="flex items-start justify-between gap-3 border-b border-gray-200 px-5 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="min-w-0">
                            <h2 className="truncate text-base font-semibold text-gray-900">
                                {draft.name || bot.name}
                            </h2>

                            <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                {bot.status !== "active" && (
                                    <span className={`${chip} bg-gray-100 text-gray-500`}>
                                        <CloseCircleOutlined /> Paused
                                    </span>
                                )}

                                <span className={`${chip} bg-emerald-50 text-emerald-700`}>
                                    <ThunderboltOutlined /> {draft.rules.length} rule
                                    {draft.rules.length === 1 ? "" : "s"}
                                </span>

                                {taggedCount > 0 && (
                                    <span className={`${chip} bg-violet-50 text-violet-700`}>
                                        <SendOutlined /> {taggedCount} tagged
                                    </span>
                                )}

                                <span className={`${chip} bg-blue-50 text-blue-700`}>
                                    {BOT_CATEGORIES.find((c) => c.value === bot.category)
                                        ?.label ?? bot.category}
                                </span>

                                <span className={`${chip} bg-gray-100 text-gray-500`}>
                                    {bot.groups?.length ?? 0} group
                                    {(bot.groups?.length ?? 0) === 1 ? "" : "s"}
                                </span>

                                <span className={`${chip} bg-amber-50 text-amber-700`}>
                                    {bot.stats?.replied ?? 0} replies
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        disabled={saving}
                        title="Close"
                        className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <CloseOutlined />
                    </button>
                </div>

                {/* ---------------- Body ---------------- */}
                <div className="flex-1 space-y-5 overflow-y-auto p-5">
                    <section className="rounded-2xl border border-gray-200 p-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                            Bot
                        </p>

                        <div className="mt-3 space-y-3">
                            <Field label="Name" required>
                                <input
                                    value={draft.name}
                                    onChange={(e) =>
                                        setDraft({ ...draft, name: e.target.value })
                                    }
                                    placeholder="e.g. Frolic Support Bot"
                                    className={inputCls}
                                />
                            </Field>

                            <Field label="Description" hint="Shown on the bot card">
                                <input
                                    value={draft.description}
                                    onChange={(e) =>
                                        setDraft({
                                            ...draft,
                                            description: e.target.value,
                                        })
                                    }
                                    placeholder="Answers booking and pricing questions"
                                    className={inputCls}
                                />
                            </Field>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <Field label="Category">
                                    <Select
                                        value={draft.category}
                                        onChange={(e) =>
                                            setDraft({
                                                ...draft,
                                                category: e.target.value as BotCategory,
                                            })
                                        }
                                    >
                                        {BOT_CATEGORIES.map((c) => (
                                            <option key={c.value} value={c.value}>
                                                {c.label}
                                            </option>
                                        ))}
                                    </Select>
                                </Field>

                                <Field label="Status">
                                    <Select
                                        value={draft.status}
                                        onChange={(e) =>
                                            setDraft({
                                                ...draft,
                                                status: e.target.value as
                                                    | "active"
                                                    | "inactive",
                                            })
                                        }
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Paused</option>
                                    </Select>
                                </Field>
                            </div>
                        </div>
                    </section>

                    {/* ---------------- Rules ---------------- */}
                    <section className="rounded-2xl border border-gray-200 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                                    <ThunderboltOutlined /> Filter message rules
                                </p>
                                <p className="mt-1 text-[11px] leading-relaxed text-gray-400">
                                    When a message matches, the reply below is sent. Rules are
                                    checked top to bottom.
                                </p>
                            </div>

                            <button
                                onClick={addRule}
                                className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                            >
                                <PlusOutlined /> Add rule
                            </button>
                        </div>

                        {!draft.rules.length && (
                            <p className="mt-3 rounded-xl border border-dashed border-gray-300 p-5 text-center text-xs text-gray-400">
                                No rules yet — this bot stays silent. Add one to make it
                                reply.
                            </p>
                        )}

                        <div className="mt-3 space-y-3">
                            {draft.rules.map((rule, index) => {
                                const meta = TRIGGER_TYPES.find(
                                    (t) => t.value === rule.type,
                                );
                                const needsValue = !VALUELESS.includes(rule.type);

                                return (
                                    <div
                                        key={rule.key}
                                        className="rounded-xl border border-gray-100 bg-gray-50 p-3"
                                    >
                                        <div className="mb-2 flex items-center justify-between gap-2">
                                            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-[11px] font-bold text-gray-500">
                                                {index + 1}
                                            </span>

                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    onClick={() =>
                                                        setRule(rule.key, {
                                                            enabled: !rule.enabled,
                                                        })
                                                    }
                                                    title={
                                                        rule.enabled
                                                            ? "Rule on — click to pause"
                                                            : "Rule paused — click to switch on"
                                                    }
                                                    className={`${chip} cursor-pointer transition ${
                                                        rule.enabled
                                                            ? "bg-emerald-700 text-white"
                                                            : "bg-gray-100 text-gray-500"
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
                                                    onClick={() => removeRule(rule.key)}
                                                    title="Delete this rule"
                                                    className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-100 hover:text-red-500"
                                                >
                                                    <DeleteOutlined />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            <Field label="When the message matches">
                                                <Select
                                                    value={rule.type}
                                                    onChange={(e) =>
                                                        setRule(rule.key, {
                                                            type: e.target
                                                                .value as TriggerType,
                                                        })
                                                    }
                                                >
                                                    {TRIGGER_TYPES.map((t) => (
                                                        <option
                                                            key={t.value}
                                                            value={t.value}
                                                        >
                                                            {t.label}
                                                        </option>
                                                    ))}
                                                </Select>
                                            </Field>

                                            {needsValue && (
                                                <Field
                                                    label="Text to match"
                                                    hint={
                                                        rule.type === "keyword"
                                                            ? "Press Enter after each word — any one of them matches"
                                                            : meta?.hint
                                                    }
                                                >
                                                    {rule.type === "keyword" ? (
                                                        <WordTagInput
                                                            value={rule.value}
                                                            onChange={(v) =>
                                                                setRule(rule.key, {
                                                                    value: v,
                                                                })
                                                            }
                                                            placeholder="price, rate, charges"
                                                        />
                                                    ) : (
                                                        <input
                                                            value={rule.value}
                                                            onChange={(e) =>
                                                                setRule(rule.key, {
                                                                    value: e.target
                                                                        .value,
                                                                })
                                                            }
                                                            placeholder="price, rate, charges"
                                                            className={inputCls}
                                                        />
                                                    )}
                                                </Field>
                                            )}
                                        </div>

                                        <div className="mt-3">
                                            <Field label="Reply message">
                                                <textarea
                                                    rows={3}
                                                    value={rule.reply}
                                                    onChange={(e) =>
                                                        setRule(rule.key, {
                                                            reply: e.target.value,
                                                        })
                                                    }
                                                    placeholder="Hi, here is our latest price list…"
                                                    className={inputCls}
                                                />
                                            </Field>
                                        </div>

                                        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            <RuleMediaFields
                                                mediaType={rule.mediaType}
                                                mediaUrl={rule.mediaUrl ?? ""}
                                                onChange={(patch) =>
                                                    setRule(rule.key, {
                                                        ...patch,
                                                        mediaUrl:
                                                            patch.mediaUrl !==
                                                            undefined
                                                                ? patch.mediaUrl
                                                                : rule.mediaUrl,
                                                    })
                                                }
                                            />
                                        </div>

                                        <div className="mt-3">
                                            <RuleMentionToggle
                                                mention={rule.mention}
                                                onChange={(mention) =>
                                                    setRule(rule.key, { mention })
                                                }
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* ---------------- Groups (read only) ---------------- */}
                    {!!bot.groups?.length && (
                        <section className="rounded-2xl border border-gray-200 p-4">
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                    Live on
                                </p>
                                <span className={`${chip} bg-emerald-50 text-emerald-700`}>
                                    {bot.groups.length} group
                                    {bot.groups.length === 1 ? "" : "s"}
                                </span>
                            </div>

                            <p className="mt-1 text-[11px] text-gray-500">
                                Groups where this bot answers messages
                            </p>

                            <div className="mt-3 space-y-2">
                                {bot.groups.map((g) => (
                                    <BotGroupRow key={g.jid} group={g} />
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* ---------------- Footer ---------------- */}
                <div className="flex items-center justify-between gap-3 border-t border-gray-200 px-5 py-3.5">
                    <p className="text-[11px] text-gray-400">
                        {dirty ? "Unsaved changes" : "All changes saved"}
                    </p>

                    <div className="flex items-center gap-2">
                        <SecondaryButton onClick={onClose} disabled={saving}>
                            Cancel
                        </SecondaryButton>

                        <PrimaryButton
                            onClick={save}
                            disabled={saving || !dirty}
                        >
                            {saving ? <Spinner /> : <SaveOutlined />}
                            {saving ? "Saving…" : "Save changes"}
                        </PrimaryButton>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BotDetailsDrawer;
