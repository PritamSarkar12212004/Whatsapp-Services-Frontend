import AuthPage from "@/features/auth/pages/AuthPage";
import SettingsPage from "@/features/settings/pages/SettingsPage";
import DashboardPage from "@/features/dashboard/pages/DashboardPage";
import ContactsPage from "@/features/crm/pages/ContactsPage";
import ContactGroupsPage from "@/features/crm/pages/ContactGroupsPage";
import TagsPage from "@/features/crm/pages/TagsPage";
import TemplatesPage from "@/features/crm/pages/TemplatesPage";
import CampaignsPage from "@/features/crm/pages/CampaignsPage";
import MessageLogPage from "@/features/crm/pages/MessageLogPage";
import GroupsPage from "@/features/groups/pages/GroupsPage";
import GroupDetailPage from "@/features/groups/pages/GroupDetailPage";
import GroupAutomationPage from "@/features/groups/pages/GroupAutomationPage";
import BotsPage from "@/features/bots/pages/BotsPage";
import AccountsPage from "@/features/accounts/pages/AccountsPage";
import ComingSoonPage from "@/features/placeholder/pages/ComingSoonPage";
import ProtectedRoute from "./ProtectedRoute";
import WhatsappGate from "./WhatsappGate";
import { Navigate, Route, Routes } from "react-router-dom";

const MainRoute = () => {
    return (
        <Routes>
            <Route path="/auth" element={<AuthPage />} />

            <Route element={<ProtectedRoute />}>
                {/* Outside the gate on purpose: numbers are linked, switched and
                    removed here, so this page must open even when the selected
                    number is not connected yet. */}
                <Route path="/accounts" element={<AccountsPage />} />

                <Route element={<WhatsappGate />}>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/settings" element={<SettingsPage />} />

                    {/* CRM pages */}
                    <Route path="/messages/log" element={<MessageLogPage />} />
                    <Route path="/campaigns" element={<CampaignsPage />} />
                    <Route path="/groups" element={<GroupsPage />} />
                    <Route path="/groups/:id" element={<GroupDetailPage />} />
                    <Route path="/groups/:id/automation" element={<GroupAutomationPage />} />
                    <Route path="/contacts" element={<ContactsPage />} />
                    <Route path="/contacts/groups" element={<ContactGroupsPage />} />
                    <Route path="/contacts/tags" element={<TagsPage />} />
                    <Route path="/templates" element={<TemplatesPage />} />
                    {/* Bots — the automation entry point (also where /automation points) */}
                    <Route path="/bots" element={<BotsPage />} />
                    <Route path="/automation" element={<BotsPage />} />
                    <Route path="/analytics" element={<ComingSoonPage title="Analytics" description="Track campaign performance and engagement." />} />
                    <Route path="/developers" element={<ComingSoonPage title="API & Developers" description="Integrate with the WhatsApp CRM API." />} />
                    <Route path="/whatsapp" element={<ComingSoonPage title="WhatsApp" description="Manage your WhatsApp connection and devices." />} />
                </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default MainRoute;