import React, { useEffect, useMemo, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { toast } from "sonner";
import {
    PlusOutlined,
    SyncOutlined,
    UploadOutlined,
    DownloadOutlined,
    SearchOutlined,
    DeleteOutlined,
    EyeOutlined,
    EditOutlined,
    StopOutlined,
    UndoOutlined,
    TeamOutlined,
    TagsOutlined,
    ReloadOutlined,
    CheckOutlined,
} from "@ant-design/icons";
import {
    useBlockContact,
    useContact,
    useContactActivities,
    useContactGroups,
    useContacts,
    useCreateContact,
    useDeleteContact,
    useExportContacts,
    useImportContacts,
    useOptOutContact,
    useSetContactTags,
    useSyncWhatsApp,
    useTags,
    useUnblockContact,
    useUpdateContact,
} from "../hooks/useCrm";
import {
    Avatar,
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
    fmtDate,
    downloadBlob,
    fmtDateTime,
    fmtPhone,
    inputCls,
} from "../components/CrmUi";
import type { Contact, ContactInput } from "../types/crm.types";

type TabKey = "all" | "genuine";

const TABS: { key: TabKey; label: string }[] = [
    { key: "all", label: "All" },
    { key: "genuine", label: "Genuine" },
];

const ContactRow = ({
    contact,
    selected,
    onToggle,
    onView,
    onDelete,
}: {
    contact: Contact;
    selected: boolean;
    onToggle: () => void;
    onView: () => void;
    onDelete: () => void;
}) => (
    <tr className="border-b border-gray-50 transition hover:bg-gray-50/60">
        <td className="px-4 py-3">
            <input
                type="checkbox"
                checked={selected}
                onChange={onToggle}
                className="h-4 w-4 rounded border-gray-300 accent-emerald-600"
            />
        </td>
        <td className="px-4 py-3">
            <div className="flex items-center gap-3">
                <Avatar name={contact.name || contact.pushName} size="sm" />
                <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">
                        {contact.name || contact.pushName || "Unknown"}
                    </p>
                    <p className="truncate text-xs text-gray-400">
                        {contact.pushName && contact.name !== contact.pushName
                            ? `~${contact.pushName}`
                            : ""}
                    </p>
                </div>
            </div>
        </td>
        <td className="px-4 py-3">
            <span className="font-mono text-sm text-gray-600">
                {fmtPhone(contact.phoneNumber)}
            </span>
        </td>
        <td className="px-4 py-3">
            <div className="flex flex-wrap items-center gap-1">
                {contact.whatsappJid ? (
                    <GreenBadge small>Genuine</GreenBadge>
                ) : (
                    <GrayBadge small>Manual</GrayBadge>
                )}
                {contact.isBlocked && <RedBadge small>Blocked</RedBadge>}
                {contact.isOptedOut && <RedBadge small>Opted out</RedBadge>}
            </div>
        </td>
        <td className="px-4 py-3">
            {contact.customGroups?.length ? (
                <div className="flex max-w-[180px] flex-wrap gap-1">
                    {contact.customGroups.map((g) => (
                        <GrayBadge key={g._id} small>
                            {g.name}
                        </GrayBadge>
                    ))}
                </div>
            ) : (
                <span className="text-xs text-gray-300">—</span>
            )}
        </td>
        <td className="px-4 py-3 text-xs text-gray-400">
            {fmtDate(contact.updatedAt)}
        </td>
        <td className="px-4 py-3">
            <div className="flex items-center justify-end gap-1">
                <button
                    onClick={onView}
                    title="View / edit"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-emerald-50 hover:text-emerald-600"
                >
                    <EyeOutlined />
                </button>
                <button
                    onClick={onDelete}
                    title="Delete"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                >
                    <DeleteOutlined />
                </button>
            </div>
        </td>
    </tr>
);

const ContactsPage: React.FC = () => {
    const [tab, setTab] = useState<TabKey>("all");
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState<Set<string>>(new Set());

    const [addOpen, setAddOpen] = useState(false);
    const [importOpen, setImportOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null);
    const [detailId, setDetailId] = useState<string | null>(null);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
        return () => clearTimeout(t);
    }, [search]);

    useEffect(() => setPage(1), [tab, debouncedSearch]);

    const params = useMemo(
        () => ({
            page,
            limit: 20,
            search: debouncedSearch || undefined,
            genuine: tab === "genuine" ? true : undefined,
        }),
        [page, tab, debouncedSearch],
    );

    const { data, isLoading, isFetching, refetch } = useContacts(params);
    const { data: groups } = useContactGroups();

    const deleteContact = useDeleteContact();
    const sync = useSyncWhatsApp();
    const exportCsv = useExportContacts();

    const contacts = data?.data || [];
    const pagination = data?.pagination;

    const allChecked =
        contacts.length > 0 && contacts.every((c) => selected.has(c._id));
    const toggleAll = () => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (allChecked) {
                contacts.forEach((c) => next.delete(c._id));
            } else {
                contacts.forEach((c) => next.add(c._id));
            }
            return next;
        });
    };
    const toggleOne = (id: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleSync = () => {
        sync.mutate(undefined, {
            onSuccess: (res) => {
                toast.success(
                    `Sync done — ${res.inserted} inserted, ${res.updated} updated (${res.found} found)`,
                );
                refetch();
            },
            onError: (err: any) => {
                toast.error(err?.response?.data?.message || "Sync failed");
            },
        });
    };

    const handleExport = () => {
        exportCsv.mutate(
            {
                search: debouncedSearch || undefined,
                contactIds: selected.size ? Array.from(selected) : undefined,
            },
            {
                onSuccess: (blob) => {
                    downloadBlob(
                        blob,
                        `contacts-export-${Date.now()}.csv`,
                    );
                    toast.success("Export downloaded");
                },
                onError: (err: any) =>
                    toast.error(err?.response?.data?.message || "Export failed"),
            },
        );
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        deleteContact.mutate(deleteTarget._id, {
            onSuccess: () => {
                toast.success("Contact deleted");
                setDeleteTarget(null);
                setSelected((prev) => {
                    const next = new Set(prev);
                    next.delete(deleteTarget._id);
                    return next;
                });
                if (detailId === deleteTarget._id) setDetailId(null);
            },
            onError: (err: any) =>
                toast.error(err?.response?.data?.message || "Delete failed"),
        });
    };

    return (
        <MainLayout>
            {/* Header */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Contacts</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        {pagination?.total !== undefined
                            ? `${pagination.total.toLocaleString()} contacts · synced from WhatsApp + manual`
                            : "All your WhatsApp and CRM contacts"}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <PrimaryButton onClick={() => setAddOpen(true)}>
                        <PlusOutlined /> Add Contact
                    </PrimaryButton>
                    <SecondaryButton onClick={() => setImportOpen(true)}>
                        <UploadOutlined /> Import CSV
                    </SecondaryButton>
                    <SecondaryButton onClick={handleExport} disabled={exportCsv.isPending}>
                        {exportCsv.isPending ? <Spinner /> : <DownloadOutlined />} Export
                    </SecondaryButton>
                    <PrimaryButton onClick={handleSync} disabled={sync.isPending}>
                        <SyncOutlined spin={sync.isPending} />
                        {sync.isPending ? "Syncing…" : "Sync WhatsApp"}
                    </PrimaryButton>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-4 flex flex-wrap items-center gap-3">
                <div className="relative min-w-[240px] flex-1">
                    <SearchOutlined className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search name, phone…"
                        className={`${inputCls} pl-10`}
                    />
                </div>
                <SecondaryButton onClick={() => refetch()}>
                    <ReloadOutlined />
                </SecondaryButton>
            </div>

            {/* Tabs */}
            <div className="mb-4 flex flex-wrap gap-1 rounded-2xl bg-gray-100 p-1 sm:w-fit">
                {TABS.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`rounded-xl px-4 py-1.5 text-sm font-medium transition ${
                            tab === t.key
                                ? "bg-white text-emerald-600 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                {isLoading ? (
                    <CenteredSpinner label="Loading contacts…" />
                ) : contacts.length === 0 ? (
                    <EmptyState
                        icon={<TeamOutlined />}
                        title="No contacts found"
                        description={
                            debouncedSearch
                                ? "Try a different search or filter."
                                : "Sync your WhatsApp contacts or add one manually to get started."
                        }
                        action={
                            !debouncedSearch && tab === "all" ? (
                                <PrimaryButton onClick={handleSync}>
                                    <SyncOutlined /> Sync now
                                </PrimaryButton>
                            ) : undefined
                        }
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px] text-left">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/60 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                                    <th className="w-10 px-4 py-3">
                                        <input
                                            type="checkbox"
                                            checked={allChecked}
                                            onChange={toggleAll}
                                            className="h-4 w-4 rounded border-gray-300 accent-emerald-600"
                                        />
                                    </th>
                                    <th className="px-4 py-3">Contact</th>
                                    <th className="px-4 py-3">Phone</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Groups</th>
                                    <th className="px-4 py-3">Updated</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contacts.map((c) => (
                                    <ContactRow
                                        key={c._id}
                                        contact={c}
                                        selected={selected.has(c._id)}
                                        onToggle={() => toggleOne(c._id)}
                                        onView={() => setDetailId(c._id)}
                                        onDelete={() => setDeleteTarget(c)}
                                    />
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
                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                            .filter(
                                (p) =>
                                    p === 1 ||
                                    p === pagination.totalPages ||
                                    Math.abs(p - pagination.page) <= 2,
                            )
                            .map((p, i, arr) => (
                                <React.Fragment key={p}>
                                    {i > 0 && arr[i - 1] !== p - 1 && (
                                        <span className="px-1 text-gray-300">…</span>
                                    )}
                                    <button
                                        onClick={() => setPage(p)}
                                        className={`h-8 min-w-8 rounded-lg px-2 text-xs font-medium transition ${
                                            p === pagination.page
                                                ? "bg-emerald-600 text-white"
                                                : "text-gray-500 hover:bg-gray-100"
                                        }`}
                                    >
                                        {p}
                                    </button>
                                </React.Fragment>
                            ))}
                        <SecondaryButton
                            disabled={!pagination.hasNext || isFetching}
                            onClick={() => setPage((p) => p + 1)}
                            className="px-3 py-1.5 text-xs"
                        >
                            Next
                        </SecondaryButton>
                    </div>
                </div>
            )}

            {/* Add contact modal */}
            <AddContactModal
                open={addOpen}
                onClose={() => setAddOpen(false)}
                groups={groups || []}
            />

            {/* Import modal */}
            <ImportModal open={importOpen} onClose={() => setImportOpen(false)} />

            {/* Delete confirm */}
            <Modal
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                title="Delete contact"
                footer={
                    <>
                        <SecondaryButton onClick={() => setDeleteTarget(null)}>
                            Cancel
                        </SecondaryButton>
                        <DangerButton onClick={handleDelete} disabled={deleteContact.isPending}>
                            {deleteContact.isPending ? <Spinner /> : <DeleteOutlined />} Delete
                        </DangerButton>
                    </>
                }
            >
                <p className="text-sm text-gray-600">
                    Are you sure you want to delete{" "}
                    <strong>{deleteTarget?.name || fmtPhone(deleteTarget?.phoneNumber)}</strong>?
                    This removes the contact from all groups and campaigns. This cannot be undone.
                </p>
            </Modal>

            {/* Detail drawer */}
            {detailId && (
                <ContactDrawer id={detailId} onClose={() => setDetailId(null)} />
            )}
        </MainLayout>
    );
};

// --------------------------------------------------------------------- Add

const AddContactModal: React.FC<{
    open: boolean;
    onClose: () => void;
    groups: { _id: string; name: string }[];
}> = ({ open, onClose, groups }) => {
    const createContact = useCreateContact();

    const [phone, setPhone] = useState("");
    const [name, setName] = useState("");
    const [groupNames, setGroupNames] = useState<string[]>([]);
    const [newGroupInput, setNewGroupInput] = useState("");

    useEffect(() => {
        if (open) {
            setPhone("");
            setName("");
            setGroupNames([]);
            setNewGroupInput("");
        }
    }, [open]);

    const digits = phone.replace(/\D/g, "");

    const toggleGroup = (gName: string) => {
        setGroupNames((prev) => {
            const key = gName.toLowerCase();
            return prev.some((n) => n.toLowerCase() === key)
                ? prev.filter((n) => n.toLowerCase() !== key)
                : [...prev, gName];
        });
    };

    const addNewGroups = () => {
        const names = newGroupInput
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        if (!names.length) return;
        setGroupNames((prev) => {
            const next = [...prev];
            for (const n of names) {
                if (!next.some((x) => x.toLowerCase() === n.toLowerCase())) next.push(n);
            }
            return next;
        });
        setNewGroupInput("");
    };

    const submit = () => {
        const full = digits.length === 10 ? `91${digits}` : digits;
        if (!/^\d{10,15}$/.test(full)) {
            toast.error("Enter a valid phone number (10 digits, +91 auto-applied)");
            return;
        }
        createContact.mutate(
            {
                phoneNumber: full,
                name: name.trim() || null,
                isSavedContact: true,
                // Group names — backend auto-creates groups that don't exist yet.
                customGroups: groupNames,
            },
            {
                onSuccess: () => {
                    toast.success("Contact created");
                    onClose();
                },
                onError: (err: any) =>
                    toast.error(
                        err?.response?.data?.message ||
                            err?.response?.data?.error ||
                            "Failed to create contact",
                    ),
            },
        );
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Add contact"
            wide
            footer={
                <>
                    <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
                    <PrimaryButton onClick={submit} disabled={createContact.isPending}>
                        {createContact.isPending ? <Spinner /> : <PlusOutlined />} Create
                    </PrimaryButton>
                </>
            }
        >
            <div className="space-y-4">
                <Field label="Phone number" required hint="+91 automatically added for Indian numbers">
                    <div className="relative">
                        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">
                            {digits.length <= 10 ? "+91" : "+"}
                        </span>
                        <input
                            value={digits.length <= 10 ? ` ${digits}` : digits}
                            onChange={(e) => setPhone(e.target.value)}
                            inputMode="numeric"
                            placeholder=" 9876543210"
                            className={`${inputCls} pl-12`}
                        />
                    </div>
                </Field>

                <Field label="Name">
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Contact name"
                        className={inputCls}
                    />
                </Field>

                <Field
                    label="Groups"
                    hint="Pick from your groups, or type new group names — they are created and saved with this contact"
                >
                    <div className="flex max-h-32 flex-wrap gap-1.5 overflow-y-auto rounded-xl border border-gray-200 p-2">
                        {groups.map((g) => {
                            const on = groupNames.some(
                                (n) => n.toLowerCase() === g.name.toLowerCase(),
                            );
                            return (
                                <button
                                    key={g._id}
                                    type="button"
                                    onClick={() => toggleGroup(g.name)}
                                    className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                                        on
                                            ? "bg-emerald-600 text-white"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                                >
                                    {g.name}
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-2 flex gap-2">
                        <input
                            value={newGroupInput}
                            onChange={(e) => setNewGroupInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    addNewGroups();
                                }
                            }}
                            placeholder="Type new group e.g. Business, Advertisement"
                            className={inputCls}
                        />
                        <SecondaryButton type="button" onClick={addNewGroups} className="px-3">
                            <PlusOutlined />
                        </SecondaryButton>
                    </div>

                    {groupNames.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                            {groupNames.map((g) => (
                                <span
                                    key={g}
                                    className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
                                >
                                    {g}
                                    <button
                                        type="button"
                                        onClick={() => toggleGroup(g)}
                                        className="text-emerald-400 hover:text-emerald-700"
                                    >
                                        ✕
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </Field>
            </div>
        </Modal>
    );
};

// ------------------------------------------------------------------- Import

const ImportModal: React.FC<{ open: boolean; onClose: () => void }> = ({
    open,
    onClose,
}) => {
    const importCsv = useImportContacts();
    const [csv, setCsv] = useState("");
    const [updateExisting, setUpdateExisting] = useState(false);
    const [assignGroups, setAssignGroups] = useState("");
    const [assignTags, setAssignTags] = useState("");

    useEffect(() => {
        if (open) {
            setCsv("");
            setUpdateExisting(false);
            setAssignGroups("");
            setAssignTags("");
        }
    }, [open]);

    const submit = () => {
        importCsv.mutate(
            {
                csv,
                updateExisting,
                assignGroups: assignGroups
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                assignTags: assignTags
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
            },
            {
                onSuccess: (res) => {
                    toast.success(
                        `Import done — ${res.created} created, ${res.updated} updated, ${res.duplicates} duplicates, ${res.invalid} invalid`,
                    );
                    onClose();
                },
                onError: (err: any) =>
                    toast.error(err?.response?.data?.message || "Import failed"),
            },
        );
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Import contacts from CSV"
            wide
            footer={
                <>
                    <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
                    <PrimaryButton onClick={submit} disabled={importCsv.isPending || !csv.trim()}>
                        {importCsv.isPending ? <Spinner /> : <UploadOutlined />} Import
                    </PrimaryButton>
                </>
            }
        >
            <div className="space-y-4">
                <Field
                    label="CSV content"
                    required
                    hint="Headers: phoneNumber (required), name, pushName, city, state, language, tags (comma-separated), groups, customFields (key:value;key2:value2)"
                >
                    <textarea
                        value={csv}
                        onChange={(e) => setCsv(e.target.value)}
                        rows={8}
                        placeholder={"phoneNumber,name,city\n919876543210,Rahul,Delhi"}
                        className={`${inputCls} font-mono text-xs`}
                    />
                </Field>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Assign groups" hint="Comma-separated names, auto-created">
                        <input
                            value={assignGroups}
                            onChange={(e) => setAssignGroups(e.target.value)}
                            placeholder="VIP, Leads"
                            className={inputCls}
                        />
                    </Field>
                    <Field label="Assign tags" hint="Comma-separated names, auto-created">
                        <input
                            value={assignTags}
                            onChange={(e) => setAssignTags(e.target.value)}
                            placeholder="premium, active"
                            className={inputCls}
                        />
                    </Field>
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                        type="checkbox"
                        checked={updateExisting}
                        onChange={(e) => setUpdateExisting(e.target.checked)}
                        className="h-4 w-4 rounded accent-emerald-600"
                    />
                    Update existing contacts (fill only blank fields)
                </label>
            </div>
        </Modal>
    );
};

// ------------------------------------------------------------------ Drawer

const ContactDrawer: React.FC<{ id: string; onClose: () => void }> = ({ id, onClose }) => {
    const { data: contact, isLoading } = useContact(id);
    const { data: activities } = useContactActivities(id);
    const { data: tags } = useTags();
    const { data: allGroups } = useContactGroups();

    const updateContact = useUpdateContact();
    const setTags = useSetContactTags();
    const block = useBlockContact();
    const unblock = useUnblockContact();
    const optOut = useOptOutContact();
    const deleteContact = useDeleteContact();

    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState<ContactInput | null>(null);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [newGroupInput, setNewGroupInput] = useState("");

    useEffect(() => {
        setEditing(false);
        setForm(null);
        setConfirmDelete(false);
    }, [id]);

    useEffect(() => {
        if (contact && !form) {
            setForm({
                phoneNumber: contact.phoneNumber,
                name: contact.name || "",
                city: contact.city || "",
                state: contact.state || "",
                language: contact.language || "",
                isSavedContact: contact.isSavedContact,
                customFields: contact.customFields || [],
            });
        }
    }, [contact, form]);

    const set = (patch: Partial<ContactInput>) =>
        setForm((f) => ({ ...(f as ContactInput), ...patch }));

    const save = () => {
        if (!form) return;
        updateContact.mutate(
            { id, input: form },
            {
                onSuccess: () => {
                    toast.success("Contact updated");
                    setEditing(false);
                },
                onError: (err: any) =>
                    toast.error(err?.response?.data?.message || "Update failed"),
            },
        );
    };

    const toggleTag = (tagId: string) => {
        const current = (contact?.tags || []).map((t) => t._id);
        const next = current.includes(tagId)
            ? current.filter((x) => x !== tagId)
            : [...current, tagId];
        setTags.mutate(
            { id, tags: next },
            {
                onSuccess: () => toast.success("Tags updated"),
                onError: (err: any) =>
                    toast.error(err?.response?.data?.message || "Update failed"),
            },
        );
    };

    const currentGroupNames = (contact?.customGroups || []).map((g) => g.name);

    const applyGroups = (names: string[]) => {
        updateContact.mutate(
            { id, input: { customGroups: names } },
            {
                onSuccess: () => toast.success("Groups updated"),
                onError: (err: any) =>
                    toast.error(err?.response?.data?.message || "Update failed"),
            },
        );
    };

    const toggleGroup = (gName: string) => {
        const key = gName.toLowerCase();
        const next = currentGroupNames.some((n) => n.toLowerCase() === key)
            ? currentGroupNames.filter((n) => n.toLowerCase() !== key)
            : [...currentGroupNames, gName];
        applyGroups(next);
    };

    const addNewGroups = () => {
        const names = newGroupInput
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        if (!names.length) return;
        const next = [...currentGroupNames];
        for (const n of names) {
            if (!next.some((x) => x.toLowerCase() === n.toLowerCase())) next.push(n);
        }
        applyGroups(next);
        setNewGroupInput("");
    };

    if (isLoading || !contact) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <CenteredSpinner label="Loading contact…" />
            </div>
        );
    }

    const actionLabel = (a: string) =>
        a
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
            <div className="absolute inset-0" onClick={onClose} />
            <div className="relative flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
                    <div className="flex items-center gap-4">
                        <Avatar name={contact.name || contact.pushName} size="lg" />
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                {contact.name || contact.pushName || "Unknown"}
                            </h2>
                            <p className="font-mono text-sm text-gray-500">
                                {fmtPhone(contact.phoneNumber)}
                            </p>
                            <div className="mt-1.5 flex flex-wrap gap-1">
                                {contact.whatsappJid ? (
                                    <GreenBadge small>Genuine</GreenBadge>
                                ) : (
                                    <GrayBadge small>Manual</GrayBadge>
                                )}
                                {contact.isBlocked && <RedBadge small>Blocked</RedBadge>}
                                {contact.isOptedOut && <RedBadge small>Opted out</RedBadge>}
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
                    {/* Tags */}
                    <div className="mb-6">
                        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
                            <TagsOutlined /> Tags
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {(tags || []).map((t) => {
                                const on = (contact.tags || []).some((ct) => ct._id === t._id);
                                return (
                                    <button
                                        key={t._id}
                                        onClick={() => toggleTag(t._id)}
                                        className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                                            on
                                                ? "bg-emerald-600 text-white"
                                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                        }`}
                                    >
                                        {t.name}
                                    </button>
                                );
                            })}
                            {!tags?.length && (
                                <p className="text-xs text-gray-400">
                                    No tags available — create them on the Tags page.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Details / edit */}
                    <div className="mb-6">
                        <div className="mb-3 flex items-center justify-between">
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                                Details
                            </p>
                            {!editing ? (
                                <SecondaryButton
                                    onClick={() => setEditing(true)}
                                    className="px-3 py-1.5 text-xs"
                                >
                                    <EditOutlined /> Edit
                                </SecondaryButton>
                            ) : (
                                <div className="flex gap-2">
                                    <SecondaryButton
                                        onClick={() => setEditing(false)}
                                        className="px-3 py-1.5 text-xs"
                                    >
                                        Cancel
                                    </SecondaryButton>
                                    <PrimaryButton
                                        onClick={save}
                                        disabled={updateContact.isPending}
                                        className="px-3 py-1.5 text-xs"
                                    >
                                        {updateContact.isPending ? <Spinner /> : <CheckOutlined />} Save
                                    </PrimaryButton>
                                </div>
                            )}
                        </div>

                        {editing && form ? (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <Field label="Name">
                                    <input
                                        value={form.name || ""}
                                        onChange={(e) => set({ name: e.target.value })}
                                        className={inputCls}
                                    />
                                </Field>
                                <Field label="Phone">
                                    <input
                                        value={form.phoneNumber || ""}
                                        onChange={(e) => set({ phoneNumber: e.target.value })}
                                        className={inputCls}
                                    />
                                </Field>
                                <label className="flex items-center gap-2 self-end pb-2 text-sm text-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={!!form.isSavedContact}
                                        onChange={(e) => set({ isSavedContact: e.target.checked })}
                                        className="h-4 w-4 rounded accent-emerald-600"
                                    />
                                    Saved contact
                                </label>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-3 rounded-2xl border border-gray-100 bg-gray-50/60 p-4 sm:grid-cols-2">
                                <Info label="Phone" value={fmtPhone(contact.phoneNumber)} mono />
                                <Info label="Name" value={contact.name || "—"} />
                                <Info label="Created" value={fmtDate(contact.createdAt)} />
                                <Info label="Updated" value={fmtDate(contact.updatedAt)} />
                            </div>
                        )}
                    </div>

                    {/* Groups */}
                    <div className="mb-6">
                        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
                            <TeamOutlined /> Groups
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {(allGroups || []).map((g) => {
                                const on = currentGroupNames.some(
                                    (n) => n.toLowerCase() === g.name.toLowerCase(),
                                );
                                return (
                                    <button
                                        key={g._id}
                                        onClick={() => toggleGroup(g.name)}
                                        className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                                            on
                                                ? "bg-emerald-600 text-white"
                                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                        }`}
                                    >
                                        {g.name}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="mt-2 flex gap-2">
                            <input
                                value={newGroupInput}
                                onChange={(e) => setNewGroupInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        addNewGroups();
                                    }
                                }}
                                placeholder="Type new group e.g. Business, Advertisement"
                                className={inputCls}
                            />
                            <SecondaryButton
                                type="button"
                                onClick={addNewGroups}
                                className="px-3"
                            >
                                <PlusOutlined />
                            </SecondaryButton>
                        </div>
                        {currentGroupNames.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                {currentGroupNames.map((g) => (
                                    <GrayBadge key={g}>{g}</GrayBadge>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Activities */}
                    <div className="mb-6">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                            Activity
                        </p>
                        <div className="max-h-48 space-y-1.5 overflow-y-auto">
                            {activities?.length ? (
                                activities.map((a) => (
                                    <div
                                        key={a._id}
                                        className="flex items-center justify-between rounded-xl border border-gray-100 px-3 py-2 text-xs"
                                    >
                                        <span className="text-gray-700">{actionLabel(a.action)}</span>
                                        <span className="text-gray-400">
                                            {fmtDateTime(a.createdAt)}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-gray-400">No activity yet.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer actions */}
                <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 px-6 py-4">
                    {contact.isBlocked ? (
                        <SecondaryButton
                            onClick={() =>
                                unblock.mutate(id, {
                                    onSuccess: () => toast.success("Contact unblocked"),
                                    onError: (e: any) =>
                                        toast.error(e?.response?.data?.message || "Failed"),
                                })
                            }
                        >
                            <UndoOutlined /> Unblock
                        </SecondaryButton>
                    ) : (
                        <SecondaryButton
                            onClick={() =>
                                block.mutate(id, {
                                    onSuccess: () => toast.success("Contact blocked"),
                                    onError: (e: any) =>
                                        toast.error(e?.response?.data?.message || "Failed"),
                                })
                            }
                        >
                            <StopOutlined /> Block
                        </SecondaryButton>
                    )}
                    {contact.isOptedOut ? (
                        <SecondaryButton
                            onClick={() =>
                                updateContact.mutate(
                                    { id, input: { isOptedOut: false } },
                                    {
                                        onSuccess: () => toast.success("Opt-out removed"),
                                        onError: (e: any) =>
                                            toast.error(e?.response?.data?.message || "Failed"),
                                    },
                                )
                            }
                        >
                            <UndoOutlined /> Remove opt-out
                        </SecondaryButton>
                    ) : (
                        <SecondaryButton
                            onClick={() =>
                                optOut.mutate(id, {
                                    onSuccess: () => toast.success("Contact opted out"),
                                    onError: (e: any) =>
                                        toast.error(e?.response?.data?.message || "Failed"),
                                })
                            }
                        >
                            <StopOutlined /> Opt out
                        </SecondaryButton>
                    )}
                    <div className="flex-1" />
                    <DangerButton
                        onClick={() => setConfirmDelete(true)}
                        disabled={deleteContact.isPending}
                    >
                        <DeleteOutlined /> Delete
                    </DangerButton>
                </div>
            </div>

            {confirmDelete && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
                        <h3 className="text-base font-semibold text-gray-900">Delete contact?</h3>
                        <p className="mt-2 text-sm text-gray-600">
                            This removes the contact from all groups and campaigns. Cannot be undone.
                        </p>
                        <div className="mt-5 flex justify-end gap-2">
                            <SecondaryButton onClick={() => setConfirmDelete(false)}>
                                Cancel
                            </SecondaryButton>
                            <DangerButton
                                onClick={() =>
                                    deleteContact.mutate(id, {
                                        onSuccess: () => {
                                            toast.success("Contact deleted");
                                            onClose();
                                        },
                                        onError: (e: any) =>
                                            toast.error(e?.response?.data?.message || "Failed"),
                                    })
                                }
                            >
                                Delete
                            </DangerButton>
                        </div>
                    </div>
                </div>
            )}
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
        <p className={`mt-0.5 text-sm text-gray-800 ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
);

export default ContactsPage;
