import React, { useState } from "react";
import {
    FileImageOutlined,
    MessageOutlined,
    WarningOutlined,
} from "@ant-design/icons";
import { Field, inputCls } from "@/features/crm/components/CrmUi";
import type { MediaType } from "../types/bot.types";

/** The only two kinds of reply a rule can send. */
const REPLY_KINDS: Array<{ value: MediaType; label: string; icon: React.ReactNode }> = [
    { value: "text", label: "Text", icon: <MessageOutlined /> },
    { value: "image", label: "Image", icon: <FileImageOutlined /> },
];

/** Thumbnail so a pasted link can be sanity-checked before saving. */
const ImagePreview: React.FC<{ url: string }> = ({ url }) => {
    const [broken, setBroken] = useState(false);

    return (
        <div className="mt-2 flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-2">
            {broken ? (
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-red-50 text-base text-red-500">
                    <WarningOutlined />
                </span>
            ) : (
                <img
                    src={url}
                    alt="Media preview"
                    onError={() => setBroken(true)}
                    className="h-12 w-12 shrink-0 rounded-lg object-cover"
                />
            )}

            <div className="min-w-0">
                <p className="text-[11px] font-semibold text-gray-700">
                    {broken ? "This link didn't load" : "Image attached"}
                </p>
                <p className="truncate text-[11px] text-gray-500">{url}</p>
            </div>
        </div>
    );
};

/**
 * Reply kind + image URL for one rule. Text sends a plain message; Image
 * attaches the link, which WhatsApp downloads when sending.
 */
const RuleMediaFields: React.FC<{
    mediaType: MediaType;
    mediaUrl: string;
    onChange: (patch: { mediaType?: MediaType; mediaUrl?: string }) => void;
}> = ({ mediaType, mediaUrl, onChange }) => {
    const trimmed = mediaUrl.trim();
    // Only reachable from rules saved while more types existed.
    const legacy = mediaType !== "text" && mediaType !== "image";

    return (
        <>
            <Field
                label="Message type"
                hint={
                    mediaType === "image"
                        ? "The reply text becomes the image caption."
                        : "Plain text reply. Switch to Image to send a picture."
                }
            >
                <div className="inline-flex items-center gap-1 rounded-xl bg-gray-100 p-1">
                    {REPLY_KINDS.map((k) => (
                        <button
                            key={k.value}
                            type="button"
                            onClick={() => onChange({ mediaType: k.value })}
                            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                mediaType === k.value
                                    ? "bg-white text-emerald-700 shadow-sm"
                                    : "text-gray-600 hover:text-gray-900"
                            }`}
                        >
                            {k.icon}
                            {k.label}
                        </button>
                    ))}
                </div>
            </Field>

            {legacy && (
                <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-700 sm:col-span-2">
                    <WarningOutlined />
                    This rule still uses “{mediaType}”. Pick Image to move it over.
                </div>
            )}

            {mediaType === "image" && (
                <>
                    <Field
                        label="Image URL"
                        hint="Public link — the bot downloads it when sending."
                    >
                        <input
                            value={mediaUrl}
                            onChange={(e) =>
                                onChange({ mediaUrl: e.target.value })
                            }
                            placeholder="https://example.com/photo.jpg"
                            className={inputCls}
                        />
                    </Field>

                    {!!trimmed && (
                        <div className="sm:col-span-2">
                            <ImagePreview url={trimmed} />
                        </div>
                    )}
                </>
            )}
        </>
    );
};

export default RuleMediaFields;
