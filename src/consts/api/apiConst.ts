const apiConst = {
  // Default: Render-deployed live backend.
  // Override karna ho (e.g. ngrok/local) to VITE_API_BASE_URL env var set karo:
  //   VITE_API_BASE_URL=https://numerate-resisting-squeamish.ngrok-free.dev/api
  BASE_URL:
    import.meta.env.VITE_API_BASE_URL || "https://whatsapp-services-8t87.onrender.com/api",
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
