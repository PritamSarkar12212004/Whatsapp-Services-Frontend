import React, { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { toast } from "sonner";
import {
    PlusOutlined,
    TeamOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    SearchOutlined,
    UserAddOutlined,
    CloseOutlined,
    CheckOutlined,
} from "@ant-design/icons";
import {
    useAddContactsToGroup,
    useContactGroups,
    useContacts,
    useCreateContactGroup,
    useDeleteContactGroup,
    useRemoveContactFromGroup,
    useUpdateContactGroup,
} from "../hooks/useCrm";
import {
    Avatar,
    CenteredSpinner,
    DangerButton,
    EmptyState,
    Field,
    GrayBadge,
    Modal,
    PrimaryButton,
    SecondaryButton,
    Spinner,
    fmtPhone,
    inputCls,
} from "../components/CrmUi";
import type { ContactGroup } from "../types/crm.types";

const ContactGroupsPage: React.FC = () => {
    const { data: groups, isLoading, refetch } = useContactGroups();

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<ContactGroup | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<ContactGroup | null>(null);
    const [membersGroup, setMembersGroup] = useState<ContactGroup | null>(null);

    const deleteGroup = useDeleteContactGroup();

    const openCreate = () => {
        setEditing(null);
        setModalOpen(true);
    };
    const openEdit = (g: ContactGroup) => {
        setEditing(g);
        setModalOpen(true);
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        deleteGroup.mutate(deleteTarget._id, {
            onSuccess: () => {
                toast.success("Group deleted");
                setDeleteTarget(null);
            },
            onError: (err: any) =>
                toast.error(err?.response?.data?.message || "Delete failed"),
        });
    };

    return (
        <MainLayout>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Contact Groups</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Organize contacts into groups for targeted campaigns
                    </p>
                </div>
                <PrimaryButton onClick={openCreate}>
                    <PlusOutlined /> New Group
                </PrimaryButton>
            </div>

            {isLoading ? (
                <CenteredSpinner label="Loading groups…" />
            ) : !groups?.length ? (
                <EmptyState
                    icon={<TeamOutlined />}
                    title="No groups yet"
                    description="Create a group like 'VIP Customers' or 'Newsletter' to organize your contacts."
                    action={
                        <PrimaryButton onClick={openCreate}>
                            <PlusOutlined /> Create your first group
                        </PrimaryButton>
                    }
                />
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {groups.map((g) => (
                        <div
                            key={g._id}
                            className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-lg text-emerald-600">
                                    <TeamOutlined />
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => setMembersGroup(g)}
                                        title="Manage members"
                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-emerald-50 hover:text-emerald-600"
                                    >
                                        <EyeOutlined />
                                    </button>
                                    <button
                                        onClick={() => openEdit(g)}
                                        title="Edit"
                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                                    >
                                        <EditOutlined />
                                    </button>
                                    <button
                                        onClick={() => setDeleteTarget(g)}
                                        title="Delete"
                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                                    >
                                        <DeleteOutlined />
                                    </button>
                                </div>
                            </div>
                            <h3 className="mt-4 text-base font-semibold text-gray-900">{g.name}</h3>
                            <p className="mt-1 flex-1 text-sm text-gray-500">
                                {g.description || "No description"}
                            </p>
                            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                                <GrayBadge>
                                    {g.contacts?.length || 0} member
                                    {(g.contacts?.length || 0) !== 1 ? "s" : ""}
                                </GrayBadge>
                                <button
                                    onClick={() => setMembersGroup(g)}
                                    className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 transition hover:text-emerald-700"
                                >
                                    <UserAddOutlined /> Manage members
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create / edit modal */}
            <GroupFormModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                editing={editing}
            />

            {/* Delete confirm */}
            <Modal
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                title="Delete group"
                footer={
                    <>
                        <SecondaryButton onClick={() => setDeleteTarget(null)}>
                            Cancel
                        </SecondaryButton>
                        <DangerButton onClick={handleDelete} disabled={deleteGroup.isPending}>
                            {deleteGroup.isPending ? <Spinner /> : <DeleteOutlined />} Delete
                        </DangerButton>
                    </>
                }
            >
                <p className="text-sm text-gray-600">
                    Delete <strong>{deleteTarget?.name}</strong>? Contacts stay in your CRM, but
                    they are removed from this group.
                </p>
            </Modal>

            {/* Members drawer */}
            {membersGroup && (
                <MembersDrawer
                    group={membersGroup}
                    onClose={() => {
                        setMembersGroup(null);
                        refetch();
                    }}
                />
            )}
        </MainLayout>
    );
};

// ------------------------------------------------------------- Form modal

const GroupFormModal: React.FC<{
    open: boolean;
    onClose: () => void;
    editing: ContactGroup | null;
}> = ({ open, onClose, editing }) => {
    const createGroup = useCreateContactGroup();
    const updateGroup = useUpdateContactGroup();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    useEffect(() => {
        if (open) {
            setName(editing?.name || "");
            setDescription(editing?.description || "");
        }
    }, [open, editing]);

    const submit = () => {
        if (!name.trim()) {
            toast.error("Group name is required");
            return;
        }
        const payload = { name: name.trim(), description: description.trim() };
        if (editing) {
            updateGroup.mutate(
                { id: editing._id, input: payload },
                {
                    onSuccess: () => {
                        toast.success("Group updated");
                        onClose();
                    },
                    onError: (err: any) =>
                        toast.error(err?.response?.data?.message || "Update failed"),
                },
            );
        } else {
            createGroup.mutate(payload, {
                onSuccess: () => {
                    toast.success("Group created");
                    onClose();
                },
                onError: (err: any) =>
                    toast.error(err?.response?.data?.message || "Create failed"),
            });
        }
    };

    const pending = createGroup.isPending || updateGroup.isPending;

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={editing ? "Edit group" : "New group"}
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
                <Field label="Group name" required>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. VIP Customers"
                        className={inputCls}
                    />
                </Field>
                <Field label="Description">
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        placeholder="What is this group for?"
                        className={inputCls}
                    />
                </Field>
            </div>
        </Modal>
    );
};

// ---------------------------------------------------------- Members drawer

const MembersDrawer: React.FC<{
    group: ContactGroup;
    onClose: () => void;
}> = ({ group, onClose }) => {
    const [search, setSearch] = useState("");
    const [picked, setPicked] = useState<Set<string>>(new Set());

    // Local copy of members so remove/add updates the list instantly.
    const [members, setMembers] = useState<ContactGroup["contacts"]>([]);
    useEffect(() => {
        setMembers(group.contacts || []);
        setPicked(new Set());
    }, [group]);

    const addContacts = useAddContactsToGroup();
    const removeContact = useRemoveContactFromGroup();

    const { data: contactsData, isLoading: loadingContacts } = useContacts({
        page: 1,
        limit: 100,
        search: search.trim() || undefined,
    });
    const allContacts = contactsData?.data || [];

    const memberIds = new Set(members.map((c) => c._id));
    const candidates = allContacts.filter((c) => !memberIds.has(c._id));

    // Search filters BOTH the current members and the add-candidates.
    const q = search.trim().toLowerCase();
    const matches = (name?: string | null, phone?: string) => {
        if (!q) return true;
        if ((name || "").toLowerCase().includes(q)) return true;
        const digits = q.replace(/\D/g, "");
        if (digits && (phone || "").includes(digits)) return true;
        return (phone || "").toLowerCase().includes(q);
    };
    const filteredMembers = members.filter((m) => matches(m.name, m.phoneNumber));

    const togglePick = (id: string) => {
        setPicked((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleAdd = () => {
        if (!picked.size) return;
        addContacts.mutate(
            { id: group._id, contactIds: Array.from(picked) },
            {
                onSuccess: (res) => {
                    toast.success(`${res.added} contact(s) added`);
                    // Instantly add picked contacts to the local member list
                    const added = candidates.filter((c) => picked.has(c._id));
                    setMembers((prev) => {
                        const seen = new Set(prev.map((m) => m._id));
                        return [
                            ...prev,
                            ...added.filter((c) => !seen.has(c._id)),
                        ];
                    });
                    setPicked(new Set());
                },
                onError: (err: any) =>
                    toast.error(err?.response?.data?.message || "Failed to add"),
            },
        );
    };

    const handleRemove = (member: ContactGroup["contacts"][number]) => {
        removeContact.mutate(
            { groupId: group._id, contactId: member._id },
            {
                onSuccess: () => {
                    toast.success("Contact removed");
                    setMembers((prev) => prev.filter((m) => m._id !== member._id));
                    setPicked((prev) => {
                        const next = new Set(prev);
                        next.delete(member._id);
                        return next;
                    });
                },
                onError: (err: any) =>
                    toast.error(
                        err?.response?.data?.message || "Failed to remove",
                    ),
            },
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
            <div className="absolute inset-0" onClick={onClose} />
            <div className="relative flex h-full w-full max-w-lg flex-col bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">{group.name}</h2>
                        <p className="text-xs text-gray-400">
                            {members.length} member{members.length === 1 ? "" : "s"}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 transition hover:bg-gray-100"
                    >
                        <CloseOutlined />
                    </button>
                </div>

                <div className="border-b border-gray-100 p-4">
                    <div className="relative">
                        <SearchOutlined className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search members or contacts to add…"
                            className={`${inputCls} pl-10`}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-3">
                    <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                        Add to group
                    </p>
                    {loadingContacts ? (
                        <CenteredSpinner label="Searching…" />
                    ) : candidates.length === 0 ? (
                        <p className="px-2 py-4 text-xs text-gray-400">
                            No matching contacts outside this group.
                        </p>
                    ) : (
                        <div className="space-y-1">
                            {candidates.slice(0, 20).map((c) => {
                                const on = picked.has(c._id);
                                return (
                                    <button
                                        key={c._id}
                                        onClick={() => togglePick(c._id)}
                                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                                            on
                                                ? "bg-emerald-50 ring-1 ring-emerald-200"
                                                : "hover:bg-gray-50"
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={on}
                                            readOnly
                                            className="h-4 w-4 rounded accent-emerald-600"
                                        />
                                        <Avatar
                                            name={c.name || c.pushName}
                                            size="sm"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-gray-900">
                                                {c.name || c.pushName || "Unknown"}
                                            </p>
                                            <p className="font-mono text-xs text-gray-400">
                                                {fmtPhone(c.phoneNumber)}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    <p className="mb-2 mt-6 px-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                        Current members ({filteredMembers.length})
                    </p>
                    {members.length === 0 ? (
                        <p className="px-2 py-2 text-xs text-gray-400">No members yet.</p>
                    ) : filteredMembers.length === 0 ? (
                        <p className="px-2 py-2 text-xs text-gray-400">
                            No members match “{search}”.
                        </p>
                    ) : (
                        <div className="space-y-1">
                            {filteredMembers.map((m) => (
                                <div
                                    key={m._id}
                                    className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                                >
                                    <Avatar name={m.name} size="sm" />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-gray-900">
                                            {m.name || "Unknown"}
                                        </p>
                                        <p className="font-mono text-xs text-gray-400">
                                            {fmtPhone(m.phoneNumber)}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleRemove(m)}
                                        title="Remove from group"
                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                                    >
                                        <DeleteOutlined />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-gray-100 px-6 py-4">
                    <span className="text-xs text-gray-400">
                        {picked.size} selected
                    </span>
                    <PrimaryButton onClick={handleAdd} disabled={!picked.size || addContacts.isPending}>
                        {addContacts.isPending ? <Spinner /> : <UserAddOutlined />} Add selected
                    </PrimaryButton>
                </div>
            </div>
        </div>
    );
};

export default ContactGroupsPage;
