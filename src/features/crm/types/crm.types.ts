export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export interface ApiResponse<T> {
  status: "success" | "error";
  message?: string;
  data: T;
  pagination?: Pagination;
}

// ---------------------------------------------------------------- Contacts

export interface ContactTagRef {
  _id: string;
  name: string;
  color?: string;
}

export interface ContactGroupRef {
  _id: string;
  name: string;
}

export interface CustomField {
  key: string;
  value: string;
}

export interface Contact {
  _id: string;
  owner: string;
  phoneNumber: string;
  name: string | null;
  pushName: string | null;
  profilePicture: string | null;
  isSavedContact: boolean;
  isUnknown: boolean;
  isBusiness: boolean;
  tags: ContactTagRef[];
  customGroups: ContactGroupRef[];
  customFields: CustomField[];
  language: string | null;
  city: string | null;
  state: string | null;
  isBlocked: boolean;
  isOptedOut: boolean;
  lastMessageAt: string | null;
  lastSeenAt: string | null;
  whatsappJid: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContactInput {
  phoneNumber: string;
  name?: string | null;
  pushName?: string | null;
  city?: string | null;
  state?: string | null;
  language?: string | null;
  isSavedContact?: boolean;
  isUnknown?: boolean;
  isBusiness?: boolean;
  isBlocked?: boolean;
  isOptedOut?: boolean;
  customFields?: CustomField[];
  tags?: string[];
  customGroups?: string[];
}

export interface ContactsListResponse {
  data: Contact[];
  pagination: Pagination;
}

export interface ContactSyncResult {
  found: number;
  inserted: number;
  updated: number;
  skippedGroups: number;
  skippedInvalid: number;
  skippedSelf: number;
}

export interface ImportResult {
  total: number;
  created: number;
  updated: number;
  duplicates: number;
  invalid: number;
  invalidRows?: { row: number; raw: unknown; reason: string }[];
}

// ------------------------------------------------------------ Contact groups

export interface ContactGroup {
  _id: string;
  owner: string;
  name: string;
  description: string;
  contacts: { _id: string; name: string | null; phoneNumber: string }[];
  createdAt: string;
  updatedAt: string;
}

// --------------------------------------------------------------------- Tags

export interface Tag {
  _id: string;
  owner: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

// --------------------------------------------------------------- Templates

// Free-form string — built-in values are otp / transactional / promotional /
// notification / custom, but users can create their own categories.
export type TemplateCategory = string;

export type TemplateType = "text" | "image" | "video" | "audio" | "document";

export type TemplateStatus = "active" | "inactive" | "draft";

export interface Template {
  _id: string;
  owner: string;
  name: string;
  category: TemplateCategory;
  type: TemplateType;
  content: string;
  variables: string[];
  media: {
    url: string | null;
    filename: string | null;
    mimeType: string | null;
    caption: string | null;
  } | null;
  status: TemplateStatus;
  devMode?: boolean;
  /** Dev mode: schedule flag — caller sends scheduledAt (24h) in the API call */
  scheduleEnabled?: boolean;
  /** Dev templates are API-enabled only when linked to >=1 campaign */
  inCampaignCount?: number;
  apiEnabled?: boolean;
  /** off = no campaign · added = in campaign, not running · paused = all paused · live = >=1 running */
  gateState?: "enabled" | "off" | "added" | "paused" | "live";
  createdAt: string;
  updatedAt: string;
}

// -------------------------------------------------------------- Campaigns

export type CampaignStatus =
  | "draft"
  | "scheduled"
  | "queued"
  | "running"
  | "paused"
  | "completed"
  | "cancelled"
  | "failed";

export interface CampaignAudience {
  groups: string[];
  tags: string[];
  contacts: string[];
  excludedContacts: string[];
}

export interface CampaignStatistics {
  total: number;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  skipped: number;
}

export interface Campaign {
  _id: string;
  owner: string;
  name: string;
  template:
    | string
    | {
        _id: string;
        name: string;
        category?: TemplateCategory;
        type?: TemplateType;
        content?: string;
        variables?: string[];
        media?: Template["media"];
      };
  audience: CampaignAudience;
  variables: Record<string, string>;
  status: CampaignStatus;
  scheduledAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  sendLimit?: number | null;
  statistics: CampaignStatistics;
  /** Dev campaigns are live switches — they never send to an audience */
  devTemplate?: boolean;
  devStats?: { liveSince: string | null; apiCalls: number };
  createdAt: string;
  updatedAt: string;
}

export interface DevNumberStat {
  number: string;
  count: number;
  sent: number;
  failed: number;
  queued: number;
  lastSentAt: string | null;
}

export interface DevPipelineMessage {
  id: string;
  number: string;
  status: string;
  type: string;
  scheduledAt: string | null;
  sentAt: string | null;
  createdAt: string;
}

export interface CampaignDevStats {
  status?: string;
  scheduledAt?: string | null;
  liveSince: string | null;
  uptimeSeconds?: number | null;
  apiCalls: number;
  sent: number;
  failed: number;
  queued: number;
  total: number;
  uniqueNumbers?: number;
  perNumber?: DevNumberStat[];
  pipeline?: DevPipelineMessage[];
}

export interface CampaignRecipient {
  _id: string;
  campaign: string;
  contact: { _id: string; name: string | null; phoneNumber: string } | null;
  phoneNumber: string;
  sequence?: number;
  renderedMessage: string;
  status: string;
  error?: string | null;
  sentAt?: string | null;
  deliveredAt?: string | null;
  readAt?: string | null;
  createdAt: string;
}

export interface AudiencePreview {
  total: number;
  people?: number;
  sendsPerContact?: number;
  excluded: number;
  template: { name: string; content: string } | null;
  contacts: { _id: string; phoneNumber: string; name: string | null }[];
}

export interface ActivityEntry {
  _id: string;
  contact: string;
  action: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// --------------------------------------------------------------- Messages

export type MessageDirection = "inbound" | "outbound";

export type MessageStatus =
  | "pending"
  | "queued"
  | "sending"
  | "sent"
  | "delivered"
  | "read"
  | "failed";

export interface Message {
  _id: string;
  owner: string;
  contact: { _id: string; name: string | null; phoneNumber: string } | null;
  campaign: { _id: string; name: string } | null;
  direction: MessageDirection;
  type: string;
  content: string | null;
  media: Template["media"];
  to: string | null;
  whatsappMessageId: string | null;
  status: MessageStatus;
  error: string | null;
  sentAt: string | null;
  deliveredAt: string | null;
  readAt: string | null;
  failedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
