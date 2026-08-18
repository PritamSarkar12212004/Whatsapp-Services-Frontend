const apiConst = {
  BASE_URL: "/api",
  AUTH: {
    callAuthOtp: "/generate-otp",
    verify_otp: "/verify-otp",
    create_profile: "/setup_profile",
  },
  Whatsapp: {
    status: "/whatsapp/status",
    connect: "/whatsapp/connect",
    qr: "/whatsapp/qr",
    disconnect: "/whatsapp/disconnect",
    profile: "/whatsapp/profile",
    profileName: "/whatsapp/profile/name",
    profileAbout: "/whatsapp/profile/about",
    profilePicture: "/whatsapp/profile/picture",
    groups: "/whatsapp/groups",
    groupDetail: "/whatsapp/groups/",
    groupManager: "/whatsapp/groups/",
    syncContacts: "/messaging/contacts/sync-whatsapp",
  },
  Contact: {
    allcontact: "/messaging/contacts",
  },
  Crm: {
    contacts: "/messaging/contacts",
    contactsSearch: "/messaging/contacts/search",
    contactsExport: "/messaging/contacts/export",
    contactsImport: "/messaging/contacts/import",
    contactsSync: "/messaging/contacts/sync-whatsapp",
    contactGroups: "/messaging/contact-groups",
    tags: "/messaging/tags",
    templates: "/messaging/templates",
    campaigns: "/messaging/campaigns",
    messages: "/messaging/messages",
    messagesSend: "/messaging/messages/send",
    analytics: "/messaging/analytics",
  },
};

export default apiConst;
