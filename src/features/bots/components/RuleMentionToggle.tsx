import React from "react";

/**
 * One switch per rule: tag the person who sent the matched message (@their
 * handle) so the reply shows up as a mention in a busy group.
 *
 * The knob is an inline colour on purpose — `bg-white` is remapped to the dark
 * surface, which would make it invisible on the emerald track.
 */
const RuleMentionToggle: React.FC<{
    mention: boolean;
    onChange: (mention: boolean) => void;
}> = ({ mention, onChange }) => (
    <div className="flex flex-wrap items-center gap-2">
        <button
            type="button"
            role="switch"
            aria-checked={mention}
            onClick={() => onChange(!mention)}
            title={
                mention
                    ? "The reply tags the sender"
                    : "The reply is a plain message in the group"
            }
            className={`relative h-5 w-9 shrink-0 cursor-pointer rounded-full transition ${
                mention ? "bg-emerald-600" : "bg-gray-300"
            }`}
        >
            <span
                style={{ backgroundColor: "#ffffff" }}
                className={`absolute top-0.5 h-4 w-4 rounded-full shadow transition-all ${
                    mention ? "left-[18px]" : "left-0.5"
                }`}
            />
        </button>

        <span className="text-xs font-semibold text-gray-600">Tag the sender</span>

        <span className="text-[11px] text-gray-400">
            {mention
                ? "the reply starts with @their handle, so they get tagged"
                : "plain message in the group"}
        </span>
    </div>
);

export default RuleMentionToggle;
