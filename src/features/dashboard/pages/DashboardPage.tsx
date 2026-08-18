import { useEffect, useRef } from "react";

import {
    Activity,
    AlertTriangle,
    ArrowDownRight,
    ArrowUpRight,
    Ban,
    CheckCircle2,
    Eye,
    Inbox,
    MessageSquare,
    RefreshCw,
    Rocket,
    Send,
    ShieldAlert,
    Users,
} from "lucide-react";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import Animation from "@/components/ui/animation/Animation";
import Sidebar from "@/components/layout/Sidebar";
import WhatsappQRCode from "@/components/ui/whatsapp/WhatsappQRCode";
import { AnimationConst } from "@/consts/animation/AnimationConst";

import { useWhatsappConnect } from "@/features/dashboard/hooks/useWhatsappConnect";
import { useWhatsappStatus } from "@/features/dashboard/hooks/useWhatsappStatus";
import { useWhatsappQR } from "@/features/dashboard/hooks/useWhatsappQR";
import { useAnalytics } from "@/features/dashboard/hooks/useAnalytics";

import type {
    AnalyticsOverview,
    BreakdownSlice,
    DashboardAnalytics,
    TimelinePoint,
    TopCampaign,
} from "@/features/dashboard/api/analytics.api";

const CHART_COLORS = [
    "#10b981",
    "#0ea5e9",
    "#8b5cf6",
    "#ef4444",
    "#f59e0b",
    "#06b6d4",
    "#64748b",
    "#ec4899",
];

const TOOLTIP_STYLE = {
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
    fontSize: 12,
    padding: "8px 12px",
};

const AXIS_TICK = { fontSize: 11, fill: "#94a3b8" } as const;

type IconComponent = React.ComponentType<{ className?: string; strokeWidth?: number }>;

function StatCard({
    label,
    value,
    sub,
    icon: Icon,
    trend,
    trendUp,
}: {
    label: string;
    value: number | string;
    sub?: string;
    icon: IconComponent;
    trend?: string;
    trendUp?: boolean;
}) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-sm">
            <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-gray-400" strokeWidth={1.75} />
                <span className="text-[13px] font-medium text-gray-500">{label}</span>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
                <span className="text-[26px] font-semibold leading-none tracking-tight text-gray-900 tabular-nums">
                    {value}
                </span>

                {trend && (
                    <span
                        className={`inline-flex items-center gap-0.5 text-xs font-medium tabular-nums ${
                            trendUp ? "text-emerald-600" : "text-red-500"
                        }`}
                    >
                        {trendUp ? (
                            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
                        ) : (
                            <ArrowDownRight className="h-3.5 w-3.5" strokeWidth={2} />
                        )}
                        {trend}
                    </span>
                )}
            </div>

            {sub && <p className="mt-2 text-xs text-gray-400">{sub}</p>}
        </div>
    );
}

function ChartCard({
    title,
    subtitle,
    badge,
    children,
    className = "",
}: {
    title: string;
    subtitle?: string;
    badge?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={`rounded-xl border border-gray-200 bg-white p-5 ${className}`}>
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
                    {subtitle && <p className="mt-1 text-xs text-gray-400">{subtitle}</p>}
                </div>
                {badge}
            </div>
            <div className="mt-4">{children}</div>
        </div>
    );
}

function EmptyChart({ title }: { title: string }) {
    return (
        <div className="flex h-56 flex-col items-center justify-center gap-3 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-100 bg-gray-50">
                <Inbox className="h-5 w-5 text-gray-300" strokeWidth={1.5} />
            </span>
            <p className="max-w-[240px] text-sm text-gray-400">{title}</p>
        </div>
    );
}

function DonutChart({
    data,
    height = 220,
}: {
    data: BreakdownSlice[];
    height?: number;
}) {
    const total = data.reduce((sum, d) => sum + d.value, 0);

    if (total === 0) {
        return <EmptyChart title="No data yet. Send messages to see breakdowns." />;
    }

    return (
        <div style={{ height }} className="relative">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={58}
                        outerRadius={82}
                        paddingAngle={2}
                        strokeWidth={0}
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={entry.name}
                                fill={CHART_COLORS[index % CHART_COLORS.length]}
                            />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Legend
                        iconType="circle"
                        iconSize={7}
                        wrapperStyle={{ fontSize: 12, color: "#64748b" }}
                    />
                </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-semibold tracking-tight text-gray-900 tabular-nums">
                    {total}
                </span>
                <span className="text-[11px] text-gray-400">Total</span>
            </div>
        </div>
    );
}

const ACTIVITY_ICONS: Record<string, { icon: IconComponent; className: string }> = {
    message_sent: { icon: Send, className: "bg-emerald-50 text-emerald-600" },
    campaign_sent: { icon: Send, className: "bg-emerald-50 text-emerald-600" },
    campaign_delivered: { icon: CheckCircle2, className: "bg-sky-50 text-sky-600" },
    campaign_read: { icon: Eye, className: "bg-violet-50 text-violet-600" },
    message_received: { icon: MessageSquare, className: "bg-sky-50 text-sky-600" },
    imported: { icon: Users, className: "bg-gray-100 text-gray-500" },
    blocked: { icon: ShieldAlert, className: "bg-red-50 text-red-500" },
    opted_out: { icon: Ban, className: "bg-amber-50 text-amber-600" },
};

function formatActivityTime(ts: string) {
    const date = new Date(ts);
    const today = new Date();
    const sameDay = date.toDateString() === today.toDateString();
    if (sameDay) {
        return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
        });
    }
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
}

function ConnectedDashboard({ phoneNumber }: { phoneNumber: string }) {
    const {
        data: analyticsData,
        isLoading: isAnalyticsLoading,
        isError: isAnalyticsError,
        refetch: refetchAnalytics,
    } = useAnalytics();

    const handleRefresh = () => {
        refetchAnalytics();
    };

    const analytics = analyticsData?.data as DashboardAnalytics | undefined;
    const overview = (analytics?.overview ?? {}) as AnalyticsOverview;

    const deliveredRate = overview.sent
        ? Math.round((overview.delivered / overview.sent) * 100)
        : 0;
    const readRate = overview.sent
        ? Math.round((overview.read / overview.sent) * 100)
        : 0;

    const timeline: TimelinePoint[] = analytics?.messagesOverTime ?? [];
    const statusBreakdown: BreakdownSlice[] = analytics?.statusBreakdown ?? [];
    const campaignBreakdown: BreakdownSlice[] = analytics?.campaignBreakdown ?? [];
    const topCampaigns: TopCampaign[] = analytics?.topCampaigns ?? [];
    const messageTypes: BreakdownSlice[] = analytics?.messageTypes ?? [];
    const activityFeed = analytics?.activityFeed ?? [];

    const timelineTotal = timeline.reduce((sum, d) => sum + d.total, 0);

    return (
        <div className="lg:ml-64 p-4 lg:p-8">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight text-gray-900">
                        Dashboard
                    </h1>
                    <p className="mt-0.5 text-sm text-gray-400">
                        Real-time analytics for your WhatsApp account
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleRefresh}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
                    >
                        <RefreshCw className="h-3.5 w-3.5" strokeWidth={2} />
                        Refresh
                    </button>

                    <span className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-60" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                        </span>
                        Connected
                    </span>
                </div>
            </div>

            {/* Connection strip */}
            <div className="mt-6 flex items-center justify-between rounded-xl border border-gray-200 bg-white px-5 py-4">
                <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600/10">
                        <Send className="h-4 w-4 text-emerald-600" strokeWidth={2} />
                    </span>
                    <div>
                        <p className="text-sm font-medium text-gray-900">
                            WhatsApp Connected
                        </p>
                        <p className="text-xs text-gray-400">
                            {phoneNumber
                                ? `Connected as ${phoneNumber}`
                                : "Your WhatsApp is connected."}
                        </p>
                    </div>
                </div>

                <div className="hidden items-center gap-2 sm:flex">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="text-xs font-medium text-gray-400">
                        Session live
                    </span>
                </div>
            </div>

            {isAnalyticsLoading && (
                <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-28 animate-pulse rounded-xl bg-gray-100" />
                    ))}
                </div>
            )}

            {isAnalyticsError && (
                <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-6 text-center">
                    <p className="text-sm font-medium text-red-700">
                        Failed to load analytics
                    </p>
                    <button
                        onClick={handleRefresh}
                        className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            )}

            {!isAnalyticsLoading && !isAnalyticsError && (
                <>
                    {/* KPI cards */}
                    <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
                        <StatCard
                            label="Total messages"
                            value={overview.totalMessages ?? 0}
                            sub={`${overview.pending ?? 0} in queue`}
                            icon={MessageSquare}
                        />
                        <StatCard
                            label="Delivered"
                            value={overview.delivered ?? 0}
                            sub="Delivery rate"
                            trend={`${deliveredRate}%`}
                            trendUp={deliveredRate >= 80}
                            icon={CheckCircle2}
                        />
                        <StatCard
                            label="Read"
                            value={overview.read ?? 0}
                            sub="Read rate"
                            trend={`${readRate}%`}
                            trendUp={readRate >= 50}
                            icon={Eye}
                        />
                        <StatCard
                            label="Failed"
                            value={overview.failed ?? 0}
                            sub="Requires attention"
                            icon={AlertTriangle}
                        />
                        <StatCard
                            label="Contacts"
                            value={overview.totalContacts ?? 0}
                            sub="Saved contacts"
                            icon={Users}
                        />
                        <StatCard
                            label="Campaigns"
                            value={overview.totalCampaigns ?? 0}
                            sub={`${overview.runningCampaigns ?? 0} running now`}
                            icon={Rocket}
                        />
                    </div>

                    {/* Timeline + status donut */}
                    <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
                        <ChartCard
                            title="Messages over time"
                            subtitle="Last 14 days of outbound activity"
                            className="xl:col-span-2"
                            badge={
                                <span className="rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-500 tabular-nums">
                                    {timelineTotal} total
                                </span>
                            }
                        >
                            {timelineTotal === 0 ? (
                                <EmptyChart title="No messages yet. Launch your first campaign and activity will appear here." />
                            ) : (
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart
                                            data={timeline}
                                            margin={{
                                                top: 5,
                                                right: 10,
                                                left: -22,
                                                bottom: 0,
                                            }}
                                        >
                                            <defs>
                                                <linearGradient
                                                    id="gradSent"
                                                    x1="0"
                                                    y1="0"
                                                    x2="0"
                                                    y2="1"
                                                >
                                                    <stop
                                                        offset="0%"
                                                        stopColor="#10b981"
                                                        stopOpacity={0.16}
                                                    />
                                                    <stop
                                                        offset="100%"
                                                        stopColor="#10b981"
                                                        stopOpacity={0}
                                                    />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                stroke="#f1f5f9"
                                                vertical={false}
                                            />
                                            <XAxis
                                                dataKey="label"
                                                tick={AXIS_TICK}
                                                axisLine={false}
                                                tickLine={false}
                                                dy={6}
                                            />
                                            <YAxis
                                                tick={AXIS_TICK}
                                                axisLine={false}
                                                tickLine={false}
                                                allowDecimals={false}
                                            />
                                            <Tooltip contentStyle={TOOLTIP_STYLE} />
                                            <Legend
                                                iconType="circle"
                                                iconSize={7}
                                                wrapperStyle={{
                                                    fontSize: 12,
                                                    color: "#64748b",
                                                }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="sent"
                                                name="Sent"
                                                stroke="#10b981"
                                                strokeWidth={2}
                                                fill="url(#gradSent)"
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="delivered"
                                                name="Delivered"
                                                stroke="#0ea5e9"
                                                strokeWidth={1.5}
                                                strokeDasharray="4 4"
                                                fill="transparent"
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="read"
                                                name="Read"
                                                stroke="#8b5cf6"
                                                strokeWidth={1.5}
                                                fill="transparent"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </ChartCard>

                        <ChartCard
                            title="Message status"
                            subtitle="Breakdown by delivery status"
                        >
                            <DonutChart data={statusBreakdown} />
                        </ChartCard>
                    </div>

                    {/* Campaigns + types + campaign status */}
                    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <ChartCard
                            title="Top campaigns"
                            subtitle="By messages sent"
                        >
                            {topCampaigns.length === 0 ? (
                                <EmptyChart title="No campaigns yet. Create one from the Campaigns page." />
                            ) : (
                                <div className="h-56">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={topCampaigns}
                                            margin={{
                                                top: 5,
                                                right: 10,
                                                left: -22,
                                                bottom: 0,
                                            }}
                                        >
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                stroke="#f1f5f9"
                                                vertical={false}
                                            />
                                            <XAxis
                                                dataKey="name"
                                                tick={AXIS_TICK}
                                                axisLine={false}
                                                tickLine={false}
                                                interval={0}
                                                angle={-18}
                                                textAnchor="end"
                                                height={46}
                                            />
                                            <YAxis
                                                tick={AXIS_TICK}
                                                axisLine={false}
                                                tickLine={false}
                                                allowDecimals={false}
                                            />
                                            <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "#f8fafc" }} />
                                            <Bar
                                                dataKey="sent"
                                                name="Sent"
                                                fill="#10b981"
                                                radius={[4, 4, 0, 0]}
                                                maxBarSize={28}
                                            />
                                            <Bar
                                                dataKey="read"
                                                name="Read"
                                                fill="#c4b5fd"
                                                radius={[4, 4, 0, 0]}
                                                maxBarSize={28}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </ChartCard>

                        <ChartCard
                            title="Message types"
                            subtitle="Distribution of sent content"
                        >
                            <DonutChart data={messageTypes} height={224} />
                        </ChartCard>

                        <ChartCard
                            title="Campaign status"
                            subtitle="All campaigns by current state"
                        >
                            {campaignBreakdown.length === 0 ? (
                                <EmptyChart title="No campaigns yet." />
                            ) : (
                                <div className="space-y-4 pt-1">
                                    {campaignBreakdown.map((slice, index) => {
                                        const total = campaignBreakdown.reduce(
                                            (sum, s) => sum + s.value,
                                            0,
                                        );
                                        const pct = total
                                            ? Math.round((slice.value / total) * 100)
                                            : 0;
                                        return (
                                            <div key={slice.name}>
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="font-medium text-gray-600">
                                                        {slice.name}
                                                    </span>
                                                    <span className="text-gray-400 tabular-nums">
                                                        {slice.value}
                                                    </span>
                                                </div>
                                                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-100">
                                                    <div
                                                        className="h-full rounded-full"
                                                        style={{
                                                            width: `${pct}%`,
                                                            backgroundColor:
                                                                CHART_COLORS[
                                                                    index %
                                                                        CHART_COLORS.length
                                                                ],
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </ChartCard>
                    </div>

                    {/* Recent activity */}
                    <div className="mt-6 grid grid-cols-1 gap-6">
                        <ChartCard
                            title="Recent activity"
                            subtitle="Latest actions across contacts and campaigns"
                            badge={
                                <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-500">
                                    <Activity className="h-3.5 w-3.5" strokeWidth={2} />
                                    Live feed
                                </span>
                            }
                        >
                            {activityFeed.length === 0 ? (
                                <EmptyChart title="No activity yet. Syncing contacts or sending messages will appear here." />
                            ) : (
                                <ul className="divide-y divide-gray-100">
                                    {activityFeed.map((activity) => {
                                        const meta = ACTIVITY_ICONS[activity.type] ?? {
                                            icon: Activity,
                                            className: "bg-gray-100 text-gray-500",
                                        };
                                        const Icon = meta.icon;
                                        return (
                                            <li
                                                key={activity.id}
                                                className="flex items-center justify-between gap-3 py-3"
                                            >
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <span
                                                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${meta.className}`}
                                                    >
                                                        <Icon
                                                            className="h-3.5 w-3.5"
                                                            strokeWidth={2}
                                                        />
                                                    </span>
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-medium text-gray-800">
                                                            {activity.contactName}
                                                        </p>
                                                        <p className="text-xs text-gray-400">
                                                            {activity.label}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="shrink-0 text-xs text-gray-400 tabular-nums">
                                                    {formatActivityTime(activity.timestamp)}
                                                </span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </ChartCard>
                    </div>
                </>
            )}
        </div>
    );
}

function DashboardPage() {
    const {
        data,
        isLoading,
        isError,
        error,
        refetch: refetchStatus,
    } = useWhatsappStatus();

    const {
        mutate: connectWhatsApp,
        isPending: isConnecting,
        error: connectError,
        reset: resetConnect,
    } = useWhatsappConnect();

    const {
        data: qrData,
        isFetching: isQRLoading,
        isError: isQRError,
        refetch: fetchQR,
    } = useWhatsappQR();

    const connectTriggeredRef = useRef(false);
    const qrFetchedRef = useRef(false);

    useEffect(() => {
        if (data?.status === "disconnected" && !connectTriggeredRef.current) {
            connectTriggeredRef.current = true;
            connectWhatsApp(undefined, {
                onSuccess: () => refetchStatus(),
            });
        }

        if (data?.status !== "disconnected") {
            connectTriggeredRef.current = false;
        }
    }, [data?.status, connectWhatsApp, refetchStatus]);

    useEffect(() => {
        if (data?.status === "qr_required" && !qrFetchedRef.current) {
            qrFetchedRef.current = true;
            fetchQR();
        }

        if (data?.status !== "qr_required") {
            qrFetchedRef.current = false;
        }
    }, [data?.status, fetchQR]);

    const handleRetryStatus = () => {
        refetchStatus();
    };

    const handleRetryConnect = () => {
        resetConnect();
        connectWhatsApp(undefined, {
            onSuccess: () => refetchStatus(),
        });
    };

    const handleRetryQR = () => {
        fetchQR();
    };

    if (isLoading) {
        return (
            <div className="w-full h-screen flex items-center justify-center">
                <Animation
                    source={AnimationConst.Loader}
                    height={200}
                    width={200}
                    loop={true}
                    className="mx-auto"
                />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="w-full h-screen">
                <Sidebar />

                <div className="lg:ml-64 p-6 flex items-center justify-center h-[calc(100vh-3rem)]">
                    <div className="w-full max-w-md rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
                        <h2 className="text-lg font-semibold text-red-700">
                            Failed to load WhatsApp status
                        </h2>

                        <p className="mt-2 text-sm text-red-600">
                            {error instanceof Error ? error.message : "Something went wrong."}
                        </p>

                        <button
                            onClick={handleRetryStatus}
                            className="mt-6 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (data?.status === "connected") {
        return (
            <div className="w-full min-h-screen bg-gray-50">
                <Sidebar />

                <ConnectedDashboard phoneNumber={data?.phoneNumber ?? ""} />
            </div>
        );
    }

    if (data?.status === "qr_required") {
        return (
            <div className="w-full h-screen">
                <Sidebar />

                <div className="lg:ml-64 p-6 flex items-center justify-center h-[calc(100vh-3rem)]">
                    <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Connect WhatsApp
                        </h2>

                        <p className="mt-2 text-sm text-gray-500">
                            Scan this QR code with WhatsApp → Linked Devices → Link a Device
                        </p>

                        <div className="mt-6 flex items-center justify-center">
                            {isQRLoading && (
                                <div className="flex flex-col items-center gap-3">
                                    <Animation
                                        source={AnimationConst.Loader}
                                        height={120}
                                        width={120}
                                        loop={true}
                                    />
                                    <p className="text-sm text-gray-500">
                                        Generating QR code...
                                    </p>
                                </div>
                            )}

                            {!isQRLoading && isQRError && (
                                <div className="flex flex-col items-center gap-3">
                                    <p className="text-sm text-red-500">
                                        Failed to load QR code.
                                    </p>
                                    <button
                                        onClick={handleRetryQR}
                                        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
                                    >
                                        Retry
                                    </button>
                                </div>
                            )}

                            {!isQRLoading && !isQRError && qrData?.qr && (
                                <div className="rounded-xl border border-gray-200 bg-white p-4">
                                    <WhatsappQRCode
                                        value={qrData.qr}
                                        size={220}
                                    />
                                </div>
                            )}

                            {!isQRLoading && !isQRError && !qrData?.qr && (
                                <div className="flex flex-col items-center gap-3">
                                    <p className="text-sm text-gray-500">
                                        QR code is not available yet.
                                    </p>
                                    <button
                                        onClick={handleRetryQR}
                                        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
                                    >
                                        Refresh QR
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex items-center justify-center gap-2">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                            <p className="text-sm text-gray-500">
                                Waiting for QR scan...
                            </p>
                        </div>

                        <button
                            onClick={handleRetryQR}
                            className="mt-4 text-sm font-medium text-emerald-600 transition hover:text-emerald-700"
                        >
                            Refresh QR
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (data?.status === "disconnected" && connectError) {
        return (
            <div className="w-full h-screen">
                <Sidebar />

                <div className="lg:ml-64 p-6 flex items-center justify-center h-[calc(100vh-3rem)]">
                    <div className="w-full max-w-md rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
                        <h2 className="text-lg font-semibold text-red-700">
                            Failed to connect WhatsApp
                        </h2>

                        <p className="mt-2 text-sm text-red-600">
                            {connectError instanceof Error
                                ? connectError.message
                                : "Something went wrong."}
                        </p>

                        <button
                            onClick={handleRetryConnect}
                            className="mt-6 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-screen">
            <Sidebar />

            <div className="lg:ml-64 p-6 flex items-center justify-center h-[calc(100vh-3rem)]">
                <div className="flex flex-col items-center gap-4 text-center">
                    {isConnecting && (
                        <Animation
                            source={AnimationConst.Loader}
                            height={160}
                            width={160}
                            loop={true}
                        />
                    )}

                    <p className="text-lg font-medium text-gray-700">
                        Connecting to WhatsApp...
                    </p>

                    <button
                        onClick={handleRetryConnect}
                        className="mt-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                        Retry
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DashboardPage;
