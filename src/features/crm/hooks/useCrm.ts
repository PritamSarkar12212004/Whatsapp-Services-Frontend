import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addContactsToGroup,
  blockContact,
  cancelCampaign,
  cancelMessage,
  unscheduleCampaign,
  createCampaign,
  createContact,
  createContactGroup,
  createTag,
  createTemplate,
  deleteCampaign,
  deleteContact,
  deleteContactGroup,
  deleteTag,
  deleteTemplate,
  exportContactsCsv,
  fetchCampaignAudience,
  fetchCampaignRecipients,
  fetchCampaigns,
  fetchCampaignStats,
  fetchContact,
  fetchContactActivities,
  fetchContactGroups,
  fetchContacts,
  fetchMessage,
  fetchMessages,
  fetchTags,
  fetchTemplates,
  importContactsCsv,
  optOutContact,
  pauseCampaign,
  previewTemplate,
  removeContactFromGroup,
  resumeCampaign,
  setContactTags,
  startCampaign,
  sendTransactionalMessage,
  syncWhatsAppContacts,
  unblockContact,
  updateCampaign,
  updateContact,
  updateContactGroup,
  updateTag,
  updateTemplate,
  type CampaignInput,
  type ContactListParams,
  type MessageListParams,
} from "../api/crm.api";

// ------------------------------------------------------------------ Queries

export const useContacts = (params: ContactListParams) => {
  return useQuery({
    queryKey: ["crm", "contacts", params],
    queryFn: () => fetchContacts(params),
  });
};

export const useContact = (id: string | null) => {
  return useQuery({
    queryKey: ["crm", "contact", id],
    queryFn: () => fetchContact(id as string),
    enabled: !!id,
  });
};

export const useContactGroups = () => {
  return useQuery({
    queryKey: ["crm", "contact-groups"],
    queryFn: fetchContactGroups,
  });
};

export const useTags = () => {
  return useQuery({
    queryKey: ["crm", "tags"],
    queryFn: fetchTags,
  });
};

export const useTemplates = (params: { status?: string; category?: string } = {}) => {
  return useQuery({
    queryKey: ["crm", "templates", params],
    queryFn: () => fetchTemplates(params),
  });
};

export const useCampaigns = (status?: string) => {
  return useQuery({
    queryKey: ["crm", "campaigns", status || "all"],
    queryFn: () => fetchCampaigns(status as never),
    refetchInterval: 10000,
  });
};

export const useCampaignAudience = (id: string | null) => {
  return useQuery({
    queryKey: ["crm", "campaign-audience", id],
    queryFn: () => fetchCampaignAudience(id as string),
    enabled: !!id,
    refetchInterval: 5000,
  });
};

export const useCampaignRecipients = (
  id: string | null,
  params: { page?: number; limit?: number; status?: string } = {},
) => {
  return useQuery({
    queryKey: ["crm", "campaign-recipients", id, params],
    queryFn: () => fetchCampaignRecipients(id as string, params),
    enabled: !!id,
    refetchInterval: 5000,
  });
};

export const useCampaignStats = (id: string | null) => {
  return useQuery({
    queryKey: ["crm", "campaign-stats", id],
    queryFn: () => fetchCampaignStats(id as string),
    enabled: !!id,
    refetchInterval: 5000,
  });
};

export const useContactActivities = (id: string | null) => {
  return useQuery({
    queryKey: ["crm", "contact-activities", id],
    queryFn: () => fetchContactActivities(id as string),
    enabled: !!id,
  });
};

export const useMessages = (params: MessageListParams) => {
  return useQuery({
    queryKey: ["crm", "messages", params],
    queryFn: () => fetchMessages(params),
  });
};

export const useMessage = (id: string | null) => {
  return useQuery({
    queryKey: ["crm", "message", id],
    queryFn: () => fetchMessage(id as string),
    enabled: !!id,
  });
};

export const useSendMessage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: sendTransactionalMessage,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm", "messages"] });
      qc.invalidateQueries({ queryKey: ["crm", "contacts"] });
      qc.invalidateQueries({ queryKey: ["contact-all"] });
    },
  });
};

// ----------------------------------------------------------------- Mutations

export const useCreateContact = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createContact,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm", "contacts"] });
      qc.invalidateQueries({ queryKey: ["contact-all"] });
    },
  });
};

export const useUpdateContact = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof updateContact>[1] }) =>
      updateContact(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm", "contacts"] });
      qc.invalidateQueries({ queryKey: ["crm", "contact"] });
      qc.invalidateQueries({ queryKey: ["contact-all"] });
    },
  });
};

export const useDeleteContact = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteContact,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm", "contacts"] });
      qc.invalidateQueries({ queryKey: ["contact-all"] });
    },
  });
};

export const useBlockContact = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: blockContact,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm", "contacts"] });
      qc.invalidateQueries({ queryKey: ["crm", "contact"] });
    },
  });
};

export const useUnblockContact = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: unblockContact,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm", "contacts"] });
      qc.invalidateQueries({ queryKey: ["crm", "contact"] });
    },
  });
};

export const useOptOutContact = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: optOutContact,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm", "contacts"] });
      qc.invalidateQueries({ queryKey: ["crm", "contact"] });
    },
  });
};

export const useSetContactTags = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, tags }: { id: string; tags: string[] }) =>
      setContactTags(id, tags),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm", "contacts"] });
      qc.invalidateQueries({ queryKey: ["crm", "contact"] });
    },
  });
};

export const useSyncWhatsApp = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: syncWhatsAppContacts,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm", "contacts"] });
      qc.invalidateQueries({ queryKey: ["contact-all"] });
    },
  });
};

export const useImportContacts = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: importContactsCsv,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm", "contacts"] });
      qc.invalidateQueries({ queryKey: ["contact-all"] });
    },
  });
};

export const useCreateContactGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createContactGroup,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "contact-groups"] }),
  });
};

export const useUpdateContactGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof updateContactGroup>[1] }) =>
      updateContactGroup(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "contact-groups"] }),
  });
};

export const useDeleteContactGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteContactGroup,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "contact-groups"] }),
  });
};

export const useAddContactsToGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, contactIds }: { id: string; contactIds: string[] }) =>
      addContactsToGroup(id, contactIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm", "contact-groups"] });
      qc.invalidateQueries({ queryKey: ["crm", "contacts"] });
    },
  });
};

export const useRemoveContactFromGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, contactId }: { groupId: string; contactId: string }) =>
      removeContactFromGroup(groupId, contactId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm", "contact-groups"] });
      qc.invalidateQueries({ queryKey: ["crm", "contacts"] });
    },
  });
};

export const useCreateTag = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTag,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "tags"] }),
  });
};

export const useUpdateTag = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof updateTag>[1] }) =>
      updateTag(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "tags"] }),
  });
};

export const useDeleteTag = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteTag,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "tags"] }),
  });
};

export const useCreateTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTemplate,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "templates"] }),
  });
};

export const useUpdateTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof updateTemplate>[1] }) =>
      updateTemplate(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "templates"] }),
  });
};

export const useDeleteTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteTemplate,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "templates"] }),
  });
};

export const usePreviewTemplate = () => {
  return useMutation({
    mutationFn: ({ id, variables }: { id: string; variables: Record<string, string> }) =>
      previewTemplate(id, variables),
  });
};

export const useCreateCampaign = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCampaign,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "campaigns"] }),
  });
};

export const useUpdateCampaign = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CampaignInput }) =>
      updateCampaign(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "campaigns"] }),
  });
};

export const useDeleteCampaign = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteCampaign,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "campaigns"] }),
  });
};

export const useUnscheduleCampaign = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: unscheduleCampaign,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm", "campaigns"] });
      qc.invalidateQueries({ queryKey: ["crm", "campaign-stats"] });
    },
  });
};

export const useCancelMessage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cancelMessage,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm", "campaign-stats"] });
      qc.invalidateQueries({ queryKey: ["crm", "messages"] });
    },
  });
};

export const useCampaignAction = (action: "start" | "pause" | "resume" | "cancel") => {
  const qc = useQueryClient();
  const fns = { start: startCampaign, pause: pauseCampaign, resume: resumeCampaign, cancel: cancelCampaign };
  return useMutation({
    mutationFn: (id: string) => fns[action](id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm", "campaigns"] });
      qc.invalidateQueries({ queryKey: ["crm", "campaign-recipients"] });
      qc.invalidateQueries({ queryKey: ["crm", "campaign-stats"] });
    },
  });
};

export const useExportContacts = () => {
  return useMutation({
    mutationFn: exportContactsCsv,
  });
};
