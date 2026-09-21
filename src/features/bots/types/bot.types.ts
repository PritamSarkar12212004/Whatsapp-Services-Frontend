export type BotStatus = "active" | "inactive";

export type TriggerType =
    | "any"
    | "exact"
    | "contains"
    | "starts_with"
    | "ends_with"
    | "regex"
    | "keyword"
    | "command"
    | "new_member"
    | "returning_member"
    | "new_customer"
    | "returning_customer";

export type MediaType =
    | "text"
    | "image"
    | "video"
    | "audio"
    | "document"
    | "sticker"
    | "location"
    | "contact";

export type BotCategory =
    | "filter_message"
    | "general"
    | "support"
    | "sales"
    | "booking"
    | "community"
    | "moderation"
    | "custom";

export type BotLanguage = "en" | "hi" | "hinglish";

export interface BotTrigger {
    _id?: string;
    name: string;
    type: TriggerType;
    value: string;
    caseSensitive: boolean;
    reply: string;
    mediaType: MediaType;
    mediaUrl: string | null;
    /** Start the reply with @their handle so the sender is tagged. */
    mention?: boolean;
    enabled: boolean;
    priority: number;
    delayMs: number;
    cooldownSec: number;
    hits?: number;
}

export interface BotWorkingHours {
    enabled: boolean;
    start: string;
    end: string;
    days: number[];
}

export interface BotBehavior {
    autoReply: boolean;
    typingIndicator: boolean;
    readMessages: boolean;
    replyDelayMs: number;
    randomDelayMs: number;
    humanHandoff: boolean;
    handoffMessage: string;
    workingHours: BotWorkingHours;
    awayMessage: string;
    welcomeMessage: string;
    goodbyeMessage: string;
}

export interface BotGroupLink {
    _id?: string;
    jid: string;
    subject: string;
    enabled: boolean;
    activatedAt?: string | null;
}

export interface BotStats {
    received?: number;
    matched?: number;
    replied?: number;
    failed?: number;
    handoffs?: number;
    lastActiveAt?: string | null;
}

export interface Bot {
    _id: string;
    name: string;
    description: string;
    emoji: string;
    color?: string;
    category: BotCategory;
    language: BotLanguage;
    timezone: string;
    status: BotStatus;
    behavior: BotBehavior;
    triggers: BotTrigger[];
    groups: BotGroupLink[];
    stats: BotStats;
    createdAt: string;
    updatedAt: string;
}

export interface BotInput {
    name?: string;
    description?: string;
    emoji?: string;
    category?: BotCategory;
    language?: BotLanguage;
    timezone?: string;
    status?: BotStatus;
    behavior?: BotBehavior;
    triggers?: BotTrigger[];
}

/**
 * Bots switched on in one group. The endpoint sends a slimmer shape than
 * `Bot`: `triggers` is already the NUMBER of enabled triggers, and the
 * behaviour / group list are not included.
 */
export interface GroupAttachedBot {
    _id: string;
    name: string;
    emoji: string;
    status: BotStatus;
    triggers: number;
    stats: BotStats;
}

export interface GroupBotsResponse {
    attached: GroupAttachedBot[];
    available: Array<Pick<Bot, "_id" | "name" | "emoji" | "status">>;
}

/**
 * Enabled trigger count, tolerating both shapes (older builds sent an array,
 * the current one sends a number).
 */
export const enabledTriggerCount = (bot: { triggers?: number | BotTrigger[] }) => {
    if (typeof bot.triggers === "number") return bot.triggers;
    if (Array.isArray(bot.triggers)) {
        return bot.triggers.filter((t) => t.enabled !== false).length;
    }
    return 0;
};

export interface SimulateResult {
    matched: boolean;
    trigger: { id: string; name: string; type: TriggerType; value: string } | null;
    reply: string;
    mediaType?: MediaType;
    mediaUrl?: string | null;
    delayMs?: number;
    note?: string;
}

/** Every trigger type with the label + hint shown in the builder. */
export const TRIGGER_TYPES: Array<{
    value: TriggerType;
    label: string;
    hint: string;
}> = [
    { value: "any", label: "Any message", hint: "Fires on every message (use as a fallback, priority 999)" },
    { value: "exact", label: "Exact text", hint: "Message equals this text" },
    { value: "contains", label: "Contains text", hint: "Message contains this text anywhere" },
    { value: "starts_with", label: "Starts with", hint: "Message begins with this text" },
    { value: "ends_with", label: "Ends with", hint: "Message ends with this text" },
    { value: "regex", label: "Regex", hint: "Advanced pattern, e.g. \\b\\d{4}\\b" },
    { value: "keyword", label: "Keywords", hint: "Comma separated list — any word matching fires" },
    { value: "command", label: "Command", hint: "!command style, e.g. help → !help" },
    { value: "new_member", label: "New member", hint: "First message from this person in the group" },
    { value: "returning_member", label: "Returning member", hint: "Any later message from this person" },
    { value: "new_customer", label: "New customer", hint: "First message from this person in the group" },
    { value: "returning_customer", label: "Returning customer", hint: "Any later message from this person" },
];

// The API still accepts video / audio / document / sticker, but the UI only
// offers Text and Image — see RuleMediaFields.

export const BOT_CATEGORIES: Array<{ value: BotCategory; label: string }> = [
    { value: "filter_message", label: "Filter Message" },
    { value: "general", label: "General" },
    { value: "support", label: "Support" },
    { value: "sales", label: "Sales" },
    { value: "booking", label: "Booking" },
    { value: "community", label: "Community" },
    { value: "moderation", label: "Moderation" },
    { value: "custom", label: "Custom" },
];

export const BOT_LANGUAGES: Array<{ value: BotLanguage; label: string }> = [
    { value: "en", label: "English" },
    { value: "hi", label: "हिन्दी" },
    { value: "hinglish", label: "Hinglish" },
];

/** A blank trigger row for the builder. */
export const emptyTrigger = (): BotTrigger => ({
    name: "",
    type: "contains",
    value: "",
    caseSensitive: false,
    reply: "",
    mediaType: "text",
    mediaUrl: null,
    enabled: true,
    priority: 100,
    delayMs: 0,
    cooldownSec: 5,
});
