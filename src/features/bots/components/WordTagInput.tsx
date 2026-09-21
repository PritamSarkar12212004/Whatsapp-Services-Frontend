import React, { useState } from "react";
import { CloseOutlined } from "@ant-design/icons";

/** "price, rate, charges" → ["price", "rate", "charges"] */
const splitWords = (value: string) =>
    String(value ?? "")
        .split(",")
        .map((w) => w.trim())
        .filter(Boolean);

const joinWords = (words: string[]) => words.join(", ");

/**
 * Comma-separated list edited as tags: type a word, press Enter and it becomes
 * a chip so the next word can be typed straight away.
 */
const WordTagInput: React.FC<{
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}> = ({ value, onChange, placeholder = "Type a word and press Enter" }) => {
    const [pending, setPending] = useState("");
    const words = splitWords(value);

    const commit = (raw: string) => {
        const parts = splitWords(raw);
        if (!parts.length) return;

        // Case-insensitive duplicate guard, keeps the first spelling.
        const next = [...words];
        for (const part of parts) {
            if (!next.some((w) => w.toLowerCase() === part.toLowerCase())) {
                next.push(part);
            }
        }

        onChange(joinWords(next));
        setPending("");
    };

    const removeWord = (word: string) =>
        onChange(joinWords(words.filter((w) => w !== word)));

    return (
        <div className="flex w-full flex-wrap items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-2.5 py-2 transition focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100">
            {words.map((word) => (
                <span
                    key={word}
                    className="inline-flex max-w-full items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700"
                >
                    <span className="truncate">{word}</span>

                    <button
                        type="button"
                        onClick={() => removeWord(word)}
                        title={`Remove ${word}`}
                        className="cursor-pointer text-[10px] text-emerald-700 transition hover:text-red-500"
                    >
                        <CloseOutlined />
                    </button>
                </span>
            ))}

            <input
                value={pending}
                onChange={(e) => {
                    const raw = e.target.value;

                    // A comma is the "and the next word" gesture too.
                    if (raw.includes(",")) {
                        commit(raw);
                        return;
                    }
                    setPending(raw);
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === "Tab") {
                        if (pending.trim()) {
                            e.preventDefault();
                            commit(pending);
                        }
                        return;
                    }
                    if (e.key === "Backspace" && !pending && words.length) {
                        onChange(joinWords(words.slice(0, -1)));
                    }
                }}
                onBlur={() => pending.trim() && commit(pending)}
                placeholder={words.length ? "" : placeholder}
                className="min-w-[8rem] flex-1 bg-transparent px-1 py-1 text-sm text-gray-900 outline-none placeholder:text-gray-400"
            />
        </div>
    );
};

export default WordTagInput;
