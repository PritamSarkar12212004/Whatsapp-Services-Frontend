import React, { useMemo, useRef, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { useStoreBascData } from "@/store/zustand/user/useStoreBascData";
import { useStoreToken } from "@/store/zustand/token/useStoreToken";
import { useWhatsappProfile } from "@/features/settings/hooks/useWhatsappProfile";
import { useUpdateWhatsappProfile } from "@/features/settings/hooks/useUpdateWhatsappProfile";
import { toast } from "sonner";
import {
    CheckOutlined,
    CopyOutlined,
    EyeInvisibleOutlined,
    EyeOutlined,
    KeyOutlined,
    UserOutlined,
    WhatsAppOutlined,
} from "@ant-design/icons";

interface ApiError extends Error {
    response?: {
        data?: {
            message?: string;
        };
    };
}

const SettingsPage: React.FC = () => {
    const user = useStoreBascData((state) => state.user);
    const token = useStoreToken((state) => state.token);
    const { data: waProfile, isLoading: isWaProfileLoading } =
        useWhatsappProfile();

    const fullName = user?.fullName || "User";
    const phone = user?.wpnumber || "—";
    const gender = user?.gender
        ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1)
        : "—";
    const age = user?.age ?? "—";

    const initials = useMemo(() => {
        const parts = String(fullName).trim().split(/\s+/);
        const first = parts[0]?.[0] || "U";
        const last = parts[1]?.[0] || "";
        return (first + last).toUpperCase();
    }, [fullName]);

    const waName = waProfile?.data?.name || null;
    const waAbout = waProfile?.data?.about || null;
    const waPhone = waProfile?.data?.phoneNumber || null;
    const waPic = waProfile?.data?.profilePicUrl || null;

    const [showToken, setShowToken] = useState(false);
    const [copied, setCopied] = useState(false);

    const [nameDraft, setNameDraft] = useState("");
    const [aboutDraft, setAboutDraft] = useState("");
    const [photoDraft, setPhotoDraft] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const { updateName, updateAbout, updatePicture } =
        useUpdateWhatsappProfile();
    const isSaving =
        updateName.isPending ||
        updateAbout.isPending ||
        updatePicture.isPending;

    // Keep the draft fields in sync with the loaded profile data (adjusting
    // state during render is the recommended pattern for prop -> state sync).
    const [prevWaName, setPrevWaName] = useState(waName);
    if (prevWaName !== waName) {
        setPrevWaName(waName);
        setNameDraft(waName ?? "");
    }

    const [prevWaAbout, setPrevWaAbout] = useState(waAbout);
    if (prevWaAbout !== waAbout) {
        setPrevWaAbout(waAbout);
        setAboutDraft(waAbout ?? "");
    }

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 3 * 1024 * 1024) {
            toast.error("Please choose an image smaller than 3MB");
            e.target.value = "";
            return;
        }

        const reader = new FileReader();
        reader.onload = () => setPhotoDraft(String(reader.result));
        reader.readAsDataURL(file);
    };

    const handleCopyToken = async () => {
        if (!token) return;

        try {
            await navigator.clipboard.writeText(token);
            setCopied(true);
            toast.success("Token copied to clipboard");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Failed to copy token");
        }
    };

    const handleSaveProfile = () => {
        const tasks: Promise<unknown>[] = [];

        if (nameDraft.trim() && nameDraft.trim() !== (waName || "")) {
            tasks.push(updateName.mutateAsync(nameDraft.trim()));
        }

        if (aboutDraft !== (waAbout || "")) {
            tasks.push(updateAbout.mutateAsync(aboutDraft));
        }

        if (photoDraft) {
            tasks.push(updatePicture.mutateAsync(photoDraft));
        }

        if (!tasks.length) {
            toast.info("No changes to save");
            return;
        }

        Promise.all(tasks)
            .then(() => {
                setPhotoDraft(null);
                toast.success("WhatsApp profile updated");
            })
            .catch((err: ApiError) => {
                toast.error(
                    err?.response?.data?.message ||
                        "Failed to update profile",
                );
            });
    };

    return (
        <MainLayout>
            <div className="flex h-full flex-col">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">
                            Settings
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Your account and connected WhatsApp
                        </p>
                    </div>
                </div>

                {/* Settings Content */}
                <div className="flex-1 overflow-y-auto py-6">
                    <div className="max-w-3xl space-y-6">
                        {/* Profile Section */}
                        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                                    <UserOutlined />
                                </div>

                                <div>
                                    <h2 className="text-sm font-semibold text-gray-900">
                                        Profile
                                    </h2>

                                    <p className="text-xs text-gray-500">
                                        Your account details
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center gap-4">
                                {user?.profilePic ? (
                                    <img
                                        src={user.profilePic}
                                        alt={fullName}
                                        className="h-16 w-16 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-lg font-bold text-emerald-700">
                                        {initials}
                                    </div>
                                )}

                                <div className="min-w-0">
                                    <p className="truncate text-lg font-semibold text-gray-900">
                                        {fullName}
                                    </p>

                                    <p className="text-sm text-gray-500">
                                        +91 {phone}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div className="rounded-lg bg-gray-50 p-4">
                                    <p className="text-xs font-medium text-gray-500">
                                        Full Name
                                    </p>

                                    <p className="mt-1 truncate text-sm font-semibold text-gray-900">
                                        {fullName}
                                    </p>
                                </div>

                                <div className="rounded-lg bg-gray-50 p-4">
                                    <p className="text-xs font-medium text-gray-500">
                                        Phone Number
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-gray-900">
                                        +91 {phone}
                                    </p>
                                </div>

                                <div className="rounded-lg bg-gray-50 p-4">
                                    <p className="text-xs font-medium text-gray-500">
                                        Gender
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-gray-900">
                                        {gender}
                                    </p>
                                </div>

                                <div className="rounded-lg bg-gray-50 p-4">
                                    <p className="text-xs font-medium text-gray-500">
                                        Age
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-gray-900">
                                        {age}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* WhatsApp Profile Section */}
                        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                                    <WhatsAppOutlined />
                                </div>

                                <div>
                                    <h2 className="text-sm font-semibold text-gray-900">
                                        WhatsApp Profile
                                    </h2>

                                    <p className="text-xs text-gray-500">
                                        Edit your connected WhatsApp account
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center gap-4">
                                {photoDraft ? (
                                    <img
                                        src={photoDraft}
                                        alt="New profile picture"
                                        className="h-16 w-16 rounded-full object-cover"
                                    />
                                ) : waPic ? (
                                    <img
                                        src={waPic}
                                        alt={waName || "WhatsApp profile"}
                                        className="h-16 w-16 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-lg text-emerald-700">
                                        <WhatsAppOutlined />
                                    </div>
                                )}

                                <div className="min-w-0">
                                    <p className="truncate text-lg font-semibold text-gray-900">
                                        {nameDraft || waName || "WhatsApp User"}
                                    </p>

                                    <p className="text-sm text-gray-500">
                                        {waPhone ? `+${waPhone}` : "—"}
                                    </p>
                                </div>

                                <div className="ml-auto shrink-0">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoChange}
                                        className="hidden"
                                    />

                                    <button
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                        className="cursor-pointer rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
                                    >
                                        Change Photo
                                    </button>
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-gray-600">
                                        Display Name
                                    </label>

                                    <input
                                        type="text"
                                        value={nameDraft}
                                        onChange={(e) =>
                                            setNameDraft(e.target.value)
                                        }
                                        placeholder="WhatsApp name"
                                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-gray-600">
                                        About
                                    </label>

                                    <input
                                        type="text"
                                        value={aboutDraft}
                                        onChange={(e) =>
                                            setAboutDraft(e.target.value)
                                        }
                                        placeholder="About / status text"
                                        maxLength={139}
                                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:bg-white"
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex items-center gap-3">
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={isSaving}
                                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isSaving ? "Saving..." : "Save Profile"}
                                </button>

                                {isWaProfileLoading && (
                                    <p className="text-xs text-gray-400">
                                        Loading profile...
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* API Token Section */}
                        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                                    <KeyOutlined />
                                </div>

                                <div>
                                    <h2 className="text-sm font-semibold text-gray-900">
                                        API Access
                                    </h2>

                                    <p className="text-xs text-gray-500">
                                        Your authentication token for the messaging API
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6">
                                <label className="mb-1.5 block text-xs font-medium text-gray-600">
                                    API Token
                                </label>

                                <div className="flex items-center gap-2">
                                    <div className="min-w-0 flex-1 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
                                        <code className="block truncate font-mono text-sm text-gray-700">
                                            {showToken
                                                ? token || "No token found"
                                                : "••••••••••••••••••••••••"}
                                        </code>
                                    </div>

                                    <button
                                        onClick={() => setShowToken((v) => !v)}
                                        title={showToken ? "Hide token" : "Show token"}
                                        className="shrink-0 rounded-lg border border-gray-200 px-3 py-2.5 text-gray-600 transition hover:bg-gray-50"
                                    >
                                        {showToken ? (
                                            <EyeInvisibleOutlined />
                                        ) : (
                                            <EyeOutlined />
                                        )}
                                    </button>

                                    <button
                                        onClick={handleCopyToken}
                                        disabled={!token}
                                        className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {copied ? (
                                            <CheckOutlined />
                                        ) : (
                                            <CopyOutlined />
                                        )}
                                        {copied ? "Copied" : "Copy"}
                                    </button>
                                </div>

                                <p className="mt-2 text-xs text-gray-400">
                                    Use this token in the Authorization header:{" "}
                                    <code className="rounded bg-gray-100 px-1 py-0.5 font-mono">
                                        Bearer &lt;token&gt;
                                    </code>
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default SettingsPage;