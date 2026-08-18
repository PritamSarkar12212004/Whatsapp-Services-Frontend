import React, { useEffect, useMemo, useRef, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { toast } from "sonner";
import {
    PlusOutlined,
    FileTextOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    CheckOutlined,
    StopOutlined,
    PauseCircleOutlined,
    ThunderboltOutlined,
    SearchOutlined,
    DownOutlined,
    AudioOutlined,
    VideoCameraOutlined,
    PictureOutlined,
    FileOutlined,
    LinkOutlined,
    SettingOutlined,
    ApiOutlined,
    CopyOutlined,
    CloseOutlined,
} from "@ant-design/icons";
import {
    useCreateTemplate,
    useDeleteTemplate,
    useTemplates,
    useUpdateTemplate,
} from "../hooks/useCrm";
import {
    AmberBadge,
    BlueBadge,
    CenteredSpinner,
    DangerButton,
    EmptyState,
    Field,
    GrayBadge,
    GreenBadge,
    Modal,
    PrimaryButton,
    SecondaryButton,
    Spinner,
    TemplateStatusBadge,
    fmtDateTime,
    inputCls,
} from "../components/CrmUi";
import type {
    Template,
    TemplateCategory,
    TemplateStatus,
    TemplateType,
} from "../types/crm.types";

const BUILTIN_CATEGORIES = [
    "otp",
    "transactional",
    "promotional",
    "notification",
    "custom",
];

/** Small colored dot for a category (matches categoryBadge colors). */
const CategoryDot: React.FC<{ category: string }> = ({ category }) => {
    const color: Record<string, string> = {
        otp: "bg-blue-500",
        transactional: "bg-blue-500",
        promotional: "bg-green-500",
        notification: "bg-amber-500",
        custom: "bg-gray-400",
    };
    return (
        <span
            className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${
                color[category] || "bg-violet-500"
            }`}
        />
    );
};

const displayCategory = (c: string) => c.charAt(0).toUpperCase() + c.slice(1);

/**
 * Modern category picker: searchable dropdown with created + built-in
 * categories and an "Other…" option for typing a custom category.
 */
const CategoryPicker: React.FC<{
    value: string;
    useOther: boolean;
    onPick: (value: string, useOther: boolean) => void;
    existingCategories: string[];
}> = ({ value, useOther, onPick, existingCategories }) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const onDocClick = (e: MouseEvent) => {
            if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
                setOpen(false);
                setSearch("");
            }
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setOpen(false);
                setSearch("");
            }
        };
        document.addEventListener("mousedown", onDocClick);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDocClick);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

    const q = search.trim().toLowerCase();
    const created = existingCategories.filter((c) => !q || c.toLowerCase().includes(q));
    const builtin = BUILTIN_CATEGORIES.filter(
        (b) => !existingCategories.includes(b) && (!q || b.includes(q)),
    );

    const pick = (val: string, isOther: boolean) => {
        onPick(val, isOther);
        setOpen(false);
        setSearch("");
    };

    return (
        <div ref={rootRef} className="relative">
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className={`flex w-full items-center justify-between gap-2 rounded-xl border bg-white px-3.5 py-2.5 text-sm transition ${
                    open
                        ? "border-emerald-400 ring-2 ring-emerald-100"
                        : "border-gray-200 hover:border-gray-300"
                }`}
            >
                {useOther ? (
                    <span className="flex items-center gap-2 text-gray-800">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-violet-100 text-[11px] text-violet-600">
                            <EditOutlined />
                        </span>
                        Custom…{" "}
                        <span className="text-gray-400">({value || "type below"})</span>
                    </span>
                ) : (
                    <span className="flex items-center gap-2 text-gray-800">
                        {value ? (
                            <>
                                <CategoryDot category={value} />
                                {displayCategory(value)}
                            </>
                        ) : (
                            <span className="text-gray-400">Select a category…</span>
                        )}
                    </span>
                )}
                <DownOutlined
                    className={`text-xs text-gray-400 transition-transform ${
                        open ? "rotate-180" : ""
                    }`}
                />
            </button>

            {/* Panel */}
            {open && (
                <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl shadow-gray-200/60">
                    {/* Search */}
                    <div className="border-b border-gray-100 p-2">
                        <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2">
                            <SearchOutlined className="text-xs text-gray-400" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search categories…"
                                className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
                            />
                        </div>
                    </div>

                    <div className="max-h-64 overflow-y-auto p-1.5">
                        {created.length > 0 && (
                            <>
                                <p className="px-2.5 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                                    Your categories
                                </p>
                                {created.map((c) => (
                                    <button
                                        key={`c-${c}`}
                                        type="button"
                                        onClick={() => pick(c, false)}
                                        className={`flex w-full items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-left text-sm transition ${
                                            !useOther && value === c
                                                ? "bg-emerald-50 text-emerald-700"
                                                : "text-gray-700 hover:bg-gray-50"
                                        }`}
                                    >
                                        <span className="flex items-center gap-2">
                                            <CategoryDot category={c} />
                                            {displayCategory(c)}
                                        </span>
                                        {!useOther && value === c && (
                                            <CheckOutlined className="text-xs text-emerald-500" />
                                        )}
                                    </button>
                                ))}
                            </>
                        )}

                        {builtin.length > 0 && (
                            <>
                                <p className="px-2.5 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                                    Built-in
                                </p>
                                {builtin.map((b) => (
                                    <button
                                        key={`b-${b}`}
                                        type="button"
                                        onClick={() => pick(b, false)}
                                        className={`flex w-full items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-left text-sm transition ${
                                            !useOther && value === b
                                                ? "bg-emerald-50 text-emerald-700"
                                                : "text-gray-700 hover:bg-gray-50"
                                        }`}
                                    >
                                        <span className="flex items-center gap-2">
                                            <CategoryDot category={b} />
                                            {displayCategory(b)}
                                        </span>
                                        {!useOther && value === b && (
                                            <CheckOutlined className="text-xs text-emerald-500" />
                                        )}
                                    </button>
                                ))}
                            </>
                        )}

                        {!created.length && !builtin.length && (
                            <p className="px-2.5 py-3 text-center text-xs text-gray-400">
                                No categories match “{search}”
                            </p>
                        )}

                        {/* Other — always visible */}
                        <div className="mt-1 border-t border-gray-100 pt-1">
                            <button
                                type="button"
                                onClick={() => pick(value || "", true)}
                                className={`flex w-full items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-left text-sm transition ${
                                    useOther
                                        ? "bg-violet-50 text-violet-700"
                                        : "text-gray-700 hover:bg-gray-50"
                                }`}
                            >
                                <span className="flex items-center gap-2">
                                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-violet-100 text-[11px] text-violet-600">
                                        <PlusOutlined />
                                    </span>
                                    Other… (write your own)
                                </span>
                                {useOther && (
                                    <CheckOutlined className="text-xs text-violet-500" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const categoryBadge = (c: TemplateCategory) => {
    const map: Record<string, React.ReactNode> = {
        otp: <BlueBadge>OTP</BlueBadge>,
        transactional: <BlueBadge>Transactional</BlueBadge>,
        promotional: <GreenBadge>Promotional</GreenBadge>,
        notification: <AmberBadge>Notification</AmberBadge>,
        custom: <GrayBadge>Custom</GrayBadge>,
    };
    if (map[c]) return map[c];
    // Custom category typed by the user
    const label = c.length > 18 ? `${c.slice(0, 18)}…` : c;
    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-600">
            {label}
        </span>
    );
};

/**
 * Does `word` appear in `content` — as a {{word}} token OR as a bare word
 * (word-boundary)? Used to validate that a variable actually exists in the
 * content before it can be added / sent.
 */
const wordInContent = (content: string, word: string) => {
    if (!word) return false;
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`\\b${escaped}\\b`, "i").test(content || "");
};

/**
 * Default schedule time (now + 1 minute, local, 24h) shown in the
 * datetime-local picker when the Schedule toggle is switched ON.
 */
const defaultScheduleAt = () => {
    const d = new Date(Date.now() + 60_000);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
        d.getHours()
    )}:${pad(d.getMinutes())}`;
};

/**
 * Highlight dynamic variables inside template content:
 * - `{{variable}}` tokens are always highlighted
 * - plain occurrences of the variable names are highlighted too, so the user
 *   can see at a glance which words will change when the message is sent.
 */
const HighlightedContent: React.FC<{
    content: string;
    variables: string[];
    onDark?: boolean;
}> = ({ content, variables, onDark = false }) => {
    type Part = { text: string; kind: "plain" | "var" | "link" };

    const parts = useMemo(() => {
        const names = variables
            .map((v) => v.trim())
            .filter(Boolean)
            .filter((v, i, arr) => arr.indexOf(v) === i);

        // Tokenize content into {{variables}}, links and plain text.
        const tokens: Part[] = [];
        const re = /(\{\{[^{}]+\}\})|(https?:\/\/[^\s]+|www\.[^\s]+)/g;
        let last = 0;
        content.replace(re, (m, _brace, _url, idx) => {
            if (idx > last) {
                tokens.push({ text: content.slice(last, idx), kind: "plain" });
            }
            tokens.push({
                text: m,
                kind: m.startsWith("{{") ? "var" : "link",
            });
            last = idx + m.length;
            return m;
        });
        if (last < content.length) {
            tokens.push({ text: content.slice(last), kind: "plain" });
        }

        // Within plain text, highlight bare variable names (word boundaries)
        if (names.length) {
            const escaped = names
                .map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
                .filter(Boolean);
            const plainRe = new RegExp(`\\b(${escaped.join("|")})\\b`, "gi");
            const expanded: Part[] = [];
            for (const part of tokens) {
                if (part.kind !== "plain") {
                    expanded.push(part);
                    continue;
                }
                let cursor = 0;
                part.text.replace(plainRe, (m, _g, idx) => {
                    if (idx > cursor) {
                        expanded.push({ text: part.text.slice(cursor, idx), kind: "plain" });
                    }
                    expanded.push({ text: m, kind: "var" });
                    cursor = idx + m.length;
                    return m;
                });
                if (cursor < part.text.length) {
                    expanded.push({ text: part.text.slice(cursor), kind: "plain" });
                }
            }
            return expanded;
        }
        return tokens;
    }, [content, variables]);

    if (!content) {
        return (
            <p className="whitespace-pre-wrap text-sm text-gray-400">
                Type your message here…
            </p>
        );
    }

    const linkCls = onDark
        ? "font-medium text-sky-300 underline underline-offset-2"
        : "font-medium text-blue-600 underline underline-offset-2";

    return (
        <p className={`whitespace-pre-wrap text-sm ${onDark ? "text-white" : "text-gray-700"}`}>
            {parts.map((part, i) =>
                part.kind === "var" ? (
                    <mark
                        key={i}
                        className="rounded bg-amber-100 px-0.5 py-px font-medium text-amber-800"
                    >
                        {part.text}
                    </mark>
                ) : part.kind === "link" ? (
                    <a
                        key={i}
                        href={
                            part.text.startsWith("www.")
                                ? `https://${part.text}`
                                : part.text
                        }
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className={linkCls}
                    >
                        {part.text}
                    </a>
                ) : (
                    <span key={i}>{part.text}</span>
                ),
            )}
        </p>
    );
};

const TemplatesPage: React.FC = () => {
    const { data: templates, isLoading } = useTemplates();

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Template | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Template | null>(null);
    const [previewTarget, setPreviewTarget] = useState<Template | null>(null);

    const deleteTemplate = useDeleteTemplate();

    const copyId = async (id: string) => {
        try {
            await navigator.clipboard.writeText(id);
            toast.success("Template ID copied");
        } catch {
            toast.error("Copy failed");
        }
    };

    // Categories that already exist among this user's templates
    const existingCategories = useMemo(() => {
        const set = new Set<string>();
        (templates || []).forEach((t) => set.add(t.category));
        return Array.from(set);
    }, [templates]);

    return (
        <MainLayout>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Templates</h1>
                    <p className="mt-1 text-sm text-gray-500">
One message, endless reach — reusable WhatsApp templates with dynamic variables for OTPs, offers & alerts
                    </p>
                </div>
                <PrimaryButton
                    onClick={() => {
                        setEditing(null);
                        setModalOpen(true);
                    }}
                >
                    <PlusOutlined /> New Template
                </PrimaryButton>
            </div>

            {isLoading ? (
                <CenteredSpinner label="Loading templates…" />
            ) : !templates?.length ? (
                <EmptyState
                    icon={<FileTextOutlined />}
                    title="No templates yet"
                    description="Create a template like 'Hi {{name}}, your OTP is {{otp}}' to reuse in campaigns."
                    action={
                        <PrimaryButton
                            onClick={() => {
                                setEditing(null);
                                setModalOpen(true);
                            }}
                        >
                            <PlusOutlined /> Create your first template
                        </PrimaryButton>
                    }
                />
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {templates.map((t) => (
                        <div
                            key={t._id}
                            className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-lg text-emerald-600">
                                    <FileTextOutlined />
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => setPreviewTarget(t)}
                                        title="Preview"
                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-emerald-50 hover:text-emerald-600"
                                    >
                                        <EyeOutlined />
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditing(t);
                                            setModalOpen(true);
                                        }}
                                        title="Edit"
                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                                    >
                                        <EditOutlined />
                                    </button>
                                    <button
                                        onClick={() => setDeleteTarget(t)}
                                        title="Delete"
                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                                    >
                                        <DeleteOutlined />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-4 flex items-center gap-2">
                                <h3 className="text-base font-semibold text-gray-900">{t.name}</h3>
                                {t.devMode && (
                                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                                        <SettingOutlined /> Dev Mode
                                    </span>
                                )}
                                {t.devMode &&
                                    (t.gateState === "live" ? (
                                        <span
                                            className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-700"
                                            title="API LIVE — a campaign for this template is running, anyone can call it"
                                        >
                                            <ThunderboltOutlined /> API live
                                        </span>
                                    ) : t.gateState === "paused" ? (
                                        <span
                                            className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-700"
                                            title="All linked campaigns are paused — resume one to enable API sends"
                                        >
                                            <PauseCircleOutlined /> API paused
                                        </span>
                                    ) : t.gateState === "added" ? (
                                        <span
                                            className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-blue-700"
                                            title={`Added to ${t.inCampaignCount} campaign${t.inCampaignCount === 1 ? "" : "s"} — press Run in the dev tab to go LIVE`}
                                        >
                                            <LinkOutlined /> In campaign
                                        </span>
                                    ) : (
                                        <span
                                            className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-red-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-red-600"
                                            title="API OFF — not in any campaign. Add it to a dev campaign, then Run to go live"
                                        >
                                            <StopOutlined /> API off
                                        </span>
                                    ))}
                            </div>
                            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                {categoryBadge(t.category)}
                                <TemplateStatusBadge status={t.status} />
                                {t.type !== "text" && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-600">
                                        {t.type === "image" ? (
                                            <PictureOutlined />
                                        ) : t.type === "video" ? (
                                            <VideoCameraOutlined />
                                        ) : t.type === "audio" ? (
                                            <AudioOutlined />
                                        ) : (
                                            <FileOutlined />
                                        )}
                                        {t.type}
                                    </span>
                                )}
                                {t.variables?.length > 0 && (
                                    <GrayBadge small>
                                        {t.variables.length} variable
                                        {t.variables.length > 1 ? "s" : ""}
                                    </GrayBadge>
                                )}
                            </div>

                            <div className="mt-3 flex-1 rounded-xl bg-gray-50 p-3 text-xs text-gray-600">
                                <HighlightedContent
                                    content={t.content}
                                    variables={t.variables || []}
                                />
                            </div>

                            <div className="mt-4 flex items-center justify-between gap-2 border-t border-gray-100 pt-3">
                                <span className="text-[11px] text-gray-400">
                                    Updated {fmtDateTime(t.updatedAt)}
                                </span>
                                <button
                                    onClick={() => setPreviewTarget(t)}
                                    className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 transition hover:text-emerald-700"
                                >
                                    <EyeOutlined /> Preview
                                </button>
                            </div>
                            <div className="mt-1.5 flex items-center justify-between gap-2 font-mono text-[10px] text-gray-400">
                                <span className="truncate">ID: {t._id}</span>
                                <button
                                    type="button"
                                    onClick={() => copyId(t._id)}
                                    title="Copy template ID"
                                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-emerald-600"
                                >
                                    <CopyOutlined />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <TemplateFormModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                editing={editing}
                existingCategories={existingCategories}
            />

            <Modal
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                title="Delete template"
                footer={
                    <>
                        <SecondaryButton onClick={() => setDeleteTarget(null)}>
                            Cancel
                        </SecondaryButton>
                        <DangerButton
                            onClick={() =>
                                deleteTemplate.mutate(deleteTarget!._id, {
                                    onSuccess: () => {
                                        toast.success("Template deleted");
                                        setDeleteTarget(null);
                                    },
                                    onError: (err: any) =>
                                        toast.error(
                                            err?.response?.data?.message || "Delete failed",
                                        ),
                                })
                            }
                            disabled={deleteTemplate.isPending}
                        >
                            {deleteTemplate.isPending ? <Spinner /> : <DeleteOutlined />} Delete
                        </DangerButton>
                    </>
                }
            >
                <p className="text-sm text-gray-600">
                    Delete template <strong>{deleteTarget?.name}</strong>? Campaigns using it will
                    no longer be able to start.
                </p>
            </Modal>

            {previewTarget && (
                <TemplatePreviewModal
                    template={previewTarget}
                    onClose={() => setPreviewTarget(null)}
                />
            )}
        </MainLayout>
    );
};

// ------------------------------------------------------------- Form modal

const TemplateFormModal: React.FC<{
    open: boolean;
    onClose: () => void;
    editing: Template | null;
    existingCategories: string[];
}> = ({ open, onClose, editing, existingCategories }) => {
    const createTemplate = useCreateTemplate();
    const updateTemplate = useUpdateTemplate();

    const [form, setForm] = useState({
        name: "",
        category: "" as TemplateCategory,
        useOtherCategory: false,
        otherCategory: "",
        content: "",
        variables: "",
        devMode: false,
        mediaType: "text" as TemplateType,
        mediaUrl: "",
        mediaFilename: "",
        // API call options (dev mode)
        toMode: "single" as "single" | "multiple",
        scheduleOn: false,
        scheduleAt: "",
    });

    useEffect(() => {
        if (open) {
            const cat = editing?.category || existingCategories[0] || "otp";
            const isKnown =
                !editing?.category ||
                ["otp", "transactional", "promotional", "notification", "custom"].includes(cat) ||
                existingCategories.includes(cat);
            const m = editing?.media || null;
            setForm({
                name: editing?.name || "",
                category: isKnown ? cat : "",
                useOtherCategory: !isKnown,
                otherCategory: !isKnown ? cat : "",
                content: editing?.content || "",
                variables: (editing?.variables || []).join(", "),
                // Show the Variables section when a template already uses them
                devMode: (editing?.variables?.length || 0) > 0,
                mediaType: editing?.type || "text",
                mediaUrl: m?.url || "",
                mediaFilename: m?.filename || "",
                toMode: "single",
                scheduleOn: editing?.scheduleEnabled || false,
                scheduleAt: "",
            });
        }
    }, [open, editing, existingCategories]);

    const finalCategory =
        form.useOtherCategory || !form.category
            ? (form.otherCategory.trim() || "custom")
            : form.category;

    const submit = () => {
        if (!form.name.trim()) {
            toast.error("Template name is required");
            return;
        }
        // Text templates need a body; media templates carry their message in
        // the media caption, so content is optional for them.
        if (form.mediaType === "text" && !form.content.trim()) {
            toast.error("Template content is required");
            return;
        }
        if (!finalCategory.trim()) {
            toast.error("Category is required");
            return;
        }
        if (form.mediaType !== "text" && !form.devMode && !form.mediaUrl.trim()) {
            toast.error("Paste a media link (URL) for the selected type");
            return;
        }
        // Dev mode: har variable ka word content me hona chahiye
        const varList = form.variables
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean);
        const missingVars = varList.filter((v) => !wordInContent(form.content, v));
        if (form.devMode && missingVars.length > 0) {
            toast.error(
                `Variables not found in content — add them to the content first: ${missingVars.join(", ")}`,
            );
            return;
        }
        const payload = {
            name: form.name.trim(),
            category: finalCategory.trim(),
            type: form.mediaType as TemplateType,
            status: "active" as TemplateStatus,
            devMode: form.devMode,
            scheduleEnabled: form.devMode ? form.scheduleOn : false,
            content: form.content,
            variables: varList,
            media: form.devMode
                ? null
                : form.mediaType === "text"
                  ? null
                  : {
                        url: form.mediaUrl.trim(),
                        filename:
                            form.mediaType === "document"
                                ? form.mediaFilename.trim() || "file.pdf"
                                : null,                          mimeType: null,
                          caption: null,
                      },
        };
        if (editing) {
            updateTemplate.mutate(
                { id: editing._id, input: payload },
                {
                    onSuccess: () => {
                        toast.success("Template updated");
                        onClose();
                    },
                    onError: (err: any) =>
                        toast.error(err?.response?.data?.message || "Update failed"),
                },
            );
        } else {
            createTemplate.mutate(payload, {
                onSuccess: (res: any) => {
                    const id = res?.data?.data?._id;
                    toast.success("Template created", {
                        description: id ? `Template ID: ${id}` : undefined,
                        action: id
                            ? {
                                  label: "Copy ID",
                                  onClick: () => {
                                      navigator.clipboard
                                          .writeText(id)
                                          .then(() => toast.success("Template ID copied"))
                                          .catch(() => toast.error("Copy failed"));
                                  },
                              }
                            : undefined,
                    });
                    onClose();
                },
                onError: (err: any) =>
                    toast.error(err?.response?.data?.message || "Create failed"),
            });
        }
    };

    const pending = createTemplate.isPending || updateTemplate.isPending;

    // Media URL used in the live preview — media link field se hi aata hai
    // (content me koi link nahi).
    const previewMediaUrl = form.mediaUrl.trim();

    // Dev-mode API example — kaise call karna hai (URL + token + body)
    // Variables content ke {{...}} tokens + plain words (jo content me hain)
    // dono se derive hote hain — jo content me nahi wo API me nahi de sakte.
    const apiVariables = useMemo(() => {
        const exampleVars: Record<string, string> = {};
        const re = /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g;
        let m;
        while ((m = re.exec(form.content)) !== null) {
            exampleVars[m[1]] = `sample_${m[1]}`;
        }
        form.variables
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean)
            .forEach((v) => {
                if (!exampleVars[v] && wordInContent(form.content, v)) {
                    exampleVars[v] = `sample_${v}`;
                }
            });
        return exampleVars;
    }, [form.content, form.variables]);

    const apiExample = useMemo(() => {
        const body: Record<string, unknown> = {
            to:
                form.toMode === "multiple"
                    ? ["919999999999", "918888888888"]
                    : "919999999999",
            template: editing?._id || "<YOUR_TEMPLATE_ID>",
            variables: apiVariables,
        };
        // Media type select kiya hai to caller apna pura URL body me dega
        if (form.mediaType !== "text") {
            body.media = {
                url: "<YOUR_FULL_MEDIA_URL>",
            };
        }
        // Schedule on -> date + time comes via API call, body shows an example (24h)
        if (form.scheduleOn) {
            body.scheduledAt = form.scheduleAt || defaultScheduleAt();
        }
        return JSON.stringify(body, null, 4);
    }, [apiVariables, form.mediaType, form.toMode, form.scheduleOn, form.scheduleAt, editing]);

    const copyApiExample = async () => {
        try {
            await navigator.clipboard.writeText(apiExample);
            toast.success("API body copied");
        } catch {
            toast.error("Copy failed");
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={editing ? "Edit template" : "New template"}
            wide
            footer={
                <>
                    <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
                    <PrimaryButton onClick={submit} disabled={pending}>
                        {pending ? <Spinner /> : <CheckOutlined />}
                        {editing ? "Save" : "Create"}
                    </PrimaryButton>
                </>
            }
        >
            <div className="space-y-4">
                {/* Dev Mode toggle — top of the form */}
                <div
                    className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition-colors ${
                        form.devMode
                            ? "border-amber-200 bg-amber-50"
                            : "border-gray-200 bg-gray-50"
                    }`}
                >
                    <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-800">
                            Dev Mode
                        </p>
                        <p className="mt-0.5 text-[11px] leading-tight text-gray-400">
                            {form.devMode
                                ? "ON — text in Content, pick the media type — the media URL goes in the API call"
                                : "OFF — simple text/link template only"}
                        </p>
                    </div>
                    <button
                        type="button"
                        role="switch"
                        aria-checked={form.devMode}
                        aria-label="Toggle Dev Mode"
                        onClick={() => setForm({ ...form, devMode: !form.devMode })}
                        className={`relative h-5 w-9 shrink-0 cursor-pointer select-none rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 ${
                            form.devMode ? "bg-amber-500" : "bg-gray-300"
                        }`}
                    >
                        <span
                            className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
                                form.devMode ? "translate-x-4" : "translate-x-0"
                            }`}
                        />
                    </button>
                </div>

                <Field label="Template name" required>
                    <input
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g. OTP Verification"
                        className={inputCls}
                    />
                </Field>

                <Field
                    label="Category"
                    hint={
                        form.useOtherCategory || !form.category
                            ? "Type your own category name"
                            : "Pick a category or choose Other to create your own"
                    }
                >
                    <div className="space-y-2">
                        <CategoryPicker
                            value={form.category}
                            useOther={form.useOtherCategory}
                            onPick={(category, useOther) =>
                                setForm({ ...form, category, useOtherCategory: useOther })
                            }
                            existingCategories={existingCategories}
                        />
                        {(form.useOtherCategory || !form.category) && (
                            <input
                                value={form.otherCategory}
                                onChange={(e) =>
                                    setForm({ ...form, otherCategory: e.target.value })
                                }
                                placeholder="e.g. Welcome, Offer, Reminder"
                                className={inputCls}
                                autoFocus
                            />
                        )}
                        {finalCategory && finalCategory !== "custom" && (
                            <p className="text-xs text-gray-400">
                                Category: {finalCategory}
                            </p>
                        )}
                    </div>
                </Field>

                <Field label="Content" required>
                    <textarea
                        value={form.content}
                        onChange={(e) => setForm({ ...form, content: e.target.value })}
                        rows={6}
                        placeholder={
                            form.devMode
                                ? "Hi name,\n\nYour OTP is otp. It expires in 5 minutes.\n\n(Write name/otp plainly — they highlight when added as variables)"
                                : "Hi Pritam,\n\nYour OTP is 482921. It expires in 5 minutes."
                        }
                        className={`${inputCls} font-mono`}
                    />
                </Field>

                {!form.devMode && (
                    <Field
                        label="Message type"
                        hint={
                            form.mediaType === "text"
                                ? "Paste a URL in the text — WhatsApp shows the link preview automatically"
                                : "Paste a direct media link (URL) — sent in WhatsApp native format"
                        }
                    >
                        <div className="flex flex-wrap gap-1.5">
                            {([
                                ["text", "Text", <FileTextOutlined key="t" />],
                                ["image", "Image", <PictureOutlined key="i" />],
                            ] as [TemplateType, string, React.ReactNode][]).map(
                                ([val, label, icon]) => (
                                    <button
                                        key={val}
                                        type="button"
                                        onClick={() =>
                                            setForm({ ...form, mediaType: val })
                                        }
                                        className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition ${
                                            form.mediaType === val
                                                ? "bg-emerald-600 text-white shadow-sm"
                                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                        }`}
                                    >
                                        {icon}
                                        {label}
                                    </button>
                                ),
                            )}
                        </div>
                    </Field>
                )}

                {!form.devMode && form.mediaType !== "text" && (
                    <div className="space-y-4 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
                        <Field
                            label="Media link (URL)"
                            required
                            hint={
                                form.mediaType === "image"
                                    ? "Direct image URL, e.g. https://example.com/offer.jpg"
                                    : form.mediaType === "video"
                                      ? "Direct video URL, e.g. https://example.com/video.mp4"
                                      : form.mediaType === "audio"
                                        ? "Direct audio URL, e.g. https://example.com/audio.mp3"
                                        : "Direct file URL, e.g. https://example.com/brochure.pdf"
                            }
                        >
                            <input
                                value={form.mediaUrl}
                                onChange={(e) =>
                                    setForm({ ...form, mediaUrl: e.target.value })
                                }
                                placeholder="https://…"
                                className={inputCls}
                            />
                        </Field>
                        {form.mediaType === "document" && (
                            <Field
                                label="File name"
                                hint={
                                    form.devMode
                                        ? "Dynamic — e.g. {{name}}_brochure.pdf changes per contact"
                                        : "Shown as the file name in WhatsApp, e.g. Offer_Brochure.pdf"
                                }
                            >
                                <input
                                    value={form.mediaFilename}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            mediaFilename: e.target.value,
                                        })
                                    }
                                    placeholder="e.g. Offer_Brochure.pdf"
                                    className={inputCls}
                                />
                            </Field>
                        )}
                    </div>
                )}

                {/* Live preview with variable + link highlighting */}
                <div>
                    <div className="mb-1.5 flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                            Live preview
                        </p>
                        {(form.variables.trim() || form.mediaType !== "text") && (
                            <p className="text-[11px] text-gray-400">
                                {form.mediaType !== "text"
                                    ? form.devMode
                                        ? "Media + text preview · amber = dynamic variable"
                                        : "Media + text ka preview"
                                    : form.devMode
                                      ? "Amber = dynamic variable (har contact me alag) · link = clickable"
                                      : "Highlighted = dynamic variable · link = clickable"}
                            </p>
                        )}
                    </div>
                    <div className="rounded-2xl bg-gray-50/60 p-4">
                        {/* WhatsApp-style bubble */}
                        <div className="max-w-sm rounded-2xl rounded-tl-sm bg-emerald-500 px-4 py-3 text-sm text-white shadow-sm">                            {form.mediaType !== "text" &&
                            previewMediaUrl &&
                            previewMediaUrl.includes("{{") ? (
                                <div className="mb-2 rounded-xl bg-emerald-600/70 px-3 py-3">
                                    <p className="flex items-center gap-2 text-xs font-medium">
                                        <LinkOutlined /> Dynamic media link
                                    </p>
                                    <p className="mt-1 truncate text-[11px] text-emerald-100">
                                        {previewMediaUrl}
                                    </p>
                                    <p className="mt-1 text-[10px] text-emerald-200">
A different URL is sent for each contact
                                    </p>
                                </div>
                            ) : form.mediaType !== "text" && previewMediaUrl ? (
                                <div className="mb-2 overflow-hidden rounded-xl bg-emerald-600/70">
                                    {form.mediaType === "image" ? (
                                        <img
                                            src={previewMediaUrl}
                                            alt="media"
                                            className="max-h-56 w-full object-cover"
                                        />
                                    ) : form.mediaType === "video" ? (
                                        <video
                                            src={previewMediaUrl}
                                            controls
                                            className="max-h-56 w-full"
                                        />
                                    ) : form.mediaType === "audio" ? (
                                        <audio
                                            src={previewMediaUrl}
                                            controls
                                            className="w-full px-2 py-3"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-3 px-3 py-3">
                                            <FileOutlined className="text-2xl" />
                                            <span className="truncate text-xs font-medium">
                                                {form.mediaFilename.trim() || "file.pdf"}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ) : null}
                             <div className="whitespace-pre-wrap">
                                <HighlightedContent
                                    content={form.content}
                                    variables={form.variables.split(",")}
                                    onDark
                                />
                            </div>
                            <p className="mt-2 text-right text-[10px] text-emerald-100">
                                {new Date().toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </p>
                        </div>
                    </div>
                </div>

                {form.devMode && (
                    <Field
                        label="Variables"
                        hint="Type variable names (no {{}} needed) — the word must exist in the content. It highlights instantly"
                    >
                        <input
                            value={form.variables}
                            onChange={(e) =>
                                setForm({ ...form, variables: e.target.value })
                            }
                            placeholder="e.g. otp, name"
                            className={inputCls}
                        />
                        {form.variables.trim() && (
                            <div className="mt-1.5 flex flex-wrap gap-1.5">
                                {form.variables
                                    .split(",")
                                    .map((v) => v.trim())
                                    .filter(Boolean)
                                    .map((v, i) => {
                                        const ok = wordInContent(form.content, v);
                                        return (
                                            <span
                                                key={`${v}-${i}`}
                                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                                    ok
                                                        ? "bg-emerald-100 text-emerald-700"
                                                        : "bg-red-100 text-red-600"
                                                }`}
                                            >
                                                {ok ? <CheckOutlined /> : <CloseOutlined />}
                                                {v}
                                                {ok ? " — in content" : " — not in content!"}
                                            </span>
                                        );
                                    })}
                            </div>
                        )}
                    </Field>
                )}

                {/* Message type — dev mode: what to send. Media URL is NOT here
                    — the API caller sends the full URL in the body. */}
                {form.devMode && (
                    <Field
                        label="Message type (what to send)"
                        hint={
                            form.mediaType === "text"
                                ? "Text = plain text — links get a WhatsApp preview"
                                : "Media URL goes in the API call — send your full URL in media.url (see example below)"
                        }
                    >
                        <div className="flex flex-wrap gap-1.5">
                            {([
                                ["text", "Text", <FileTextOutlined key="t" />],
                                ["image", "Image", <PictureOutlined key="i" />],
                            ] as [TemplateType, string, React.ReactNode][]).map(
                                ([val, label, icon]) => (
                                    <button
                                        key={val}
                                        type="button"
                                        onClick={() =>
                                            setForm({ ...form, mediaType: val })
                                        }
                                        className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition ${
                                            form.mediaType === val
                                                ? "bg-emerald-600 text-white shadow-sm"
                                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                        }`}
                                    >
                                        {icon}
                                        {label}
                                    </button>
                                ),
                            )}
                        </div>
                    </Field>
                )}

                {/* Dev mode — how to call via API */}
                {form.devMode && (
                    <div className="rounded-2xl border border-gray-800 bg-gray-900 p-4">
                        <div className="mb-2 flex items-center justify-between gap-2">
                            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-400">
                                <ApiOutlined /> How to call via API
                            </p>
                            <button
                                type="button"
                                onClick={copyApiExample}
                                className="flex items-center gap-1 rounded-lg bg-gray-700 px-2.5 py-1 text-[11px] font-semibold text-gray-200 transition hover:bg-gray-600"
                            >
                                <CopyOutlined /> Copy body
                            </button>
                        </div>

                        {/* Recipient + schedule options */}
                        <div className="mb-3 flex flex-wrap items-center gap-3 rounded-xl bg-gray-800/60 p-3">
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-semibold text-gray-400">
Send to:
                                </span>
                                <div className="flex overflow-hidden rounded-lg border border-gray-600">
                                    {(["single", "multiple"] as const).map((m) => (
                                        <button
                                            key={m}
                                            type="button"
                                            onClick={() =>
                                                setForm({ ...form, toMode: m })
                                            }
                                            className={`px-3 py-1.5 text-[11px] font-semibold transition ${
                                                form.toMode === m
                                                    ? "bg-emerald-600 text-white"
                                                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                            }`}
                                        >
                                            {m === "single" ? "Single" : "Multiple"}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-semibold text-gray-400">
                                    Schedule:
                                </span>
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={form.scheduleOn}
                                    onClick={() =>
                                        setForm({ ...form, scheduleOn: !form.scheduleOn })
                                    }
                                    className={`relative h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors ${
                                        form.scheduleOn ? "bg-emerald-500" : "bg-gray-600"
                                    }`}
                                >
                                    <span
                                        className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                                            form.scheduleOn ? "translate-x-4" : "translate-x-0"
                                        }`}
                                    />
                                </button>
                            </div>
                        </div>
                        <div className="mb-2 space-y-1 text-[10px] leading-relaxed text-gray-500">
                            <p>
                                {"Variables — plain words written in Content (no {{}} needed). Every variable needs a value in the body (name → value). Anything else is ignored:"}
                            </p>
                            <p className="font-mono text-gray-400">
                                {Object.keys(apiVariables).length > 0
                                    ? Object.entries(apiVariables)
                                          .map(([k]) => `"${k}": "sample_${k}"`)
                                          .join(" · ")
                                    : 'Add a variable word to Content — only those appear here'}
                            </p>
                            {form.mediaType !== "text" && (
                                <p>
                                    {"Media — media type selected? Send your full URL in media.url ({{variable}} allowed, replaced per send):"}
                                </p>
                            )}
                        </div>
                        <pre className="overflow-x-auto font-mono text-[11px] leading-relaxed text-emerald-300">
{`POST https://numerate-resisting-squeamish.ngrok-free.dev/api/messaging/messages/send

Headers:
  Authorization: Bearer <token>

Body:
${apiExample}`}
                        </pre>
                        {form.mediaType !== "text" && (
                            <p className="mt-2 border-t border-gray-700 pt-2 text-[10px] leading-relaxed text-gray-500">
                                {"Note: dev mode doesn't save media on the template — send your full URL in media.url ({{variable}} allowed, replaced per send)."}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
};

// ------------------------------------------------------------ Preview modal

const TemplatePreviewModal: React.FC<{
    template: Template;
    onClose: () => void;
}> = ({ template, onClose }) => {
    const [values, setValues] = useState<Record<string, string>>({});

    useEffect(() => {
        const init: Record<string, string> = {};
        (template.variables || []).forEach((v) => {
            init[v] = `sample_${v}`;
        });
        setValues(init);
    }, [template]);

    const rendered = useMemo(
        () =>
            (template.variables || []).reduce(
                (acc, v) => acc.replaceAll(`{{${v}}}`, values[v] ?? `{{${v}}}`),
                template.content,
            ),
        [template, values],
    );

    // Same API body shown in the create modal — built from the real template.
    const apiBody = useMemo(() => {
        const body: Record<string, unknown> = {
            to: "919999999999",
            template: template._id,
            variables: Object.fromEntries(
                (template.variables || []).map((v) => [v, `sample_${v}`]),
            ),
        };
        if (template.type !== "text") {
            body.media = { url: "<YOUR_FULL_MEDIA_URL>" };
        }
        if (template.scheduleEnabled) {
            body.scheduledAt = defaultScheduleAt();
        }
        return JSON.stringify(body, null, 4);
    }, [template]);

    const copyText = async (text: string, label: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success(label);
        } catch {
            toast.error("Copy failed");
        }
    };

    return (
        <Modal open onClose={onClose} title={`Preview — ${template.name}`} wide>
            <div className="space-y-4">
                {/* Template ID + quick copy */}
                <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5">
                    <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                            Template ID
                        </p>
                        <p className="truncate font-mono text-xs font-semibold text-gray-800">
                            {template._id}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => copyText(template._id, "Template ID copied")}
                        className="flex shrink-0 items-center gap-1 rounded-lg bg-gray-700 px-2.5 py-1.5 text-[11px] font-semibold text-gray-200 transition hover:bg-gray-600"
                    >
                        <CopyOutlined /> Copy ID
                    </button>
                </div>

                {template.variables?.length > 0 && (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {template.variables.map((v) => (
                            <Field key={v} label={`Variable: ${v}`}>
                                <input
                                    value={values[v] || ""}
                                    disabled
                                    className={`${inputCls} cursor-not-allowed bg-gray-100 text-gray-500`}
                                />
                            </Field>
                        ))}
                    </div>
                )}

                <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Rendered message
                    </p>
                    <div className="max-w-sm rounded-2xl rounded-tl-sm bg-emerald-500 px-4 py-3 text-sm text-white shadow-sm">
                        {template.type !== "text" && template.media?.url && (
                            <div className="mb-2 overflow-hidden rounded-xl bg-emerald-600/70">
                                {template.type === "image" ? (
                                    <img
                                        src={template.media.url}
                                        alt="media"
                                        className="max-h-56 w-full object-cover"
                                    />
                                ) : template.type === "video" ? (
                                    <video
                                        src={template.media.url}
                                        controls
                                        className="max-h-56 w-full"
                                    />
                                ) : template.type === "audio" ? (
                                    <audio
                                        src={template.media.url}
                                        controls
                                        className="w-full px-2 py-3"
                                    />
                                ) : (
                                    <div className="flex items-center gap-3 px-3 py-3">
                                        <FileOutlined className="text-2xl" />
                                        <span className="truncate text-xs font-medium">
                                            {template.media.filename || "file.pdf"}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                        <p className="whitespace-pre-wrap">
                            <HighlightedContent
                                content={
                                    template.type === "text"
                                        ? rendered
                                        : template.media?.caption || rendered
                                }
                                variables={template.variables || []}
                                onDark
                            />
                        </p>
                        <p className="mt-2 text-right text-[10px] text-emerald-100">
                            {new Date().toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </p>
                    </div>
                </div>

                <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Raw content
                    </p>
                    <pre className="overflow-x-auto rounded-xl bg-gray-50 p-3 text-xs text-gray-600">
                        {template.content}
                    </pre>
                </div>

                {/* Dev mode — full API call details (same as the create modal) */}
                {template.devMode && (
                    <div className="rounded-2xl border border-gray-800 bg-gray-900 p-4">
                        <div className="mb-2 flex items-center justify-between gap-2">
                            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-400">
                                <ApiOutlined /> How to call via API
                            </p>
                            <button
                                type="button"
                                onClick={() =>
                                    copyText(
                                        `POST https://numerate-resisting-squeamish.ngrok-free.dev/api/messaging/messages/send\n\nHeaders:\n  Authorization: Bearer <token>\n\nBody:\n${apiBody}`,
                                        "API body copied",
                                    )
                                }
                                className="flex items-center gap-1 rounded-lg bg-gray-700 px-2.5 py-1 text-[11px] font-semibold text-gray-200 transition hover:bg-gray-600"
                            >
                                <CopyOutlined /> Copy body
                            </button>
                        </div>
                        <pre className="overflow-x-auto font-mono text-[11px] leading-relaxed text-emerald-300">
{`POST https://numerate-resisting-squeamish.ngrok-free.dev/api/messaging/messages/send

Headers:
  Authorization: Bearer <token>

Body:
${apiBody}`}
                        </pre>
                        <p className="mt-2 border-t border-gray-700 pt-2 text-[10px] leading-relaxed text-gray-500">
                            {"Template ID: "}
                            <span className="font-mono text-gray-300">{template._id}</span>
                            {" — dev mode templates don't save media; send your full URL in media.url ({{variable}} allowed, replaced per send)."}
                        </p>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default TemplatesPage;
