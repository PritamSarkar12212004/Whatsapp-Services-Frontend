import React, { useEffect, useMemo, useRef, useState } from "react";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import MainLayout from "@/components/layout/MainLayout";
import { toast } from "sonner";
import {
    PlusOutlined,
    SendOutlined,
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    CaretRightOutlined,
    PauseOutlined,
    UndoOutlined,
    CloseCircleOutlined,
    SearchOutlined,
    PictureOutlined,
    CheckOutlined,
    TeamOutlined,
    BarChartOutlined,
    DownOutlined,
    FileTextOutlined,
    SettingOutlined,
    ThunderboltOutlined,
} from "@ant-design/icons";
import { previewCampaignMessage } from "../api/crm.api";
import {
    useCampaignAction,
    useCancelMessage,
    useCampaignAudience,
    useCampaignRecipients,
    useCampaigns,
    useCampaignStats,
    useContactGroups,
    useContacts,
    useCreateCampaign,
    useDeleteCampaign,
    useTags,
    useTemplates,
    useUnscheduleCampaign,
    useUpdateCampaign,
} from "../hooks/useCrm";
import {
    Avatar,
    BlueBadge,
    CampaignStatusBadge,
    CenteredSpinner,
    DangerButton,
    EmptyState,
    Field,
    GrayBadge,
    GreenBadge,
    Modal,
    PrimaryButton,
    RedBadge,
    SecondaryButton,
    Spinner,
    fmtDateTime,
    fmtPhone,
    inputCls,
    recipientStatusBadge,
    selectCls,
} from "../components/CrmUi";
import type {
    Campaign,
    CampaignAudience,
    CampaignStatus,
    Template,
} from "../types/crm.types";

const STATUS_TABS: { value: CampaignStatus | "all"; label: string }[] = [
    { value: "all", label: "All" },
    { value: "draft", label: "Draft" },
    { value: "queued", label: "Queued" },
    { value: "running", label: "Running" },
    { value: "paused", label: "Paused" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
];

const audienceSummary = (c: Campaign) => {
    const a = c.audience || {};
    const parts: string[] = [];
    if (a.groups?.length) parts.push(`${a.groups.length} group${a.groups.length > 1 ? "s" : ""}`);
    if (a.tags?.length) parts.push(`${a.tags.length} tag${a.tags.length > 1 ? "s" : ""}`);
    if (a.contacts?.length) parts.push(`${a.contacts.length} contact${a.contacts.length > 1 ? "s" : ""}`);
    if (a.excludedContacts?.length) parts.push(`${a.excludedContacts.length} excluded`);
    return parts.length ? parts.join(" · ") : "No audience";
};

const isDevCampaign = (c: Campaign) =>
    typeof c.template === "object" &&
    !!c.template &&
    (c.template as Template & { devMode?: boolean }).devMode;

const CampaignsPage: React.FC = () => {
    const [mode, setMode] = useState<"normal" | "dev">("normal");
    const [tab, setTab] = useState<CampaignStatus | "all">("all");
    const { data: campaigns, isLoading, refetch } = useCampaigns(
        tab === "all" ? undefined : tab,
    );

    // Normal tab = non-dev-template campaigns (unchanged behaviour);
    // Dev tab = dev-template campaigns with run/pause/cancel controls.
    const visible = (campaigns || []).filter((c) =>
        mode === "dev" ? isDevCampaign(c) : !isDevCampaign(c),
    );

    const [createOpen, setCreateOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<Campaign | null>(null);
    const [detailId, setDetailId] = useState<string | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Campaign | null>(null);

    const deleteCampaign = useDeleteCampaign();
    const start = useCampaignAction("start");
    const pause = useCampaignAction("pause");
    const resume = useCampaignAction("resume");
    const cancel = useCampaignAction("cancel");

    const runAction = (
        action: "start" | "pause" | "resume" | "cancel",
        id: string,
        successMsg: string,
    ) => {
        const m = { start, pause, resume, cancel }[action];
        m.mutate(id, {
            onSuccess: () => {
                toast.success(successMsg);
                refetch();
            },
            onError: (err: any) =>
                toast.error(err?.response?.data?.message || "Action failed"),
        });
    };

    const templateName = (c: Campaign) =>
        typeof c.template === "object" && c.template ? c.template.name : "—";

    return (
        <MainLayout>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Campaigns</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Send bulk WhatsApp messages using templates and audiences
                    </p>
                </div>
                <PrimaryButton onClick={() => setCreateOpen(true)}>
                    <PlusOutlined /> New Campaign
                </PrimaryButton>
            </div>

            {/* Mode tabs — Normal (unchanged) vs Dev (API-gated dev templates) */}
            <div className="mb-3 flex w-fit flex-wrap gap-1 rounded-2xl bg-gray-100 p-1">
                {([
                    ["normal", "Normal"],
                    ["dev", "Dev"],
                ] as const).map(([val, label]) => (
                    <button
                        key={val}
                        onClick={() => setMode(val)}
                        className={`rounded-xl px-5 py-1.5 text-sm font-semibold transition ${
                            mode === val
                                ? "bg-emerald-600 text-white shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        {label}
                        {val === "dev" && (
                            <span className="ml-1.5 rounded-full bg-amber-200/80 px-1.5 text-[10px] font-bold text-amber-800">
                                {campaigns?.filter(isDevCampaign).length ?? 0}
                            </span>
                        )}
                    </button>
                ))}
            </div>
            {mode === "dev" && (
                <p className="mb-3 text-[11px] text-gray-400">
                    Dev campaigns gate their template's API access — a template's API
                    sends work only while one of its campaigns is running. Paused =
                    API blocked, cancelled/removed = API blocked.
                </p>
            )}

            {/* Status tabs */}
            <div className="mb-4 flex flex-wrap gap-1 rounded-2xl bg-gray-100 p-1 sm:w-fit">
                {STATUS_TABS.map((t) => (
                    <button
                        key={t.value}
                        onClick={() => setTab(t.value)}
                        className={`rounded-xl px-4 py-1.5 text-sm font-medium transition ${
                            tab === t.value
                                ? "bg-white text-emerald-600 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <CenteredSpinner label="Loading campaigns…" />
            ) : !visible.length ? (
                <EmptyState
                    icon={<SendOutlined />}
                    title={mode === "dev" ? "No dev campaigns yet" : "No campaigns yet"}
                    description={
                        mode === "dev"
                            ? "Create a campaign with a dev template to enable its API sends (Postman / other apps)."
                            : "Create a campaign to send a template to a group, tag or selected contacts."
                    }
                    action={
                        <PrimaryButton onClick={() => setCreateOpen(true)}>
                            <PlusOutlined /> Create your first campaign
                        </PrimaryButton>
                    }
                />
            ) : (
                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px] text-left">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/60 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                                    <th className="px-4 py-3">Campaign</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Audience</th>
                                    <th className="px-4 py-3">Sent</th>
                                    <th className="px-4 py-3">Scheduled</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visible.map((c) => (
                                    <tr
                                        key={c._id}
                                        className="border-b border-gray-50 transition hover:bg-gray-50/60"
                                    >
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => setDetailId(c._id)}
                                                className="text-left"
                                            >
                                                <p className="text-sm font-medium text-gray-900 hover:text-emerald-600">
                                                    {c.name}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {templateName(c)}
                                                </p>
                                            </button>
                                        </td>
                                        <td className="px-4 py-3">
                                            <CampaignStatusBadge status={c.status} />
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-600">
                                            {audienceSummary(c)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm font-semibold text-gray-800">
                                                {c.statistics?.sent ?? 0}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {" "}/ {c.statistics?.total ?? 0}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-400">
                                            {c.scheduledAt
                                                ? fmtDateTime(c.scheduledAt)
                                                : fmtDateTime(c.startedAt)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => setDetailId(c._id)}
                                                    title="View"
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-emerald-50 hover:text-emerald-600"
                                                >
                                                    <EyeOutlined />
                                                </button>
                                                {c.status === "draft" && (
                                                    <button
                                                        onClick={() =>
                                                            runAction(
                                                                "start",
                                                                c._id,
                                                                "Campaign started",
                                                            )
                                                        }
                                                        title="Start"
                                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-emerald-50 hover:text-emerald-600"
                                                    >
                                                        <CaretRightOutlined />
                                                    </button>
                                                )}
                                                {(c.status === "draft" || c.status === "scheduled") && (
                                                    <button
                                                        onClick={() => setEditTarget(c)}
                                                        title="Edit"
                                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                                                    >
                                                        <EditOutlined />
                                                    </button>
                                                )}
                                                {/* Dev tab — direct run / pause / cancel controls */}
                                                {mode === "dev" &&
                                                    c.status === "running" && (
                                                        <button
                                                            onClick={() =>
                                                                runAction(
                                                                    "pause",
                                                                    c._id,
                                                                    "Campaign paused",
                                                                )
                                                            }
                                                            title="Pause"
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-amber-50 hover:text-amber-600"
                                                        >
                                                            <PauseOutlined />
                                                        </button>
                                                    )}
                                                {mode === "dev" &&
                                                    c.status === "paused" && (
                                                        <button
                                                            onClick={() =>
                                                                runAction(
                                                                    "resume",
                                                                    c._id,
                                                                    "Campaign resumed",
                                                                )
                                                            }
                                                            title="Resume"
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-emerald-50 hover:text-emerald-600"
                                                        >
                                                            <CaretRightOutlined />
                                                        </button>
                                                    )}
                                                {mode === "dev" &&
                                                    [
                                                        "draft",
                                                        "scheduled",
                                                        "queued",
                                                        "running",
                                                        "paused",
                                                    ].includes(c.status) && (
                                                        <button
                                                            onClick={() =>
                                                                runAction(
                                                                    "cancel",
                                                                    c._id,
                                                                    "Campaign cancelled",
                                                                )
                                                            }
                                                            title="Cancel"
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                                                        >
                                                            <CloseCircleOutlined />
                                                        </button>
                                                    )}
                                                {(c.status === "draft" ||
                                                    c.status === "cancelled") && (
                                                    <button
                                                        onClick={() => setDeleteTarget(c)}
                                                        title="Delete"
                                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                                                    >
                                                        <DeleteOutlined />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Create / edit modal — template list follows the active tab */}
            <CampaignFormModal
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                editing={null}
                mode={mode}
            />
            <CampaignFormModal
                open={!!editTarget}
                onClose={() => setEditTarget(null)}
                editing={editTarget}
                mode={mode}
            />

            {/* Delete confirm */}
            <Modal
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                title="Delete campaign"
                footer={
                    <>
                        <SecondaryButton onClick={() => setDeleteTarget(null)}>
                            Cancel
                        </SecondaryButton>
                        <DangerButton
                            onClick={() =>
                                deleteCampaign.mutate(deleteTarget!._id, {
                                    onSuccess: () => {
                                        toast.success("Campaign deleted");
                                        setDeleteTarget(null);
                                    },
                                    onError: (err: any) =>
                                        toast.error(
                                            err?.response?.data?.message || "Delete failed",
                                        ),
                                })
                            }
                            disabled={deleteCampaign.isPending}
                        >
                            {deleteCampaign.isPending ? <Spinner /> : <DeleteOutlined />} Delete
                        </DangerButton>
                    </>
                }
            >
                <p className="text-sm text-gray-600">
                    Delete campaign <strong>{deleteTarget?.name}</strong>? Only drafts and
                    cancelled campaigns can be deleted.
                </p>
            </Modal>

            {/* Detail drawer */}
            {detailId && <CampaignDrawer id={detailId} onClose={() => setDetailId(null)} />}
        </MainLayout>
    );
};

// ------------------------------------------------------------ Form modal

const templateIdOf = (t: Campaign["template"] | undefined) =>
    typeof t === "object" && t ? t._id : ((t as string) || "");

const categoryDot = (cat: string) => {
    const palette = [
        "bg-purple-500",
        "bg-blue-500",
        "bg-emerald-500",
        "bg-amber-500",
        "bg-rose-500",
        "bg-indigo-500",
        "bg-cyan-500",
    ];
    let h = 0;
    for (let i = 0; i < cat.length; i++) h = (h * 31 + cat.charCodeAt(i)) >>> 0;
    return palette[h % palette.length];
};

// ------------------------------------------------------- Template picker

const TemplatePicker: React.FC<{
    templates: Template[];
    value: string;
    onChange: (id: string) => void;
}> = ({ templates, value, onChange }) => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const onDoc = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("mousedown", onDoc);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDoc);
            document.removeEventListener("keydown", onKey);
        };
    }, []);

    const selected = templates.find((t) => t._id === value);
    const q = query.trim().toLowerCase();
    const filtered = (templates || []).filter(
        (t) =>
            !q ||
            t.name.toLowerCase().includes(q) ||
            t.category.toLowerCase().includes(q),
    );

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => {
                    setOpen((v) => !v);
                    setQuery("");
                }}
                className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-sm transition ${
                    open
                        ? "border-emerald-400 ring-2 ring-emerald-100"
                        : "border-gray-200 hover:border-gray-300"
                }`}
            >
                {selected ? (
                    <span className="flex min-w-0 items-center gap-2">
                        <span
                            className={`h-2 w-2 shrink-0 rounded-full ${categoryDot(
                                selected.category,
                            )}`}
                        />
                        <span className="truncate font-medium text-gray-800">
                            {selected.name}
                        </span>
                        <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
                            {selected.category}
                        </span>
                        <span className="shrink-0 text-[10px] text-gray-400">
                            {selected.variables?.length || 0} var
                            {selected.variables?.length === 1 ? "" : "s"}
                        </span>
                    </span>
                ) : (
                    <span className="flex items-center gap-2 text-gray-400">
                        <FileTextOutlined className="text-sm" />
                        Select a template…
                    </span>
                )}
                <DownOutlined
                    className={`shrink-0 text-xs text-gray-400 transition-transform ${
                        open ? "rotate-180" : ""
                    }`}
                />
            </button>

            {open && (
                <div className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
                    <div className="border-b border-gray-100 p-2">
                        <div className="relative">
                            <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400" />
                            <input
                                autoFocus
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search templates…"
                                className="w-full rounded-lg border border-gray-100 bg-gray-50 py-1.5 pl-8 pr-3 text-sm outline-none focus:border-emerald-300 focus:bg-white"
                            />
                        </div>
                    </div>
                    <div className="max-h-56 overflow-y-auto p-1.5">
                        {filtered.length ? (
                            filtered.map((t) => {
                                const active = t._id === value;
                                return (
                                    <button
                                        key={t._id}
                                        type="button"
                                        onClick={() => {
                                            onChange(t._id);
                                            setOpen(false);
                                        }}
                                        className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition ${
                                            active
                                                ? "bg-emerald-50"
                                                : "hover:bg-gray-50"
                                        }`}
                                    >
                                        <span
                                            className={`h-2 w-2 shrink-0 rounded-full ${categoryDot(
                                                t.category,
                                            )}`}
                                        />
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-sm font-medium text-gray-800">
                                                {t.name}
                                                {t.devMode && (
                                                    <span className="ml-1.5 inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-700">
                                                        <SettingOutlined /> Dev
                                                    </span>
                                                )}
                                            </span>
                                            <span className="block truncate text-[11px] text-gray-400">
                                                {t.category} ·{" "}
                                                {t.variables?.length || 0} variable
                                                {t.variables?.length === 1 ? "" : "s"}
                                                {t.devMode
                                                    ? ` · ${t.inCampaignCount || 0} campaign${(t.inCampaignCount || 0) === 1 ? "" : "s"} linked`
                                                    : ""}
                                            </span>
                                        </span>
                                        {active && (
                                            <CheckOutlined className="shrink-0 text-sm text-emerald-600" />
                                        )}
                                    </button>
                                );
                            })
                        ) : (
                            <p className="p-3 text-center text-xs text-gray-400">
                                No templates match “{query}”.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// -------------------------------------------------------- Campaign form

const CampaignFormModal: React.FC<{
    open: boolean;
    onClose: () => void;
    editing: Campaign | null;
    mode: "normal" | "dev";
}> = ({ open, onClose, editing, mode }) => {
    const createCampaign = useCreateCampaign();
    const updateCampaign = useUpdateCampaign();

    const { data: templates } = useTemplates({ status: "active" });
    // Normal tab -> only normal templates, Dev tab -> only dev templates
    const pickerTemplates = (templates || []).filter((t) =>
        mode === "dev" ? !!t.devMode : !t.devMode,
    );
    const { data: groups } = useContactGroups();

    const [form, setForm] = useState({
        name: "",
        template: "",
        groups: [] as string[],
        contacts: [] as string[],
        scheduledAt: "",
        sendLimit: "",
    });

    const [contactSearch, setContactSearch] = useState("");
    const { data: contactsData } = useContacts({
        page: 1,
        limit: 100,
        search: contactSearch.trim() || undefined,
    });
    const allContacts = contactsData?.data || [];

    useEffect(() => {
        if (open) {
            const a: CampaignAudience = editing?.audience ?? {
                groups: [],
                tags: [],
                contacts: [],
                excludedContacts: [],
            };
            setForm({
                name: editing?.name || "",
                template: templateIdOf(editing?.template),
                groups: (a.groups || []).map(String),
                contacts: (a.contacts || []).map(String),
                scheduledAt: editing?.scheduledAt || "",
                sendLimit: editing?.sendLimit ? String(editing.sendLimit) : "",
            });
            setContactSearch("");
        }
    }, [open, editing]);

    const toggle = (key: "groups" | "contacts", id: string) => {
        setForm((f) => ({
            ...f,
            [key]: f[key].includes(id)
                ? f[key].filter((x) => x !== id)
                : [...f[key], id],
        }));
    };

    const submit = () => {
        if (!form.name.trim()) {
            toast.error("Campaign name is required");
            return;
        }
        if (!form.template) {
            toast.error("Select a template");
            return;
        }
        if (!form.groups.length && !form.contacts.length) {
            toast.error("Select at least one group or contact for the audience");
            return;
        }
        if (form.scheduledAt && !dayjs(form.scheduledAt).isValid()) {
            toast.error("Please pick a valid schedule date & time");
            return;
        }
        if (
            form.scheduledAt &&
            dayjs(form.scheduledAt).isBefore(dayjs().add(1, "minute"))
        ) {
            toast.error("Schedule must be at least 1 minute in the future");
            return;
        }
        const payload = {
            name: form.name.trim(),
            template: form.template,
            audience: {
                groups: form.groups,
                tags: [],
                contacts: form.contacts,
                excludedContacts: [],
            },
            scheduledAt: form.scheduledAt || null,
            sendLimit: form.sendLimit
                ? Math.max(1, parseInt(form.sendLimit, 10))
                : null,
        };
        if (editing) {
            updateCampaign.mutate(
                { id: editing._id, input: payload },
                {
                    onSuccess: () => {
                        toast.success("Campaign updated");
                        onClose();
                    },
                    onError: (err: any) =>
                        toast.error(err?.response?.data?.message || "Update failed"),
                },
            );
        } else {
            createCampaign.mutate(payload, {
                onSuccess: () => {
                    toast.success("Campaign created");
                    onClose();
                },
                onError: (err: any) =>
                    toast.error(err?.response?.data?.message || "Create failed"),
            });
        }
    };

    const pending = createCampaign.isPending || updateCampaign.isPending;

    const chipBtn = (on: boolean) =>
        `rounded-full px-2.5 py-1 text-xs font-medium transition ${
            on
                ? "bg-emerald-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`;

    // Reach summary: group members (union) + extra specific contacts
    const groupMemberIds = useMemo(() => {
        const ids = new Set<string>();
        for (const g of groups || []) {
            if (form.groups.includes(g._id)) {
                for (const c of g.contacts || []) ids.add(c._id);
            }
        }
        return ids;
    }, [groups, form.groups]);
    const extraSpecific = form.contacts.filter(
        (id) => !groupMemberIds.has(id),
    ).length;
    const reachTotal = groupMemberIds.size + extraSpecific;
    const repeatCount = form.sendLimit
        ? Math.max(1, parseInt(form.sendLimit, 10))
        : 1;
    const totalMessages = reachTotal * repeatCount;

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={editing ? "Edit campaign" : "New campaign"}
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
                <Field label="Campaign name" required>
                    <input
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g. Festive Offer Blast"
                        className={inputCls}
                    />
                </Field>

                <Field label="Template" required>
                    <TemplatePicker
                        templates={pickerTemplates}
                        value={form.template}
                        onChange={(id) => setForm({ ...form, template: id })}
                    />
                    <p className="mt-1.5 text-[11px] leading-relaxed text-gray-400">
                        Dev templates are only usable via API after being linked to a
                        campaign — creating this campaign activates it.
                    </p>
                </Field>

                <Field label="Groups">
                    <div className="flex max-h-28 flex-wrap gap-1.5 overflow-y-auto rounded-xl border border-gray-200 p-2">
                        {(groups || []).map((g) => (
                            <button
                                key={g._id}
                                type="button"
                                onClick={() => toggle("groups", g._id)}
                                className={chipBtn(form.groups.includes(g._id))}
                            >
                                {g.name}
                            </button>
                        ))}
                        {!groups?.length && (
                            <p className="text-xs text-gray-400">No groups yet.</p>
                        )}
                    </div>
                </Field>

                <Field
                    label="Specific contacts"
                    hint="Group members ke alawa extra contacts yahan se add karein — dono bheje jayenge"
                >
                    <div className="rounded-xl border border-gray-200">
                        <div className="relative border-b border-gray-100 p-2">
                            <SearchOutlined className="absolute left-5 top-1/2 -translate-y-1/2 text-sm text-gray-400" />
                            <input
                                value={contactSearch}
                                onChange={(e) => setContactSearch(e.target.value)}
                                placeholder="Search contacts to include…"
                                className="w-full rounded-lg pl-8 pr-2 py-1.5 text-sm outline-none placeholder:text-gray-400"
                            />
                        </div>
                        <div className="flex max-h-36 flex-wrap gap-1.5 overflow-y-auto p-2">
                            {(allContacts || []).slice(0, 30).map((c) => (
                                <button
                                    key={c._id}
                                    type="button"
                                    onClick={() => toggle("contacts", c._id)}
                                    className={chipBtn(form.contacts.includes(c._id))}
                                >
                                    {c.name || fmtPhone(c.phoneNumber)}
                                </button>
                            ))}
                            {!allContacts?.length && (
                                <p className="p-2 text-xs text-gray-400">
                                    No contacts found{contactSearch ? " for that search" : ""}.
                                </p>
                            )}
                        </div>
                    </div>
                </Field>

                {(groupMemberIds.size > 0 || form.contacts.length > 0) && (
                    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-2.5">
                        <span className="text-xs font-semibold text-emerald-700">
                            ≈ {totalMessages.toLocaleString()} message
                            {totalMessages === 1 ? "" : "s"}
                        </span>
                        {groupMemberIds.size > 0 && (
                            <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-emerald-600 shadow-sm">
                                {groupMemberIds.size.toLocaleString()} group member
                                {groupMemberIds.size === 1 ? "" : "s"}
                            </span>
                        )}
                        {extraSpecific > 0 && (
                            <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-emerald-600 shadow-sm">
                                {extraSpecific.toLocaleString()} specific
                            </span>
                        )}
                        {repeatCount > 1 && (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                                har contact ko {repeatCount} baar
                            </span>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field
                        label="Har contact ko kitni baar bhejna hai"
                        hint="1 = har contact ko 1 baar. 10 = har contact ko 10 baar"
                    >
                        <input
                            type="number"
                            min={1}
                            value={form.sendLimit}
                            onChange={(e) =>
                                setForm({ ...form, sendLimit: e.target.value })
                            }
                            placeholder="e.g. 2"
                            className={inputCls}
                        />
                    </Field>
                    <Field
                        label="Schedule (optional)"
                        hint="Past blocked — minimum 1 minute aage. Empty = baad me manually start"
                    >
                        <DatePicker
                            showTime
                            needConfirm={false}
                            value={form.scheduledAt ? dayjs(form.scheduledAt) : null}
                            onChange={(d) =>
                                setForm({
                                    ...form,
                                    scheduledAt: d ? d.toISOString() : "",
                                })
                            }
                            disabledDate={(current) =>
                                !!current &&
                                current.isBefore(dayjs().startOf("day"))
                            }
                            disabledTime={(current) => {
                                if (
                                    !current ||
                                    !current.isSame(dayjs(), "day")
                                ) {
                                    return {};
                                }
                                const earliest = dayjs().add(1, "minute");
                                return {
                                    disabledHours: () =>
                                        Array.from(
                                            { length: earliest.hour() },
                                            (_, i) => i,
                                        ),
                                    disabledMinutes: (hour: number) =>
                                        hour === earliest.hour()
                                            ? Array.from(
                                                  {
                                                      length: earliest.minute(),
                                                  },
                                                  (_, i) => i,
                                              )
                                            : [],
                                    disabledSeconds: () =>
                                        Array.from(
                                            { length: 60 },
                                            (_, i) => i,
                                        ),
                                };
                            }}
                            placeholder="Pick date & time…"
                            className="w-full"
                        />
                    </Field>
                </div>
            </div>
        </Modal>
    );
};

// ------------------------------------------------------------- Detail drawer

const CampaignDrawer: React.FC<{ id: string; onClose: () => void }> = ({ id, onClose }) => {
    const { data: campaigns } = useCampaigns();
    const { data: groups } = useContactGroups();
    const { data: tags } = useTags();
    const campaign = campaigns?.find((c) => c._id === id);

    const { data: stats } = useCampaignStats(id);
    const { data: audience } = useCampaignAudience(id);
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState("");
    const [previewContactId, setPreviewContactId] = useState("");
    const [previewRendered, setPreviewRendered] = useState<string | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [numSearch, setNumSearch] = useState("");
    const unschedule = useUnscheduleCampaign();
    const cancelMsg = useCancelMessage();
    const { data: recipientsData, isFetching: fetchingRecipients } = useCampaignRecipients(
        id,
        { page, limit: 20, status: statusFilter || undefined },
    );

    const start = useCampaignAction("start");
    const pause = useCampaignAction("pause");
    const resume = useCampaignAction("resume");
    const cancel = useCampaignAction("cancel");

    useEffect(() => {
        setPage(1);
        setStatusFilter("");
        setPreviewContactId("");
        setPreviewRendered(null);
    }, [id]);

    const doPreview = async () => {
        if (!previewContactId) return;
        setPreviewLoading(true);
        try {
            const res = await previewCampaignMessage(id, {
                contactId: previewContactId,
            });
            setPreviewRendered(res.rendered);
        } catch (e: any) {
            toast.error(e?.response?.data?.message || "Preview failed");
        } finally {
            setPreviewLoading(false);
        }
    };

    if (!campaign) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <CenteredSpinner label="Loading campaign…" />
            </div>
        );
    }

    const templateName =
        typeof campaign.template === "object" && campaign.template
            ? campaign.template.name
            : "—";

    const groupName = (id: string) =>
        groups?.find((g) => g._id === id)?.name || "(group)";
    const tagName = (id: string) =>
        tags?.find((t) => t._id === id)?.name || "(tag)";
    const contactLabel = (id: string) =>
        audience?.contacts?.find((c) => c._id === id)?.name || "(contact)";

    const isDev = !!campaign.devTemplate;
    const byStatus = stats?.byStatus || {};
    const ds = stats?.devStats;
    const statCards: { label: string; value: number; color: string }[] = isDev
        ? [
              { label: "API Calls", value: ds?.apiCalls ?? 0, color: "text-violet-600" },
              { label: "Sent", value: ds?.sent ?? 0, color: "text-blue-600" },
              { label: "Failed", value: ds?.failed ?? 0, color: "text-red-600" },
              { label: "In Pipeline", value: ds?.queued ?? 0, color: "text-amber-600" },
              { label: "Numbers", value: ds?.uniqueNumbers ?? 0, color: "text-teal-600" },
          ]
        : [
              {
                  label: "Total",
                  value: Object.values(byStatus).reduce((a, b) => a + b, 0),
                  color: "text-gray-800",
              },
              { label: "Sent", value: byStatus.sent ?? 0, color: "text-blue-600" },
              { label: "Delivered", value: byStatus.delivered ?? 0, color: "text-emerald-600" },
              { label: "Read", value: byStatus.read ?? 0, color: "text-emerald-600" },
              { label: "Failed", value: byStatus.failed ?? 0, color: "text-red-600" },
              { label: "Skipped", value: byStatus.skipped ?? 0, color: "text-gray-500" },
          ];

    const liveSinceLabel = (() => {
        if (!isDev) return null;
        const t = ds?.liveSince ? new Date(ds.liveSince).getTime() : null;
        if (!t) return "—";
        const mins = Math.max(0, Math.floor((Date.now() - t) / 60000));
        if (mins < 60) return `${mins} min`;
        const hrs = Math.floor(mins / 60);
        return `${hrs}h ${mins % 60}m`;
    })();

    const numbers = (ds?.perNumber || []).filter((n) =>
        numSearch.trim()
            ? String(n.number).includes(numSearch.trim())
            : true,
    );

    const action = (
        label: string,
        icon: React.ReactNode,
        fn: () => void,
        pending: boolean,
        cls: string,
    ) => (
        <button
            onClick={fn}
            disabled={pending}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition disabled:opacity-60 ${cls}`}
        >
            {pending ? <Spinner /> : icon} {label}
        </button>
    );

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
            <div className="absolute inset-0" onClick={onClose} />
            <div className="relative flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-lg text-emerald-600">
                                <SendOutlined />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    {campaign.name}
                                </h2>
                                <p className="text-xs text-gray-400">
                                    Template: {templateName}
                                </p>
                            </div>
                        </div>
                        <div className="mt-2">
                            <CampaignStatusBadge status={campaign.status} />
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 transition hover:bg-gray-100"
                    >
                        ✕
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5">
                    {/* Lifecycle actions */}
                    {(campaign.status === "draft" ||
                        campaign.status === "scheduled" ||
                        campaign.status === "queued" ||
                        campaign.status === "running" ||
                        campaign.status === "paused") && (
                        <div className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-gray-100 bg-gray-50/60 p-3">
                            {(campaign.status === "draft" ||
                                campaign.status === "scheduled") && (
                                <>
                                    {action(
                                        "Start",
                                        <CaretRightOutlined />,
                                        () =>
                                            start.mutate(id, {
                                                onSuccess: () => toast.success("Campaign started"),
                                                onError: (e: any) =>
                                                    toast.error(
                                                        e?.response?.data?.message || "Failed",
                                                    ),
                                            }),
                                        start.isPending,
                                        "bg-emerald-600 text-white hover:bg-emerald-700",
                                    )}
                                    {campaign.status === "scheduled" &&
                                        action(
                                            "Pause",
                                            <PauseOutlined />,
                                            () =>
                                                pause.mutate(id, {
                                                    onSuccess: () => toast.success("Campaign paused"),
                                                    onError: (e: any) =>
                                                        toast.error(
                                                            e?.response?.data?.message || "Failed",
                                                        ),
                                                }),
                                            pause.isPending,
                                            "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50",
                                        )}
                                </>
                            )}
                            {campaign.status === "queued" &&
                                action(
                                    "Pause",
                                    <PauseOutlined />,
                                    () =>
                                        pause.mutate(id, {
                                            onSuccess: () => toast.success("Campaign paused"),
                                            onError: (e: any) =>
                                                toast.error(
                                                    e?.response?.data?.message || "Failed",
                                                ),
                                        }),
                                    pause.isPending,
                                    "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50",
                                )}
                            {campaign.status === "running" &&
                                action(
                                    "Pause",
                                    <PauseOutlined />,
                                    () =>
                                        pause.mutate(id, {
                                            onSuccess: () => toast.success("Campaign paused"),
                                            onError: (e: any) =>
                                                toast.error(
                                                    e?.response?.data?.message || "Failed",
                                                ),
                                        }),
                                    pause.isPending,
                                    "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50",
                                )}
                            {campaign.status === "paused" &&
                                action(
                                    "Resume",
                                    <UndoOutlined />,
                                    () =>
                                        resume.mutate(id, {
                                            onSuccess: () => toast.success("Campaign resumed"),
                                            onError: (e: any) =>
                                                toast.error(
                                                    e?.response?.data?.message || "Failed",
                                                ),
                                        }),
                                    resume.isPending,
                                    "bg-emerald-600 text-white hover:bg-emerald-700",
                                )}
                            {(campaign.status === "queued" ||
                                campaign.status === "running" ||
                                campaign.status === "paused" ||
                                campaign.status === "scheduled") &&
                                action(
                                    "Cancel",
                                    <CloseCircleOutlined />,
                                    () =>
                                        cancel.mutate(id, {
                                            onSuccess: () => toast.success("Campaign cancelled"),
                                            onError: (e: any) =>
                                                toast.error(
                                                    e?.response?.data?.message || "Failed",
                                                ),
                                        }),
                                    cancel.isPending,
                                    "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100",
                                )}
                        </div>
                    )}

                    {/* Audience */}
                    <div className="mb-6 rounded-2xl border border-gray-100 p-4">
                        <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
                            <TeamOutlined /> Audience
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {(campaign.audience?.groups || []).map((g) => (
                                <GrayBadge key={String(g)}>{groupName(String(g))}</GrayBadge>
                            ))}
                            {(campaign.audience?.tags || []).map((t) => (
                                <GreenBadge key={String(t)}>{tagName(String(t))}</GreenBadge>
                            ))}
                            {(campaign.audience?.contacts || []).map((c) => (
                                <BlueBadge key={String(c)}>{contactLabel(String(c))}</BlueBadge>
                            ))}
                            {!campaign.audience?.groups?.length &&
                                !campaign.audience?.tags?.length &&
                                !campaign.audience?.contacts?.length && (
                                    <p className="text-xs text-gray-400">No audience selected.</p>
                                )}
                        </div>
                        {audience && (
                            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                                <GrayBadge>
                                    {audience.total.toLocaleString()} message
                                    {audience.total === 1 ? "" : "s"}
                                </GrayBadge>
                                <GrayBadge>
                                    {audience.people ??
                                        (audience.contacts || []).length}{" "}
                                    person
                                    {(audience.people ?? (audience.contacts || []).length) ===
                                    1
                                        ? ""
                                        : "s"}
                                </GrayBadge>
                                {(audience.sendsPerContact ?? 1) > 1 && (
                                    <GrayBadge>
                                        {audience.sendsPerContact} bar per contact
                                    </GrayBadge>
                                )}
                                {audience.excluded > 0 && (
                                    <RedBadge>{audience.excluded} excluded</RedBadge>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Message preview — hidden for dev campaigns (they never
                        send to an audience, only keep the template LIVE) */}
                    {!isDev && (
                        <div className="mb-6 rounded-2xl border border-gray-100 p-4">
                            <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                <SendOutlined /> Message preview
                            </p>
                            <div className="flex flex-wrap items-center gap-2">
                                <select
                                    value={previewContactId}
                                    onChange={(e) => {
                                        setPreviewContactId(e.target.value);
                                        setPreviewRendered(null);
                                    }}
                                    className={`${selectCls} min-w-[220px] flex-1 px-3 py-2 text-xs`}
                                >
                                    <option value="">Pick a contact from audience…</option>
                                    {(audience?.contacts || []).map((c) => (
                                        <option key={c._id} value={c._id}>
                                            {c.name || fmtPhone(c.phoneNumber)} · {fmtPhone(c.phoneNumber)}
                                        </option>
                                    ))}
                                </select>
                                <PrimaryButton
                                    onClick={doPreview}
                                    disabled={!previewContactId || previewLoading}
                                    className="px-4 py-2 text-xs"
                                >
                                    {previewLoading ? <Spinner /> : <EyeOutlined />} Preview
                                </PrimaryButton>
                            </div>
                            {previewRendered && (
                                <div className="mt-3 max-w-md rounded-2xl rounded-tl-sm bg-emerald-500 px-4 py-3 text-sm text-white shadow-sm">
                                    <p className="whitespace-pre-wrap">{previewRendered}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Stats */}
                    <div className="mb-6">
                        <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
                            <BarChartOutlined /> Statistics
                        </p>
                        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                            {statCards.map((s) => (
                                <div
                                    key={s.label}
                                    className="rounded-2xl border border-gray-100 p-3 text-center"
                                >
                                    <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                                    <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                                        {s.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Dev campaign — live status + no recipients (never sends) */}
                    {isDev && (
                        <div
                            className={`mb-6 rounded-2xl border p-4 ${
                                campaign.status === "running"
                                    ? "border-emerald-200 bg-emerald-50"
                                    : campaign.status === "paused"
                                      ? "border-amber-200 bg-amber-50"
                                      : campaign.status === "scheduled"
                                        ? "border-blue-200 bg-blue-50"
                                        : "border-gray-200 bg-gray-50"
                            }`}
                        >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p
                                        className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide ${
                                            campaign.status === "running"
                                                ? "text-emerald-700"
                                                : campaign.status === "paused"
                                                  ? "text-amber-700"
                                                  : campaign.status === "scheduled"
                                                    ? "text-blue-700"
                                                    : "text-gray-500"
                                        }`}
                                    >
                                        <ThunderboltOutlined />{" "}
                                        {campaign.status === "running"
                                            ? "LIVE — API calls active"
                                            : campaign.status === "paused"
                                              ? "PAUSED — API calls blocked"
                                              : campaign.status === "scheduled"
                                                ? "SCHEDULED — will go live automatically"
                                                : "NOT LIVE — API calls blocked"}
                                    </p>
                                    <p className="mt-1.5 text-[11px] leading-relaxed text-gray-500">
                                        {campaign.status === "running"
                                            ? "Template is LIVE — third-party apps (Postman, websites) can hit the API. Pause to block, cancel to switch off."
                                            : campaign.status === "paused"
                                              ? "Template is blocked — API calls fail with a paused error. Calls so far are kept below. Resume to go live again."
                                              : campaign.status === "scheduled"
                                                ? `Will go LIVE automatically at ${fmtDateTime(ds?.scheduledAt)} — until then API calls are blocked. Start now or cancel the schedule.`
                                                : "Template is blocked — create/run this dev campaign to enable API calls."}
                                    </p>
                                </div>
                                {campaign.status === "scheduled" && (
                                    <button
                                        onClick={() =>
                                            unschedule.mutate(id, {
                                                onSuccess: () =>
                                                    toast.success("Schedule cancelled — back to draft"),
                                                onError: (e: any) =>
                                                    toast.error(
                                                        e?.response?.data?.message || "Failed",
                                                    ),
                                            })
                                        }
                                        disabled={unschedule.isPending}
                                        className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-blue-700 shadow-sm ring-1 ring-blue-200 transition hover:bg-blue-50 disabled:opacity-60"
                                    >
                                        {unschedule.isPending ? (
                                            <Spinner />
                                        ) : (
                                            <CloseCircleOutlined />
                                        )}{" "}
                                        Cancel schedule
                                    </button>
                                )}
                            </div>
                            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                                {[
                                    ["Live for", liveSinceLabel],
                                    ["API calls", String(ds?.apiCalls ?? 0)],
                                    ["Sent", String(ds?.sent ?? 0)],
                                    ["Failed", String(ds?.failed ?? 0)],
                                    [
                                        "In pipeline",
                                        String(ds?.queued ?? 0),
                                    ],
                                ].map(([lbl, val]) => (
                                    <div
                                        key={lbl}
                                        className="rounded-xl bg-white/70 px-3 py-2 text-center"
                                    >
                                        <p className="text-sm font-bold text-gray-800">{val}</p>
                                        <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-400">
                                            {lbl}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Dev campaign — called numbers (API targets) */}
                    {isDev ? (
                        <>
                        <div className="mb-6 rounded-2xl border border-gray-100 p-4">
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                    <TeamOutlined /> Called numbers ({ds?.uniqueNumbers ?? 0})
                                </p>
                                <div className="relative">
                                    <SearchOutlined className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400" />
                                    <input
                                        value={numSearch}
                                        onChange={(e) => setNumSearch(e.target.value)}
                                        placeholder="Search number…"
                                        className={`${inputCls} w-44 pl-8 py-1.5 text-xs`}
                                    />
                                </div>
                            </div>
                            {!ds?.perNumber?.length ? (
                                <p className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-xs text-gray-400">
                                    No API calls yet — jab koi number hit karega, yahan
                                    number-wise detail dikhegi (kitni baar, sent/failed).
                                </p>
                            ) : numbers.length === 0 ? (
                                <p className="rounded-xl border border-dashed border-gray-200 p-4 text-center text-xs text-gray-400">
                                    No numbers match "{numSearch}".
                                </p>
                            ) : (
                                <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                                    {numbers.map((n) => (
                                        <div
                                            key={n.number}
                                            className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/40 px-3 py-2"
                                        >
                                            <div className="flex min-w-0 items-center gap-2.5">
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">
                                                    {String(n.number).slice(-4)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-semibold text-gray-800">
                                                        {fmtPhone(n.number)}
                                                    </p>
                                                    <p className="text-[10px] text-gray-400">
                                                        {n.count} call{n.count === 1 ? "" : "s"}
                                                        {n.lastSentAt
                                                            ? ` · last ${fmtDateTime(n.lastSentAt)}`
                                                            : ""}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
                                                {n.sent > 0 && (
                                                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                                                        {n.sent} sent
                                                    </span>
                                                )}
                                                {n.queued > 0 && (
                                                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600">
                                                        {n.queued} in pipeline
                                                    </span>
                                                )}
                                                {n.failed > 0 && (
                                                    <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600">
                                                        {n.failed} failed
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Pipeline — in-flight messages (queued / sending / scheduled) */}
                        <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-4">
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-600">
                                    <SendOutlined /> In pipeline ({(ds?.pipeline?.length || 0)})
                                </p>
                                <p className="text-[10px] text-gray-400">
                                    Auto-refreshes every 5s — sent hone par yahan se hat jata hai
                                </p>
                            </div>
                            {!ds?.pipeline?.length ? (
                                <p className="rounded-xl border border-dashed border-amber-200 p-5 text-center text-xs text-gray-400">
                                    Koi message pipeline me nahi — sab sent/failed ho chuke hain.
                                </p>
                            ) : (
                                <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
                                    {ds.pipeline.map((m) => (
                                        <div
                                            key={m.id}
                                            className="flex items-center justify-between gap-3 rounded-xl border border-white bg-white/80 px-3 py-2 shadow-sm"
                                        >
                                            <div className="flex min-w-0 items-center gap-2.5">
                                                <div
                                                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                                                        m.status === "sending"
                                                            ? "bg-blue-100 text-blue-600"
                                                            : m.status === "scheduled"
                                                              ? "bg-violet-100 text-violet-600"
                                                              : "bg-amber-100 text-amber-600"
                                                    }`}
                                                >
                                                    {m.type === "image" ? (
                                                        <PictureOutlined />
                                                    ) : m.type === "text" ? (
                                                        <FileTextOutlined />
                                                    ) : (
                                                        <SendOutlined />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-semibold text-gray-800">
                                                        {fmtPhone(m.number)}
                                                    </p>
                                                    <p className="text-[10px] text-gray-400">
                                                        {m.status === "scheduled" && m.scheduledAt
                                                            ? `fires at ${fmtDateTime(m.scheduledAt)}`
                                                            : m.status === "sending"
                                                              ? `sending since ${fmtDateTime(m.createdAt)}`
                                                              : `queued since ${fmtDateTime(m.createdAt)}`}
                                                    </p>
                                                </div>
                                            </div>
                                            <span
                                                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                                                    m.status === "sending"
                                                        ? "animate-pulse bg-blue-50 text-blue-600"
                                                        : m.status === "scheduled"
                                                          ? "bg-violet-50 text-violet-600"
                                                          : "bg-amber-50 text-amber-600"
                                                }`}
                                            >
                                                {m.status}
                                            </span>
                                            <button
                                                title="Cancel this message — send nahi hoga"
                                                onClick={() =>
                                                    cancelMsg.mutate(m.id, {
                                                        onSuccess: () =>
                                                            toast.success("Message cancelled"),
                                                        onError: (e: any) =>
                                                            toast.error(
                                                                e?.response?.data?.message ||
                                                                    "Cancel failed",
                                                            ),
                                                    })
                                                }
                                                disabled={
                                                    cancelMsg.isPending &&
                                                    cancelMsg.variables === m.id
                                                }
                                                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-gray-300 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                                            >
                                                {cancelMsg.isPending &&
                                                cancelMsg.variables === m.id ? (
                                                    <Spinner />
                                                ) : (
                                                    <CloseCircleOutlined className="text-xs" />
                                                )}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        </>
                    ) : (
                    <div>
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                                Recipients ({recipientsData?.pagination?.total ?? 0})
                                {audience?.people
                                    ? ` · ${audience.people} person${
                                          audience.people === 1 ? "" : "s"
                                      }`
                                    : ""}
                            </p>
                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setPage(1);
                                }}
                                className={`${selectCls} w-auto min-w-[120px] px-2 py-1.5 text-xs`}
                            >
                                <option value="">All statuses</option>
                                <option value="pending">Pending</option>
                                <option value="queued">Queued</option>
                                <option value="sending">Sending</option>
                                <option value="sent">Sent</option>
                                <option value="delivered">Delivered</option>
                                <option value="read">Read</option>
                                <option value="failed">Failed</option>
                                <option value="skipped">Skipped</option>
                            </select>
                        </div>

                        {fetchingRecipients ? (
                            <CenteredSpinner label="Loading recipients…" />
                        ) : !recipientsData?.data?.length ? (
                            <p className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-xs text-gray-400">
                                {campaign.status === "draft"
                                    ? "Start the campaign to generate recipients."
                                    : "No recipients match this filter."}
                            </p>
                        ) : (
                            <div className="space-y-1.5">
                                {recipientsData.data.map((r) => (
                                    <div
                                        key={r._id}
                                        className="flex items-center gap-3 rounded-xl border border-gray-100 px-3 py-2.5"
                                    >
                                        <Avatar
                                            name={r.contact?.name}
                                            size="sm"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <p className="flex items-center gap-1.5 truncate text-sm font-medium text-gray-900">
                                                {r.contact?.name || "Unknown"}
                                                {(r.sequence ?? 1) > 1 && (
                                                    <span className="shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                                                        #{r.sequence}
                                                    </span>
                                                )}
                                            </p>
                                            <p className="font-mono text-xs text-gray-400">
                                                {fmtPhone(r.phoneNumber)}
                                            </p>
                                        </div>
                                        <p className="hidden max-w-[200px] truncate text-[11px] text-gray-400 md:block">
                                            {r.renderedMessage}
                                        </p>
                                        {recipientStatusBadge(r.status)}
                                    </div>
                                ))}
                            </div>
                        )}

                        {recipientsData?.pagination &&
                            recipientsData.pagination.totalPages > 1 && (
                                <div className="mt-4 flex items-center justify-between">
                                    <p className="text-xs text-gray-400">
                                        Page {recipientsData.pagination.page} of{" "}
                                        {recipientsData.pagination.totalPages}
                                    </p>
                                    <div className="flex gap-1">
                                        <SecondaryButton
                                            disabled={!recipientsData.pagination.hasPrev}
                                            onClick={() => setPage((p) => p - 1)}
                                            className="px-3 py-1.5 text-xs"
                                        >
                                            Prev
                                        </SecondaryButton>
                                        <SecondaryButton
                                            disabled={!recipientsData.pagination.hasNext}
                                            onClick={() => setPage((p) => p + 1)}
                                            className="px-3 py-1.5 text-xs"
                                        >
                                            Next
                                        </SecondaryButton>
                                    </div>
                                </div>
                            )}
                    </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CampaignsPage;
