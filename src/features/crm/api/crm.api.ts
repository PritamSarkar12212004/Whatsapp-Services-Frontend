import api from "@/utils/api/api";
import apiConst from "@/consts/api/apiConst";
import type {
  ApiResponse,
  AudiencePreview,
  Campaign,
  CampaignDevStats,
  CampaignRecipient,
  CampaignStatus,
  Contact,
  ContactGroup,
  ContactInput,
  ContactSyncResult,
  ContactsListResponse,
  ImportResult,
  Message,
  MessageDirection,
  MessageStatus,
  Pagination,
  Tag,
  Template,
} from "../types/crm.types";

const { Crm } = apiConst;

export interface ContactListParams {
  page?: number;
  limit?: number;
  search?: string;
  known?: boolean;
  unknown?: boolean;
  blocked?: boolean;
  optedOut?: boolean;
  genuine?: boolean;
  groupId?: string;
  tagId?: string;
  isBusiness?: boolean;
}

// ------------------------------------------------------------------ Contacts

export const fetchContacts = async (
  params: ContactListParams = {},
): Promise<ContactsListResponse> => {
  const res = await api.get<ApiResponse<Contact[]>>(Crm.contacts, {
    params: {
      page: params.page || 1,
      limit: params.limit || 20,
      search: params.search || undefined,
      known: params.known || undefined,
      unknown: params.unknown || undefined,
      blocked: params.blocked || undefined,
      optedOut: params.optedOut || undefined,
      genuine: params.genuine || undefined,
      groupId: params.groupId || undefined,
      tagId: params.tagId || undefined,
      isBusiness: params.isBusiness || undefined,
    },
  });
  return { data: res.data.data, pagination: res.data.pagination as Pagination };
};

export const fetchContact = async (id: string): Promise<Contact> => {
  const res = await api.get<ApiResponse<Contact>>(`${Crm.contacts}/${id}`);
  return res.data.data;
};

export const createContact = async (
  input: ContactInput,
): Promise<Contact> => {
  const res = await api.post<ApiResponse<Contact>>(Crm.contacts, input);
  return res.data.data;
};

export const updateContact = async (
  id: string,
  input: Partial<ContactInput>,
): Promise<Contact> => {
  const res = await api.patch<ApiResponse<Contact>>(
    `${Crm.contacts}/${id}`,
    input,
  );
  return res.data.data;
};

export const deleteContact = async (id: string): Promise<void> => {
  await api.delete(`${Crm.contacts}/${id}`);
};

export const blockContact = async (id: string): Promise<Contact> => {
  const res = await api.post<ApiResponse<Contact>>(
    `${Crm.contacts}/${id}/block`,
  );
  return res.data.data;
};

export const unblockContact = async (id: string): Promise<Contact> => {
  const res = await api.post<ApiResponse<Contact>>(
    `${Crm.contacts}/${id}/unblock`,
  );
  return res.data.data;
};

export const optOutContact = async (id: string): Promise<Contact> => {
  const res = await api.post<ApiResponse<Contact>>(
    `${Crm.contacts}/${id}/opt-out`,
  );
  return res.data.data;
};

export const setContactTags = async (
  id: string,
  tags: string[],
): Promise<Contact> => {
  const res = await api.post<ApiResponse<Contact>>(
    `${Crm.contacts}/${id}/tags`,
    { tags },
  );
  return res.data.data;
};

export const fetchContactActivities = async (
  id: string,
): Promise<{ _id: string; action: string; metadata?: unknown; createdAt: string }[]> => {
  const res = await api.get(`${Crm.contacts}/${id}/activities`);
  return res.data.data;
};

export const syncWhatsAppContacts = async (): Promise<ContactSyncResult> => {
  const res = await api.post<ApiResponse<ContactSyncResult>>(Crm.contactsSync);
  return res.data.data;
};

export const importContactsCsv = async (payload: {
  csv: string;
  updateExisting?: boolean;
  assignGroups?: string[];
  assignTags?: string[];
}): Promise<ImportResult> => {
  const res = await api.post<ApiResponse<ImportResult>>(Crm.contactsImport, payload);
  return res.data.data;
};

export const exportContactsCsv = async (params: {
  search?: string;
  groupId?: string;
  tagId?: string;
  contactIds?: string[];
} = {}) => {
  const query: Record<string, string> = {};
  if (params.search) query.search = params.search;
  if (params.groupId) query.groupId = params.groupId;
  if (params.tagId) query.tagId = params.tagId;
  if (params.contactIds?.length) query.contactIds = params.contactIds.join(",");
  const res = await api.get(Crm.contactsExport, {
    params: query,
    responseType: "blob",
  });
  return res.data as Blob;
};

// ---------------------------------------------------------- Contact groups

export const fetchContactGroups = async (): Promise<ContactGroup[]> => {
  const res = await api.get<ApiResponse<ContactGroup[]>>(Crm.contactGroups);
  return res.data.data;
};

export const createContactGroup = async (input: {
  name: string;
  description?: string;
}): Promise<ContactGroup> => {
  const res = await api.post<ApiResponse<ContactGroup>>(Crm.contactGroups, input);
  return res.data.data;
};

export const updateContactGroup = async (
  id: string,
  input: { name?: string; description?: string },
): Promise<ContactGroup> => {
  const res = await api.patch<ApiResponse<ContactGroup>>(
    `${Crm.contactGroups}/${id}`,
    input,
  );
  return res.data.data;
};

export const deleteContactGroup = async (id: string): Promise<void> => {
  await api.delete(`${Crm.contactGroups}/${id}`);
};

export const addContactsToGroup = async (
  id: string,
  contactIds: string[],
): Promise<{ added: number }> => {
  const res = await api.post(`${Crm.contactGroups}/${id}/contacts`, {
    contactIds,
  });
  return res.data.data;
};

export const removeContactFromGroup = async (
  groupId: string,
  contactId: string,
): Promise<void> => {
  await api.delete(`${Crm.contactGroups}/${groupId}/contacts/${contactId}`);
};

// -------------------------------------------------------------------- Tags

export const fetchTags = async (): Promise<Tag[]> => {
  const res = await api.get<ApiResponse<Tag[]>>(Crm.tags);
  return res.data.data;
};

export const createTag = async (input: {
  name: string;
  color?: string;
}): Promise<Tag> => {
  const res = await api.post<ApiResponse<Tag>>(Crm.tags, input);
  return res.data.data;
};

export const updateTag = async (
  id: string,
  input: { name?: string; color?: string },
): Promise<Tag> => {
  const res = await api.patch<ApiResponse<Tag>>(`${Crm.tags}/${id}`, input);
  return res.data.data;
};

export const deleteTag = async (id: string): Promise<void> => {
  await api.delete(`${Crm.tags}/${id}`);
};

// --------------------------------------------------------------- Templates

export const fetchTemplates = async (params: {
  status?: string;
  category?: string;
} = {}): Promise<Template[]> => {
  const res = await api.get<ApiResponse<Template[]>>(Crm.templates, {
    params: {
      status: params.status || undefined,
      category: params.category || undefined,
    },
  });
  return res.data.data;
};

export const createTemplate = async (input: {
  name: string;
  category: string;
  type: string;
  content: string;
  variables?: string[];
  status?: string;
}): Promise<Template> => {
  const res = await api.post<ApiResponse<Template>>(Crm.templates, input);
  return res.data.data;
};

export const updateTemplate = async (
  id: string,
  input: Partial<{
    name: string;
    category: string;
    type: string;
    content: string;
    variables: string[];
    status: string;
  }>,
): Promise<Template> => {
  const res = await api.patch<ApiResponse<Template>>(
    `${Crm.templates}/${id}`,
    input,
  );
  return res.data.data;
};

export const deleteTemplate = async (id: string): Promise<void> => {
  await api.delete(`${Crm.templates}/${id}`);
};

export const previewTemplate = async (
  id: string,
  variables: Record<string, string> = {},
): Promise<{ rendered: string }> => {
  const res = await api.post(`${Crm.templates}/${id}/preview`, { variables });
  return res.data.data;
};

// --------------------------------------------------------------- Campaigns

export interface CampaignInput {
  name: string;
  template: string;
  audience: {
    groups: string[];
    tags: string[];
    contacts: string[];
    excludedContacts: string[];
  };
  variables?: Record<string, string>;
  scheduledAt?: string | null;
}

export const fetchCampaigns = async (
  status?: CampaignStatus,
): Promise<Campaign[]> => {
  const res = await api.get<ApiResponse<Campaign[]>>(Crm.campaigns, {
    params: { status: status || undefined },
  });
  return res.data.data;
};

export const createCampaign = async (input: CampaignInput): Promise<Campaign> => {
  const res = await api.post<ApiResponse<Campaign>>(Crm.campaigns, input);
  return res.data.data;
};

export const updateCampaign = async (
  id: string,
  input: Partial<CampaignInput>,
): Promise<Campaign> => {
  const res = await api.patch<ApiResponse<Campaign>>(
    `${Crm.campaigns}/${id}`,
    input,
  );
  return res.data.data;
};

export const deleteCampaign = async (id: string): Promise<void> => {
  await api.delete(`${Crm.campaigns}/${id}`);
};

export const fetchCampaignAudience = async (
  id: string,
): Promise<AudiencePreview> => {
  const res = await api.get(`${Crm.campaigns}/${id}/audience`);
  return res.data.data;
};

export const fetchCampaignRecipients = async (
  id: string,
  params: { page?: number; limit?: number; status?: string } = {},
): Promise<{ data: CampaignRecipient[]; pagination: Pagination }> => {
  const res = await api.get(`${Crm.campaigns}/${id}/recipients`, {
    params: {
      page: params.page || 1,
      limit: params.limit || 20,
      status: params.status || undefined,
    },
  });
  return {
    data: res.data.data,
    pagination: res.data.pagination as Pagination,
  };
};

export interface CampaignStatsResponse {
  byStatus?: Record<string, number>;
  devStats?: CampaignDevStats;
  isDev?: boolean;
}

export const fetchCampaignStats = async (
  id: string,
): Promise<CampaignStatsResponse> => {
  const res = await api.get(`${Crm.campaigns}/${id}/stats`);
  return res.data.data;
};

export const startCampaign = async (id: string): Promise<Campaign> => {
  const res = await api.post(`${Crm.campaigns}/${id}/start`);
  return res.data.data;
};

export const pauseCampaign = async (id: string): Promise<Campaign> => {
  const res = await api.post(`${Crm.campaigns}/${id}/pause`);
  return res.data.data;
};

export const resumeCampaign = async (id: string): Promise<Campaign> => {
  const res = await api.post(`${Crm.campaigns}/${id}/resume`);
  return res.data.data;
};

export const cancelCampaign = async (id: string): Promise<Campaign> => {
  const res = await api.post(`${Crm.campaigns}/${id}/cancel`);
  return res.data.data;
};

export const unscheduleCampaign = async (id: string): Promise<Campaign> => {
  const res = await api.post(`${Crm.campaigns}/${id}/unschedule`);
  return res.data.data;
};

export const cancelMessage = async (id: string): Promise<unknown> => {
  const res = await api.post(`${Crm.messages}/${id}/cancel`);
  return res.data.data;
};

export const previewCampaignMessage = async (
  id: string,
  payload: { contactId?: string; phoneNumber?: string },
): Promise<{ rendered: string; contact: unknown }> => {
  const res = await api.post(`${Crm.campaigns}/${id}/preview`, payload);
  return res.data.data;
};

// --------------------------------------------------------------- Messages

export interface MessageListParams {
  page?: number;
  limit?: number;
  direction?: MessageDirection;
  status?: MessageStatus;
  contactId?: string;
  campaignId?: string;
}

export const fetchMessages = async (
  params: MessageListParams = {},
): Promise<{ data: Message[]; pagination: Pagination }> => {
  const res = await api.get<ApiResponse<Message[]>>(Crm.messages, {
    params: {
      page: params.page || 1,
      limit: params.limit || 20,
      direction: params.direction || undefined,
      status: params.status || undefined,
      contactId: params.contactId || undefined,
      campaignId: params.campaignId || undefined,
    },
  });
  return {
    data: res.data.data,
    pagination: res.data.pagination as Pagination,
  };
};

export const fetchMessage = async (id: string): Promise<Message> => {
  const res = await api.get<ApiResponse<Message>>(`${Crm.messages}/${id}`);
  return res.data.data;
};

export const sendTransactionalMessage = async (payload: {
  to: string;
  template: string;
  variables?: Record<string, string>;
}): Promise<{ message: Message; rendered: string }> => {
  const res = await api.post(Crm.messagesSend, payload);
  return res.data.data;
};
