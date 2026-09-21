import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { BotsPageSkeleton } from "@/components/ui/skeleton/PageSkeletons";
import { toast } from "sonner";
import {
    Field,
    Modal,
    PrimaryButton,
    SecondaryButton,
    Select,
    Spinner,
    inputCls,
} from "@/features/crm/components/CrmUi";
import {
    useBots,
    useCreateBot,
    useDeleteBot,
} from "../hooks/useBots";
import BotDetailsDrawer from "../components/BotDetailsDrawer";
import WordTagInput from "../components/WordTagInput";
import RuleMediaFields from "../components/RuleMediaFields";
import RuleMentionToggle from "../components/RuleMentionToggle";
import {
    BOT_CATEGORIES,
    type Bot,
    type BotCategory,
    type MediaType,
    type TriggerType,
} from "../types/bot.types";
import {
    ApiOutlined,
    DeleteOutlined,
    EyeOutlined,
    MessageOutlined,
    PlusOutlined,
    SearchOutlined,
    TeamOutlined,
    ThunderboltOutlined,
} from "@ant-design/icons";

const chip =
    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold";

/** The kinds of "if this matches → send that" filter the create form offers. */
const FILTER_KINDS: Array<{ value: TriggerType; label: string; hint: string }> = [
    {
        value: "keyword",
        label: "Any word matches",
        hint: "Comma separated, e.g. price, rate, charges",
    },
    { value: "contains", label: "Message contains", hint: "Text appears anywhere in the message" },
    { value: "exact", label: "Message is exactly", hint: "Whole message equals this text" },
    { value: "starts_with", label: "Starts with", hint: "First words of the message" },
    { value: "ends_with", label: "Ends with", hint: "Last words of the message" },
    { value: "regex", label: "Regex pattern", hint: "Advanced, e.g. \\b\\d{4}\\b" },
    { value: "command", label: "Command", hint: "Without the ! — help → !help" },
    { value: "any", label: "Any message", hint: "Fallback — replies to everything" },
];

interface FilterRow {
    id: number;
    type: TriggerType;
    value: string;
    reply: string;
    /** Start the reply with @their handle so the sender is tagged. */
    mention: boolean;
    /** text = plain reply; anything else attaches the media URL. */
    mediaType: MediaType;
    mediaUrl: string;
}

/** "filter_message" is the default for bots built in this modal. */
const DEFAULT_CATEGORY: BotCategory = "filter_message";

const categoryLabel = (value: string) =>
    BOT_CATEGORIES.find((c) => c.value === value)?.label ?? value;

/** Pull the API error message out of an unknown error. */
const errMsg = (err: unknown, fallback: string) => {
    const e = err as { response?: { data?: { message?: string } } };
    return e?.response?.data?.message || fallback;
};

const BotCard: React.FC<{
    bot: Bot;
    onView: (bot: Bot) => void;
    onDelete: (bot: Bot) => void;
}> = ({ bot, onView, onDelete }) => {
    const triggerCount = bot.triggers?.length ?? 0;
    const groupCount = bot.groups?.length ?? 0;
    const paused = bot.status !== "active";

    return (
        <div className="group relative flex aspect-square flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white p-3.5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg">
            <span className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-emerald-500/10 opacity-0 blur-2xl transition duration-300 group-hover:opacity-100" />

            <div className="flex items-start justify-between gap-2">
                <span className={`${chip} bg-blue-50 text-blue-700`}>
                    {categoryLabel(bot.category)}
                </span>

                <Link
                    to="/groups"
                    title="Switch this bot on from Groups"
                    className={`${chip} bg-gray-100 text-gray-500 transition hover:bg-emerald-50 hover:text-emerald-700`}
                >
                    {groupCount} group{groupCount === 1 ? "" : "s"}
                </Link>
            </div>

            <div className="mt-2 flex min-h-0 flex-1 flex-col justify-center">
                <button
                    onClick={() => onView(bot)}
                    title="View and edit this bot"
                    className="line-clamp-2 cursor-pointer text-left text-sm font-semibold leading-snug text-gray-900 transition hover:text-emerald-700"
                >
                    {bot.name}
                </button>

                {bot.description && (
                    <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-gray-400">
                        {bot.description}
                    </p>
                )}

                <div className="mt-2 flex max-h-5 flex-wrap gap-1 overflow-hidden">
                    <span className={`${chip} bg-emerald-50 text-emerald-700`}>
                        <ThunderboltOutlined /> {triggerCount} trigger
                        {triggerCount === 1 ? "" : "s"}
                    </span>
                    <span className={`${chip} bg-amber-50 text-amber-700`}>
                        {bot.language}
                    </span>
                    {paused && (
                        <span className={`${chip} bg-gray-100 text-gray-500`}>
                            Paused
                        </span>
                    )}
                </div>
            </div>

            <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-2.5">
                <span className="truncate text-[11px] font-medium text-gray-400">
                    {bot.stats?.replied ?? 0} replies
                </span>

                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onView(bot)}
                        title="View and edit"
                        className="flex h-7 items-center gap-1 rounded-lg bg-emerald-50 px-2 text-[11px] font-semibold text-emerald-700 transition hover:bg-emerald-100"
                    >
                        <EyeOutlined /> View
                    </button>
                    <button
                        onClick={() => onDelete(bot)}
                        title="Delete"
                        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-100 hover:text-red-500"
                    >
                        <DeleteOutlined />
                    </button>
                </div>
            </div>
        </div>
    );
};

const BotsPage: React.FC = () => {
    const { data: bots, isLoading } = useBots();
    const createBot = useCreateBot();
    const deleteBot = useDeleteBot();

    const [search, setSearch] = useState("");
    const [createOpen, setCreateOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Bot | null>(null);
    const [viewId, setViewId] = useState<string | null>(null);
    const [form, setForm] = useState<{
        name: string;
        description: string;
        category: BotCategory;
    }>({
        name: "",
        description: "",
        category: DEFAULT_CATEGORY,
    });
    // "If this matches → send that" rows, saved as triggers on create.
    const [filters, setFilters] = useState<FilterRow[]>([
        {
            id: 1,
            type: "keyword",
            value: "",
            reply: "",
            mention: false,
            mediaType: "text",
            mediaUrl: "",
        },
    ]);

    // Only the "Filter Message" category builds triggers here. Any other
    // category opens a plain, empty form — nothing else to fill in.
    const filterMode = form.category === DEFAULT_CATEGORY;

    const addFilterRow = () =>
        setFilters((rows) => [
            ...rows,
            {
                id: (rows.at(-1)?.id ?? 0) + 1,
                type: "keyword",
                value: "",
                reply: "",
                mention: false,
                mediaType: "text",
                mediaUrl: "",
            },
        ]);

    const updateFilterRow = (id: number, patch: Partial<FilterRow>) =>
        setFilters((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));

    const removeFilterRow = (id: number) =>
        setFilters((rows) => rows.filter((r) => r.id !== id));

    const list = useMemo(() => bots ?? [], [bots]);

    // Kept as an id so the drawer always shows the freshest copy after a save.
    const viewBot = useMemo(
        () => list.find((b) => b._id === viewId) ?? null,
        [list, viewId],
    );

    const filtered = useMemo(() => {
        let out = list;
        if (search.trim()) {
            const q = search.trim().toLowerCase();
            out = out.filter(
                (b) =>
                    b.name.toLowerCase().includes(q) ||
                    (b.description ?? "").toLowerCase().includes(q),
            );
        }
        return out;
    }, [list, search]);

    const groupsCovered = new Set(
        list.flatMap((b) => (b.status === "active" ? b.groups.map((g) => g.jid) : [])),
    ).size;
    const replies = list.reduce((sum, b) => sum + (b.stats?.replied ?? 0), 0);

    const submitCreate = () => {
        if (!form.name.trim()) {
            toast.error("Bot name is required");
            return;
        }

        // Untouched rows are simply ignored — only rows the user started
        // filling in are created (and must then be complete).
        const usedFilters = filterMode
            ? filters.filter((row) => row.value.trim() || row.reply.trim())
            : [];

        if (filterMode) {
            for (const [index, row] of filters.entries()) {
                const started = !!row.value.trim() || !!row.reply.trim();
                if (!started) continue;

                if (row.type !== "any" && !row.value.trim()) {
                    toast.error(
                        `Filter message ${index + 1}: add the word or text to match`,
                    );
                    return;
                }
                if (!row.reply.trim()) {
                    toast.error(`Filter message ${index + 1}: write the reply to send`);
                    return;
                }
                if (row.mediaType !== "text" && !row.mediaUrl.trim()) {
                    toast.error(
                        `Filter message ${index + 1}: add the media link for a ${row.mediaType}`,
                    );
                    return;
                }
            }
        }

        // Filter rows become the bot's triggers, in the order they were added.
        const filterTriggers = usedFilters.map((row, index) => ({
            name:
                row.type === "any"
                    ? `Filter ${index + 1} (any message)`
                    : `Filter ${index + 1}: ${row.value.trim().slice(0, 30)}`,
            type: row.type,
            value: row.type === "any" ? "" : row.value.trim(),
            reply: row.reply.trim(),
            mention: row.mention,
            mediaType: row.mediaType,
            mediaUrl: row.mediaUrl.trim() || null,
            enabled: true,
            priority: 10 + index * 10,
        }));

        const allTriggers = filterTriggers;

        createBot.mutate(
            {
                name: form.name.trim(),
                description: form.description.trim(),
                category: form.category,
                // Fixed defaults — English + active.
                language: "en",
                status: "active",
                ...(allTriggers.length
                    ? {
                          triggers: allTriggers.map((t) => ({
                              ...t,
                              caseSensitive: false,
                              delayMs: 0,
                              cooldownSec: 5,
                          })),
                      }
                    : {}),
            },
            {
                onSuccess: () => {
                    toast.success(
                        "Bot created. Switch it on for a group from Groups → Bots.",
                    );

                    setCreateOpen(false);
                    setForm({
                        name: "",
                        description: "",
                        category: DEFAULT_CATEGORY,
                    });
                    setFilters([
                        {
                            id: 1,
                            type: "keyword",
                            value: "",
                            reply: "",
                            mention: false,
                            mediaType: "text",
                            mediaUrl: "",
                        },
                    ]);
                },
                onError: (err) => toast.error(errMsg(err, "Create failed")),
            },
        );
    };

    // First paint only — a cached list renders instantly instead.
    if (isLoading) {
        return (
            <MainLayout>
                <BotsPageSkeleton />
            </MainLayout>
        );
    }

    const stats = [
        {
            label: "Total bots",
            value: list.length,
            icon: <ApiOutlined />,
            tone: "bg-emerald-50 text-emerald-700",
        },
        {
            label: "Rules",
            value: list.reduce((sum, b) => sum + (b.triggers?.length ?? 0), 0),
            icon: <ThunderboltOutlined />,
            tone: "bg-blue-50 text-blue-700",
        },
        {
            label: "Groups covered",
            value: groupsCovered,
            icon: <TeamOutlined />,
            tone: "bg-amber-50 text-amber-700",
        },
        {
            label: "Replies sent",
            value: replies,
            icon: <MessageOutlined />,
            tone: "bg-purple-100 text-purple-700",
        },
    ];

    return (
        <MainLayout>
            <div className="flex h-full flex-col">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Bots</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Custom automation bots — build one, then switch it on in any group you can message
                        </p>
                    </div>

                    <button
                        onClick={() => setCreateOpen(true)}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
                    >
                        <PlusOutlined /> New bot
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto py-5">
                    <div className="space-y-5">
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

                        <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="relative min-w-[220px] flex-1">
                                    <SearchOutlined className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search bots..."
                                        className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                    />
                                </div>
                            </div>
                        </div>

                        {!filtered.length && (
                            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
                                <ApiOutlined className="text-3xl text-gray-300" />
                                <p className="mt-3 text-sm font-medium text-gray-700">
                                    {list.length ? "No bot matches these filters" : "No bots yet"}
                                </p>
                                <p className="mt-1 text-xs text-gray-400">
                                    A bot watches a group and replies on your triggers — create one and
                                    switch it on from the group&apos;s automation screen.
                                </p>
                                <button
                                    onClick={() => setCreateOpen(true)}
                                    className="mt-4 cursor-pointer rounded-xl bg-emerald-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-800"
                                >
                                    <PlusOutlined /> Create your first bot
                                </button>
                            </div>
                        )}

                        {!!filtered.length && (
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
                                {filtered.map((bot) => (
                                    <BotCard
                                        key={bot._id}
                                        bot={bot}
                                        onView={(b) => setViewId(b._id)}
                                        onDelete={(b) => setDeleteTarget(b)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create */}
            <Modal
                open={createOpen}
                onClose={() => {
                    if (createBot.isPending) return; // keep the modal while creating
                    setCreateOpen(false);
                }}
                title="New bot"
                wide
                footer={
                    <>
                        <SecondaryButton
                            onClick={() => setCreateOpen(false)}
                            disabled={createBot.isPending}
                        >
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton
                            onClick={submitCreate}
                            disabled={createBot.isPending}
                        >
                            {createBot.isPending ? <Spinner /> : <PlusOutlined />}
                            {createBot.isPending ? "Creating…" : "Create bot"}
                        </PrimaryButton>
                    </>
                }
            >
                <div className="space-y-4">
                    <Field label="Bot name" required>
                        <input
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="e.g. Frolic Support Bot"
                            className={inputCls}
                        />
                    </Field>

                    <Field label="Description" hint="Shown on the bot card">
                        <input
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="Answers booking and pricing questions"
                            className={inputCls}
                        />
                    </Field>

                    <div className="flex flex-wrap items-end justify-between gap-2">
                        <div className="w-full sm:w-[240px]">
                            <Field label="Category">
                                <Select
                                    value={form.category}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
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
                        </div>

                        {filterMode && (
                            <button
                                onClick={addFilterRow}
                                className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                            >
                                <PlusOutlined /> Add filter
                            </button>
                        )}
                    </div>

                    {/* Filter message — shown for the "Filter Message" category only. */}
                    {filterMode && (
                    <div className="rounded-2xl border border-gray-200 p-3.5">
                        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                            <ThunderboltOutlined /> Filter message
                        </p>
                        <p className="mt-1 text-[11px] leading-relaxed text-gray-400">
                            Auto-reply when an incoming message matches. Rows are checked
                            top to bottom.
                        </p>

                        <div className="mt-3 space-y-3">
                            {filters.map((row, index) => {
                                const kind = FILTER_KINDS.find((k) => k.value === row.type);
                                const needsValue = row.type !== "any";

                                return (
                                    <div
                                        key={row.id}
                                        className="rounded-xl border border-gray-100 bg-gray-50 p-3"
                                    >
                                        <div className="mb-2 flex items-center justify-between gap-2">
                                            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-[11px] font-bold text-gray-500">
                                                {index + 1}
                                            </span>
                                            {filters.length > 1 && (
                                                <button
                                                    onClick={() => removeFilterRow(row.id)}
                                                    className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-100 hover:text-red-500"
                                                    title="Remove filter"
                                                >
                                                    <DeleteOutlined />
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            <Field label="If the message matches">
                                                <Select
                                                    value={row.type}
                                                    onChange={(e) =>
                                                        updateFilterRow(row.id, {
                                                            type: e.target.value as TriggerType,
                                                        })
                                                    }
                                                >
                                                    {FILTER_KINDS.map((k) => (
                                                        <option key={k.value} value={k.value}>
                                                            {k.label}
                                                        </option>
                                                    ))}
                                                </Select>
                                            </Field>

                                            {needsValue && (
                                                <Field
                                                    label="Text to match"
                                                    hint={
                                                        row.type === "keyword"
                                                            ? "Press Enter after each word — any one of them matches"
                                                            : kind?.hint
                                                    }
                                                >
                                                    {row.type === "keyword" ? (
                                                        <WordTagInput
                                                            value={row.value}
                                                            onChange={(v) =>
                                                                updateFilterRow(row.id, {
                                                                    value: v,
                                                                })
                                                            }
                                                            placeholder="price, rate, charges"
                                                        />
                                                    ) : (
                                                        <input
                                                            value={row.value}
                                                            onChange={(e) =>
                                                                updateFilterRow(row.id, {
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

                                        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            <RuleMediaFields
                                                mediaType={row.mediaType}
                                                mediaUrl={row.mediaUrl}
                                                onChange={(patch) =>
                                                    updateFilterRow(row.id, {
                                                        ...patch,
                                                        mediaUrl:
                                                            patch.mediaUrl !==
                                                            undefined
                                                                ? patch.mediaUrl
                                                                : row.mediaUrl,
                                                    })
                                                }
                                            />
                                        </div>

                                        <div className="mt-3">
                                            <RuleMentionToggle
                                                mention={row.mention}
                                                onChange={(mention) =>
                                                    updateFilterRow(row.id, { mention })
                                                }
                                            />
                                        </div>

                                        <div className="mt-3">
                                            <Field label="Reply message">
                                                <textarea
                                                    rows={3}
                                                    value={row.reply}
                                                    onChange={(e) =>
                                                        updateFilterRow(row.id, {
                                                            reply: e.target.value,
                                                        })
                                                    }
                                                    placeholder="Hi, here is our latest price list…"
                                                    className={inputCls}
                                                />
                                            </Field>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    )}


                </div>
            </Modal>

            {/* Details / edit drawer */}
            {viewBot && (
                <BotDetailsDrawer
                    key={viewBot._id}
                    bot={viewBot}
                    onClose={() => setViewId(null)}
                />
            )}

            {/* Delete confirm */}
            <Modal
                open={!!deleteTarget}
                onClose={() => {
                    if (deleteBot.isPending) return; // don't drop an in-flight delete
                    setDeleteTarget(null);
                }}
                title="Delete bot"
                footer={
                    <>
                        <SecondaryButton
                            onClick={() => setDeleteTarget(null)}
                            disabled={deleteBot.isPending}
                        >
                            Cancel
                        </SecondaryButton>
                        <button
                            onClick={() => {
                                if (!deleteTarget) return;
                                deleteBot.mutate(deleteTarget._id, {
                                    onSuccess: () => {
                                        toast.success("Bot deleted");
                                        setDeleteTarget(null);
                                    },
                                    onError: () => toast.error("Delete failed"),
                                });
                            }}
                            disabled={deleteBot.isPending}
                            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-wait disabled:opacity-70"
                        >
                            {deleteBot.isPending ? <Spinner /> : <DeleteOutlined />}
                            {deleteBot.isPending ? "Deleting…" : "Delete"}
                        </button>
                    </>
                }
            >
                <p className="text-sm text-gray-600">
                    <b>{deleteTarget?.name}</b> will stop replying in all{" "}
                    {deleteTarget?.groups.length ?? 0} group(s). This cannot be undone.
                </p>
            </Modal>
        </MainLayout>
    );
};

export default BotsPage;
