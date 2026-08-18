import React, { useEffect, useMemo, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { toast } from "sonner";
import {
    SendOutlined,
    MessageOutlined,
    EyeOutlined,
    SearchOutlined,
    CheckOutlined,
    ExportOutlined,
} from "@ant-design/icons";
import {
    useCampaigns,
    useContacts,
    useMessage,
    useMessages,
    useSendMessage,
    useTemplates,
} from "../hooks/useCrm";
import {
    Avatar,
    BlueBadge,
    CenteredSpinner,
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
    selectCls,
} from "../components/CrmUi";
import type { MessageDirection, MessageStatus } from "../types/crm.types";

const DIRECTIONS: { value: MessageDirection | "all"; label: string }[] = [
    { value: "all", label: "All directions" },
    { value: "outbound", label: "Outbound (sent)" },
    { value: "inbound", label: "Inbound (received)" },
];

const STATUSES: { value: MessageStatus | "all"; label: string }[] = [
    { value: "all", label: "All statuses" },
    { value: "pending", label: "Pending" },
    { value: "queued", label: "Queued" },
    { value: "sending", label: "Sending" },
    { value: "sent", label: "Sent" },
    { value: "delivered", label: "Delivered" },
    { value: "read", label: "Read" },
    { value: "failed", label: "Failed" },
];

const statusBadge = (status: MessageStatus) => {
    const map: Record<MessageStatus, React.ReactNode> = {
        pending: <GrayBadge small>Pending</GrayBadge>,
        queued: <GrayBadge small>Queued</GrayBadge>,
        sending: <BlueBadge small>Sending</BlueBadge>,
        sent: <BlueBadge small>Sent</BlueBadge>,
        delivered: <GreenBadge small>Delivered</GreenBadge>,
        read: <GreenBadge small>Read</GreenBadge>,
        failed: <RedBadge small>Failed</RedBadge>,
    };
    return map[status];
};

const MessageLogPage: React.FC = () => {
    const [page, setPage] = useState(1);
    const [direction, setDirection] = useState<MessageDirection | "all">("all");
    const [status, setStatus] = useState<MessageStatus | "all">("all");
    const [campaignId, setCampaignId] = useState("");

    const { data: campaigns } = useCampaigns();

    const { data, isLoading, isFetching, refetch } = useMessages({
        page,
        limit: 20,
        direction: direction === "all" ? undefined : direction,
        status: status === "all" ? undefined : status,
        campaignId: campaignId || undefined,
    });

    const [sendOpen, setSendOpen] = useState(false);
    const [detailId, setDetailId] = useState<string | null>(null);

    useEffect(() => setPage(1), [direction, status, campaignId]);

    const messages = data?.data || [];
    const pagination = data?.pagination;

    return (
        <MainLayout>
            {/* Header */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Message Log</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Send OTPs, transactional and promotional messages over WhatsApp —
                        directly or via approved templates
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <SecondaryButton onClick={() => refetch()}>
                        <ExportOutlined />
                    </SecondaryButton>
                    <PrimaryButton onClick={() => setSendOpen(true)}>
                        <SendOutlined /> Send Message
                    </PrimaryButton>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-4 flex flex-wrap items-center gap-3">
                <select
                    value={direction}
                    onChange={(e) => setDirection(e.target.value as MessageDirection | "all")}
                    className={`${selectCls} w-auto min-w-[170px]`}
                >
                    {DIRECTIONS.map((d) => (
                        <option key={d.value} value={d.value}>
                            {d.label}
                        </option>
                    ))}
                </select>
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as MessageStatus | "all")}
                    className={`${selectCls} w-auto min-w-[140px]`}
                >
                    {STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>
                            {s.label}
                        </option>
                    ))}
                </select>
                <select
                    value={campaignId}
                    onChange={(e) => setCampaignId(e.target.value)}
                    className={`${selectCls} w-auto min-w-[160px]`}
                >
                    <option value="">All campaigns</option>
                    {(campaigns || []).map((c) => (
                        <option key={c._id} value={c._id}>
                            {c.name}
                        </option>
                    ))}
                </select>
                <span className="text-xs text-gray-400">
                    {pagination?.total !== undefined
                        ? `${pagination.total.toLocaleString()} message${pagination.total === 1 ? "" : "s"}`
                        : ""}
                </span>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                {isLoading ? (
                    <CenteredSpinner label="Loading messages…" />
                ) : messages.length === 0 ? (
                    <EmptyState
                        icon={<MessageOutlined />}
                        title="No messages yet"
                        description="Send your first OTP or promotional message to see it here."
                        action={
                            <PrimaryButton onClick={() => setSendOpen(true)}>
                                <SendOutlined /> Send your first message
                            </PrimaryButton>
                        }
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px] text-left">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/60 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                                    <th className="px-4 py-3">Contact</th>
                                    <th className="px-4 py-3">Direction</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Message</th>
                                    <th className="px-4 py-3">Campaign</th>
                                    <th className="px-4 py-3">Sent</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {messages.map((m) => (
                                    <tr
                                        key={m._id}
                                        className="border-b border-gray-50 transition hover:bg-gray-50/60"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <Avatar
                                                    name={m.contact?.name}
                                                    size="sm"
                                                />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {m.contact?.name || "Unknown"}
                                                    </p>
                                                    <p className="font-mono text-xs text-gray-400">
                                                        {fmtPhone(m.contact?.phoneNumber || m.to)}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {m.direction === "outbound" ? (
                                                <BlueBadge small>Outbound</BlueBadge>
                                            ) : (
                                                <GrayBadge small>Inbound</GrayBadge>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">{statusBadge(m.status)}</td>
                                        <td className="px-4 py-3">
                                            <p className="max-w-[260px] truncate text-xs text-gray-600">
                                                {m.content || "—"}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-500">
                                            {m.campaign?.name || "—"}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-400">
                                            {fmtDateTime(m.createdAt)}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => setDetailId(m._id)}
                                                title="View"
                                                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-emerald-50 hover:text-emerald-600"
                                            >
                                                <EyeOutlined />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-gray-400">
                        Showing {(pagination.page - 1) * pagination.limit + 1}–
                        {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                        {pagination.total}
                    </p>
                    <div className="flex items-center gap-1">
                        <SecondaryButton
                            disabled={!pagination.hasPrev || isFetching}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            className="px-3 py-1.5 text-xs"
                        >
                            Prev
                        </SecondaryButton>
                        <button
                            onClick={() => setPage((p) => p + 1)}
                            disabled={!pagination.hasNext || isFetching}
                            className="h-8 min-w-8 rounded-lg px-2 text-xs font-medium text-gray-500 transition hover:bg-gray-100 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* Send modal */}
            <SendMessageModal open={sendOpen} onClose={() => setSendOpen(false)} />

            {/* Detail drawer */}
            {detailId && <MessageDrawer id={detailId} onClose={() => setDetailId(null)} />}
        </MainLayout>
    );
};

// ------------------------------------------------------------ Send message

const SendMessageModal: React.FC<{ open: boolean; onClose: () => void }> = ({
    open,
    onClose,
}) => {
    const send = useSendMessage();
    const { data: templates } = useTemplates({ status: "active" });

    const [to, setTo] = useState("");
    const [templateId, setTemplateId] = useState("");
    const [variables, setVariables] = useState<Record<string, string>>({});
    const [contactSearch, setContactSearch] = useState("");
    const [pickedContact, setPickedContact] = useState<{
        _id: string;
        name: string | null;
        phoneNumber: string;
    } | null>(null);

    const { data: contactsData } = useContacts({
        page: 1,
        limit: 10,
        search: contactSearch.trim() || undefined,
    });

    useEffect(() => {
        if (open) {
            setTo("");
            setTemplateId("");
            setVariables({});
            setContactSearch("");
            setPickedContact(null);
        }
    }, [open]);

    const template = templates?.find((t) => t._id === templateId);

    const rendered = useMemo(() => {
        if (!template) return "";
        return (template.variables || []).reduce(
            (acc, v) => acc.replaceAll(`{{${v}}}`, variables[v] ?? `{{${v}}`),
            template.content,
        );
    }, [template, variables]);

    const submit = () => {
        const phone = (pickedContact?.phoneNumber || to).replace(/\D/g, "");
        if (!/^\d{10,15}$/.test(phone)) {
            toast.error("Enter a valid recipient phone number (10–15 digits)");
            return;
        }
        if (!templateId) {
            toast.error("Select a template");
            return;
        }
        send.mutate(
            {
                to: phone,
                template: templateId,
                variables,
            },
            {
                onSuccess: () => {
                    toast.success("Message queued for sending");
                    onClose();
                },
                onError: (err: any) =>
                    toast.error(err?.response?.data?.message || "Failed to send"),
            },
        );
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Send WhatsApp message"
            wide
            footer={
                <>
                    <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
                    <PrimaryButton onClick={submit} disabled={send.isPending}>
                        {send.isPending ? <Spinner /> : <SendOutlined />} Queue & Send
                    </PrimaryButton>
                </>
            }
        >
            <div className="space-y-4">
                <Field
                    label="Recipient"
                    required
                    hint="Enter a phone number (with country code) or pick a saved contact"
                >
                    <div className="relative">
                        <SearchOutlined className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400" />
                        <input
                            value={to}
                            onChange={(e) => {
                                setTo(e.target.value);
                                setPickedContact(null);
                                setContactSearch(e.target.value);
                            }}
                            placeholder="e.g. 919876543210"
                            className={`${inputCls} pl-10`}
                        />
                    </div>
                    {contactSearch.trim().length >= 2 && !pickedContact && (
                        <div className="mt-1.5 overflow-hidden rounded-xl border border-gray-200">
                            {(contactsData?.data || []).slice(0, 5).map((c) => (
                                <button
                                    key={c._id}
                                    type="button"
                                    onClick={() => {
                                        setPickedContact(c);
                                        setTo(c.phoneNumber);
                                        setContactSearch("");
                                    }}
                                    className="flex w-full items-center gap-3 px-3 py-2 text-left transition hover:bg-emerald-50"
                                >
                                    <Avatar name={c.name || c.pushName} size="sm" />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm text-gray-900">
                                            {c.name || c.pushName || "Unknown"}
                                        </p>
                                        <p className="font-mono text-xs text-gray-400">
                                            {fmtPhone(c.phoneNumber)}
                                        </p>
                                    </div>
                                </button>
                            ))}
                            {!contactsData?.data?.length && (
                                <p className="px-3 py-2 text-xs text-gray-400">
                                    No matching contacts — type a full number instead.
                                </p>
                            )}
                        </div>
                    )}
                    {pickedContact && (
                        <div className="mt-1.5 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                            <CheckOutlined />
                            {pickedContact.name || "Contact"} · {fmtPhone(pickedContact.phoneNumber)}
                            <button
                                type="button"
                                onClick={() => {
                                    setPickedContact(null);
                                    setTo("");
                                }}
                                className="ml-auto text-emerald-500 hover:text-emerald-700"
                            >
                                ✕
                            </button>
                        </div>
                    )}
                </Field>

                <Field label="Template" required hint="OTP, transactional or promotional template">
                    <select
                        value={templateId}
                        onChange={(e) => {
                            setTemplateId(e.target.value);
                            const t = templates?.find((x) => x._id === e.target.value);
                            const init: Record<string, string> = {};
                            (t?.variables || []).forEach((v) => {
                                init[v] = v === "otp" ? "" : "";
                            });
                            setVariables(init);
                        }}
                        className={selectCls}
                    >
                        <option value="">Select a template…</option>
                        {(templates || []).map((t) => (
                            <option key={t._id} value={t._id}>
                                {t.name} ({t.category})
                            </option>
                        ))}
                    </select>
                </Field>

                {template && template.variables?.length > 0 && (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {template.variables.map((v) => (
                            <Field key={v} label={`{{${v}}}`}>
                                <input
                                    value={variables[v] || ""}
                                    onChange={(e) =>
                                        setVariables((prev) => ({ ...prev, [v]: e.target.value }))
                                    }
                                    placeholder={
                                        v === "otp" ? "e.g. 482913" : `Value for ${v}`
                                    }
                                    className={inputCls}
                                />
                            </Field>
                        ))}
                    </div>
                )}

                {rendered && (
                    <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                            Preview
                        </p>
                        <div className="max-w-sm rounded-2xl rounded-tl-sm bg-emerald-500 px-4 py-3 text-sm text-white shadow-sm">
                            <p className="whitespace-pre-wrap">{rendered}</p>
                            <p className="mt-2 text-right text-[10px] text-emerald-100">
                                {new Date().toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

// ------------------------------------------------------------------ Drawer

const MessageDrawer: React.FC<{ id: string; onClose: () => void }> = ({ id, onClose }) => {
    const { data: message, isLoading } = useMessage(id);

    if (isLoading || !message) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <CenteredSpinner label="Loading message…" />
            </div>
        );
    }

    const events: { label: string; at: string | null }[] = [
        { label: "Created", at: message.createdAt },
        { label: "Sent", at: message.sentAt },
        { label: "Delivered", at: message.deliveredAt },
        { label: "Read", at: message.readAt },
        { label: "Failed", at: message.failedAt },
    ];

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
            <div className="absolute inset-0" onClick={onClose} />
            <div className="relative flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
                    <div className="flex items-center gap-4">
                        <Avatar name={message.contact?.name} size="lg" />
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                {message.contact?.name || "Unknown"}
                            </h2>
                            <p className="font-mono text-sm text-gray-500">
                                {fmtPhone(message.contact?.phoneNumber || message.to)}
                            </p>
                            <div className="mt-1.5 flex flex-wrap gap-1">
                                {message.direction === "outbound" ? (
                                    <BlueBadge small>Outbound</BlueBadge>
                                ) : (
                                    <GrayBadge small>Inbound</GrayBadge>
                                )}
                                {statusBadge(message.status)}
                                <GrayBadge small>{message.type}</GrayBadge>
                            </div>
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
                    {/* Content */}
                    <div className="mb-6">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                            Message
                        </p>
                        <div className="max-w-md rounded-2xl rounded-tl-sm bg-emerald-500 px-4 py-3 text-sm text-white shadow-sm">
                            <p className="whitespace-pre-wrap">{message.content || "—"}</p>
                            <p className="mt-2 text-right text-[10px] text-emerald-100">
                                {fmtDateTime(message.createdAt)}
                            </p>
                        </div>
                    </div>

                    {/* Status timeline */}
                    <div className="mb-6">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                            Delivery timeline
                        </p>
                        <div className="space-y-2">
                            {events.map((e) => (
                                <div key={e.label} className="flex items-center gap-3">
                                    <span
                                        className={`h-2.5 w-2.5 rounded-full ${
                                            e.at
                                                ? "bg-emerald-500"
                                                : e.label === "Failed" && message.failedAt
                                                  ? "bg-red-500"
                                                  : "bg-gray-200"
                                        }`}
                                    />
                                    <span
                                        className={`w-24 text-xs font-medium ${
                                            e.at ? "text-gray-700" : "text-gray-400"
                                        }`}
                                    >
                                        {e.label}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {e.at ? fmtDateTime(e.at) : "—"}
                                    </span>
                                </div>
                            ))}
                        </div>
                        {message.error && (
                            <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">
                                Error: {message.error}
                            </p>
                        )}
                    </div>

                    {/* Details */}
                    <div className="mb-6 grid grid-cols-1 gap-3 rounded-2xl border border-gray-100 bg-gray-50/60 p-4 sm:grid-cols-2">
                        <Info label="Recipient" value={fmtPhone(message.to)} />
                        <Info label="Type" value={message.type} />
                        <Info label="Campaign" value={message.campaign?.name || "—"} />
                        <Info
                            label="WhatsApp ID"
                            value={message.whatsappMessageId || "—"}
                        />
                        <Info label="Created" value={fmtDateTime(message.createdAt)} />
                        <Info label="Updated" value={fmtDateTime(message.updatedAt)} />
                    </div>
                </div>
            </div>
        </div>
    );
};

const Info: React.FC<{ label: string; value: string; mono?: boolean }> = ({
    label,
    value,
    mono,
}) => (
    <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            {label}
        </p>
        <p className={`mt-0.5 break-all text-sm text-gray-800 ${mono ? "font-mono" : ""}`}>
            {value}
        </p>
    </div>
);

export default MessageLogPage;
