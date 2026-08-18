import apiConst from "@/consts/api/apiConst";
import api from "@/utils/api/api";

export interface AnalyticsOverview {
    totalMessages: number;
    sent: number;
    delivered: number;
    read: number;
    failed: number;
    pending: number;
    recipientsDelivered: number;
    recipientsRead: number;
    recipientsFailed: number;
    totalContacts: number;
    totalCampaigns: number;
    runningCampaigns: number;
    totalGroups: number;
}

export interface TimelinePoint {
    date: string;
    label: string;
    total: number;
    sent: number;
    delivered: number;
    read: number;
    failed: number;
}

export interface BreakdownSlice {
    name: string;
    value: number;
}

export interface TopCampaign {
    _id: string;
    name: string;
    status: string;
    sent: number;
    delivered: number;
    read: number;
    failed: number;
}

export interface ActivityItem {
    id: string;
    type: string;
    label: string;
    contactName: string;
    timestamp: string;
}

export interface DashboardAnalytics {
    overview: AnalyticsOverview;
    messagesOverTime: TimelinePoint[];
    statusBreakdown: BreakdownSlice[];
    campaignBreakdown: BreakdownSlice[];
    topCampaigns: TopCampaign[];
    messageTypes: BreakdownSlice[];
    activityFeed: ActivityItem[];
}

export interface AnalyticsResponse {
    status: string;
    data: DashboardAnalytics;
}

export const fetchAnalytics = async (): Promise<AnalyticsResponse> => {
    const response = await api.get(apiConst.Crm.analytics);
    return response.data;
};
