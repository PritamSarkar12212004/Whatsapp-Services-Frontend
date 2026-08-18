import React, { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { toast } from "sonner";
import {
    PlusOutlined,
    TagsOutlined,
    EditOutlined,
    DeleteOutlined,
    CheckOutlined,
} from "@ant-design/icons";
import {
    useCreateTag,
    useDeleteTag,
    useTags,
    useUpdateTag,
} from "../hooks/useCrm";
import {
    CenteredSpinner,
    DangerButton,
    EmptyState,
    Field,
    Modal,
    PrimaryButton,
    SecondaryButton,
    Spinner,
    inputCls,
} from "../components/CrmUi";
import type { Tag } from "../types/crm.types";

const PALETTE = [
    "#ef4444",
    "#f97316",
    "#f59e0b",
    "#10b981",
    "#14b8a6",
    "#06b6d4",
    "#3b82f6",
    "#6366f1",
    "#8b5cf6",
    "#d946ef",
    "#ec4899",
    "#6b7280",
];

const TagsPage: React.FC = () => {
    const { data: tags, isLoading } = useTags();

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Tag | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Tag | null>(null);

    const deleteTag = useDeleteTag();

    return (
        <MainLayout>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Tags</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Categorize and filter contacts with color-coded tags
                    </p>
                </div>
                <PrimaryButton
                    onClick={() => {
                        setEditing(null);
                        setModalOpen(true);
                    }}
                >
                    <PlusOutlined /> New Tag
                </PrimaryButton>
            </div>

            {isLoading ? (
                <CenteredSpinner label="Loading tags…" />
            ) : !tags?.length ? (
                <EmptyState
                    icon={<TagsOutlined />}
                    title="No tags yet"
                    description="Create tags like 'VIP', 'lead' or 'inactive' to organize your contacts."
                    action={
                        <PrimaryButton
                            onClick={() => {
                                setEditing(null);
                                setModalOpen(true);
                            }}
                        >
                            <PlusOutlined /> Create your first tag
                        </PrimaryButton>
                    }
                />
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {tags.map((t) => (
                        <div
                            key={t._id}
                            className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md"
                        >
                            <span
                                className="h-9 w-9 shrink-0 rounded-xl"
                                style={{ backgroundColor: t.color }}
                            />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-gray-900">
                                    {t.name}
                                </p>
                                <p className="font-mono text-[11px] text-gray-400">{t.color}</p>
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => {
                                        setEditing(t);
                                        setModalOpen(true);
                                    }}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                                >
                                    <EditOutlined />
                                </button>
                                <button
                                    onClick={() => setDeleteTarget(t)}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                                >
                                    <DeleteOutlined />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create / edit modal */}
            <TagFormModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                editing={editing}
            />

            {/* Delete confirm */}
            <Modal
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                title="Delete tag"
                footer={
                    <>
                        <SecondaryButton onClick={() => setDeleteTarget(null)}>
                            Cancel
                        </SecondaryButton>
                        <DangerButton
                            onClick={() =>
                                deleteTag.mutate(deleteTarget!._id, {
                                    onSuccess: () => {
                                        toast.success("Tag deleted");
                                        setDeleteTarget(null);
                                    },
                                    onError: (err: any) =>
                                        toast.error(
                                            err?.response?.data?.message || "Delete failed",
                                        ),
                                })
                            }
                            disabled={deleteTag.isPending}
                        >
                            {deleteTag.isPending ? <Spinner /> : <DeleteOutlined />} Delete
                        </DangerButton>
                    </>
                }
            >
                <p className="text-sm text-gray-600">
                    Delete tag <strong>{deleteTarget?.name}</strong>? Contacts keep their data —
                    the tag is removed from them.
                </p>
            </Modal>
        </MainLayout>
    );
};

const TagFormModal: React.FC<{
    open: boolean;
    onClose: () => void;
    editing: Tag | null;
}> = ({ open, onClose, editing }) => {
    const createTag = useCreateTag();
    const updateTag = useUpdateTag();

    const [name, setName] = useState("");
    const [color, setColor] = useState(PALETTE[3]);

    useEffect(() => {
        if (open) {
            setName(editing?.name || "");
            setColor(editing?.color || PALETTE[3]);
        }
    }, [open, editing]);

    const submit = () => {
        if (!name.trim()) {
            toast.error("Tag name is required");
            return;
        }
        const payload = { name: name.trim(), color };
        if (editing) {
            updateTag.mutate(
                { id: editing._id, input: payload },
                {
                    onSuccess: () => {
                        toast.success("Tag updated");
                        onClose();
                    },
                    onError: (err: any) =>
                        toast.error(err?.response?.data?.message || "Update failed"),
                },
            );
        } else {
            createTag.mutate(payload, {
                onSuccess: () => {
                    toast.success("Tag created");
                    onClose();
                },
                onError: (err: any) =>
                    toast.error(err?.response?.data?.message || "Create failed"),
            });
        }
    };

    const pending = createTag.isPending || updateTag.isPending;

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={editing ? "Edit tag" : "New tag"}
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
                <Field label="Tag name" required>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. VIP"
                        className={inputCls}
                    />
                </Field>
                <Field label="Color">
                    <div className="flex flex-wrap items-center gap-2">
                        {PALETTE.map((c) => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setColor(c)}
                                className={`h-8 w-8 rounded-full transition ${
                                    color === c
                                        ? "ring-2 ring-gray-900 ring-offset-2"
                                        : "hover:scale-110"
                                }`}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                        <label className="ml-auto flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50">
                            Custom
                            <input
                                type="color"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="h-6 w-8 cursor-pointer border-0 bg-transparent p-0"
                            />
                        </label>
                    </div>
                </Field>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-xs">Preview:</span>
                    <span
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                        style={{
                            backgroundColor: `${color}1a`,
                            color,
                        }}
                    >
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
                        {name || "tag name"}
                    </span>
                </div>
            </div>
        </Modal>
    );
};

export default TagsPage;
