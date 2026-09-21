import React from "react";
import { Skeleton, SkeletonCard, SkeletonCircle } from "./Skeleton";

/** Local helper for repeating placeholder elements. */
const repeat = (count: number) => Array.from({ length: count });

// =============================================================== Building blocks

/** Page title + subtitle + primary action, matching the CRM page headers. */
export const PageHeaderSkeleton: React.FC<{
    subtitle?: boolean;
    action?: boolean;
    className?: string;
}> = ({ subtitle = true, action = true, className = "mb-6" }) => (
    <div className={`flex flex-wrap items-center justify-between gap-4 ${className}`}>
        <div className="space-y-2.5">
            <Skeleton className="h-7 w-44" />
            {subtitle && <Skeleton className="h-4 w-72 max-w-full" />}
        </div>
        {action && <Skeleton rounded="rounded-xl" className="h-11 w-32" />}
    </div>
);

/** Search box + filter pills / segmented tabs. */
export const ToolbarSkeleton: React.FC<{ tabs?: number; className?: string }> = ({
    tabs = 3,
    className = "mb-4",
}) => (
    <div className={`space-y-4 ${className}`}>
        <div className="flex flex-wrap items-center gap-3">
            <Skeleton rounded="rounded-xl" className="h-11 w-full max-w-sm" />
            <Skeleton rounded="rounded-xl" className="h-11 w-11" />
        </div>
        <div className="flex flex-wrap gap-2">
            {repeat(tabs).map((_, i) => (
                <Skeleton key={i} rounded="rounded-xl" className="h-9 w-24" />
            ))}
        </div>
    </div>
);

type CellType = "contact" | "stack" | "badge" | "line" | "icon" | "check";

const CellSkeleton: React.FC<{ type?: CellType }> = ({ type = "line" }) => {
    switch (type) {
        case "contact":
            return (
                <div className="flex items-center gap-3">
                    <SkeletonCircle className="h-8 w-8" />
                    <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3.5 w-32 max-w-full" />
                        <Skeleton className="h-2.5 w-20" />
                    </div>
                </div>
            );
        case "stack":
            return (
                <div className="space-y-1.5">
                    <Skeleton className="h-3.5 w-36 max-w-full" />
                    <Skeleton className="h-2.5 w-24" />
                </div>
            );
        case "badge":
            return <Skeleton rounded="rounded-full" className="h-5 w-16" />;
        case "icon":
            return <Skeleton rounded="rounded-lg" className="h-8 w-8" />;
        case "check":
            return <Skeleton rounded="rounded" className="h-4 w-4" />;
        default:
            return <Skeleton className="h-3.5 w-3/4" />;
    }
};

/** Generic CRM table skeleton — pass column specs to mirror any table. */
export const TableSkeleton: React.FC<{
    rows?: number;
    columns: { width: string; type?: CellType }[];
    className?: string;
    /** Skip the card chrome when a parent already supplies the bordered container. */
    bare?: boolean;
}> = ({ rows = 8, columns, className = "", bare = false }) => (
    <div
        className={
            bare
                ? className
                : `overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm ${className}`
        }
    >
        <div className="flex items-center gap-4 border-b border-gray-100 bg-gray-50/60 px-4 py-3">
            {columns.map((c, i) => (
                <div
                    key={i}
                    className={`${c.width} ${
                        i === columns.length - 1 ? "flex justify-end" : ""
                    }`}
                >
                    <Skeleton className="h-3 w-16" />
                </div>
            ))}
        </div>
        <div className="divide-y divide-gray-50">
            {repeat(rows).map((_, r) => (
                <div key={r} className="flex items-center gap-4 px-4 py-3.5">
                    {columns.map((c, i) => (
                        <div
                            key={i}
                            className={`${c.width} ${
                                i === columns.length - 1 ? "flex justify-end" : ""
                            }`}
                        >
                            <CellSkeleton type={c.type} />
                        </div>
                    ))}
                </div>
            ))}
        </div>
    </div>
);

/** Vertical card grid (Templates / Contact Groups). */
export const CardGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {repeat(count).map((_, i) => (
            <SkeletonCard key={i} className="flex flex-col">
                <div className="flex items-start justify-between gap-3">
                    <Skeleton rounded="rounded-xl" className="h-11 w-11" />
                    <div className="flex gap-1.5">
                        <Skeleton rounded="rounded-lg" className="h-8 w-8" />
                        <Skeleton rounded="rounded-lg" className="h-8 w-8" />
                        <Skeleton rounded="rounded-lg" className="h-8 w-8" />
                    </div>
                </div>
                <Skeleton className="mt-4 h-4 w-32" />
                <div className="mt-2 flex-1 space-y-2">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                    <Skeleton rounded="rounded-full" className="h-5 w-20" />
                    <Skeleton className="h-3 w-28" />
                </div>
            </SkeletonCard>
        ))}
    </div>
);

/** Horizontal compact cards (Tags). */
export const TagGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {repeat(count).map((_, i) => (
            <div
                key={i}
                className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
            >
                <Skeleton rounded="rounded-xl" className="h-9 w-9" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-24 max-w-full" />
                    <Skeleton className="h-2.5 w-16" />
                </div>
                <div className="flex gap-1">
                    <Skeleton rounded="rounded-lg" className="h-8 w-8" />
                    <Skeleton rounded="rounded-lg" className="h-8 w-8" />
                </div>
            </div>
        ))}
    </div>
);

// ========================================================= Table-only skeletons
// Used inside pages that already render their own header / toolbar.

export const ContactsTableSkeleton: React.FC<{ rows?: number; bare?: boolean }> = ({
    rows = 9,
    bare,
}) => (
    <TableSkeleton
        rows={rows}
        bare={bare}
        columns={[
            { width: "w-6", type: "check" },
            { width: "flex-1", type: "contact" },
            { width: "w-28" },
            { width: "w-24", type: "badge" },
            { width: "w-32", type: "badge" },
            { width: "w-24" },
            { width: "w-10", type: "icon" },
        ]}
    />
);

export const CampaignsTableSkeleton: React.FC<{ rows?: number }> = ({ rows = 8 }) => (
    <TableSkeleton
        rows={rows}
        columns={[
            { width: "flex-1", type: "stack" },
            { width: "w-28", type: "badge" },
            { width: "w-32" },
            { width: "w-20" },
            { width: "w-28" },
            { width: "w-10", type: "icon" },
        ]}
    />
);

export const MessagesTableSkeleton: React.FC<{ rows?: number; bare?: boolean }> = ({
    rows = 9,
    bare,
}) => (
    <TableSkeleton
        rows={rows}
        bare={bare}
        columns={[
            { width: "flex-1", type: "contact" },
            { width: "w-24", type: "badge" },
            { width: "w-24", type: "badge" },
            { width: "w-56" },
            { width: "w-28" },
            { width: "w-24" },
            { width: "w-10", type: "icon" },
        ]}
    />
);

// ======================================================= Full-page skeletons
// Used by pages that early-return while their primary data loads.

export const GroupsPageSkeleton: React.FC = () => (
    <div className="flex h-full flex-col">
        <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-2.5">
                <Skeleton className="h-7 w-64" />
                <Skeleton className="h-4 w-80 max-w-full" />
            </div>
            <Skeleton rounded="rounded-xl" className="h-11 w-28" />
        </div>

        <div className="flex-1 overflow-y-auto py-5">
            <div className="space-y-5">
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {repeat(4).map((_, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3.5 shadow-sm"
                        >
                            <Skeleton rounded="rounded-xl" className="h-9 w-9" />
                            <div className="min-w-0 flex-1 space-y-1.5">
                                <Skeleton className="h-5 w-10" />
                                <Skeleton className="h-3 w-24 max-w-full" />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
                    <div className="flex flex-wrap items-center gap-2">
                        <Skeleton rounded="rounded-xl" className="h-9 w-56" />
                        <Skeleton
                            rounded="rounded-xl"
                            className="h-9 w-72 max-w-full"
                        />
                    </div>
                    <Skeleton rounded="rounded-xl" className="h-11 w-full" />
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
                        {repeat(8).map((_, i) => (
                            <div
                                key={i}
                                className="flex aspect-square flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                            >
                                <div className="flex items-start justify-between">
                                    <Skeleton
                                        rounded="rounded-2xl"
                                        className="h-11 w-11"
                                    />
                                    <div className="flex flex-col items-end gap-1">
                                        <Skeleton
                                            rounded="rounded-full"
                                            className="h-4 w-14"
                                        />
                                        <Skeleton
                                            rounded="rounded-full"
                                            className="h-4 w-16"
                                        />
                                    </div>
                                </div>
                                <Skeleton className="mt-3 h-4 w-32 max-w-full" />
                                <Skeleton className="mt-2 h-3 w-24" />
                                <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-2.5">
                                    <Skeleton className="h-3 w-20" />
                                    <Skeleton className="h-3 w-3" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export const GroupDetailSkeleton: React.FC = () => (
    <>
        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 lg:px-6">
            <div className="flex items-center gap-3">
                <Skeleton rounded="rounded-lg" className="h-9 w-9" />
                <div className="space-y-2">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-3.5 w-56 max-w-full" />
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Skeleton rounded="rounded-lg" className="h-9 w-9" />
                <Skeleton rounded="rounded-lg" className="h-9 w-32" />
            </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-6">
            <div className="space-y-6">
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="h-1.5 bg-gray-100" />
                    <div className="p-6">
                        <div className="flex flex-wrap items-center gap-4">
                            <Skeleton rounded="rounded-2xl" className="h-20 w-20" />
                            <div className="min-w-0 flex-1 space-y-2.5">
                                <Skeleton className="h-7 w-56 max-w-full" />
                                <Skeleton className="h-4 w-72 max-w-full" />
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {repeat(4).map((_, i) => (
                                <div
                                    key={i}
                                    className="rounded-xl border border-gray-100 bg-gray-50/70 p-3.5"
                                >
                                    <Skeleton className="h-3 w-20" />
                                    <Skeleton className="mt-2 h-6 w-14" />
                                </div>
                            ))}
                        </div>

                        <Skeleton rounded="rounded-xl" className="mt-4 h-12 w-full" />

                        <div className="mt-4 flex flex-wrap gap-2">
                            {repeat(4).map((_, i) => (
                                <Skeleton
                                    key={i}
                                    rounded="rounded-full"
                                    className="h-7 w-32"
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-4" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton rounded="rounded-lg" className="h-8 w-32" />
                    </div>
                    <div className="mt-4 space-y-3">
                        <Skeleton rounded="rounded-lg" className="h-10 w-full" />
                        {repeat(5).map((_, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-3 rounded-xl border border-gray-100 px-3 py-3"
                            >
                                <SkeletonCircle className="h-9 w-9" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-3.5 w-40 max-w-full" />
                                    <Skeleton className="h-2.5 w-24" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </>
);

export const GroupAutomationSkeleton: React.FC = () => (
    <>
        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 lg:px-6">
            <div className="flex min-w-0 items-center gap-3">
                <Skeleton rounded="rounded-lg" className="h-9 w-9" />
                <div className="space-y-2">
                    <Skeleton className="h-6 w-44" />
                    <Skeleton className="h-3.5 w-32" />
                </div>
            </div>
        </div>
        <div className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-6">
            <div className="space-y-6">
                <SkeletonCard className="rounded-xl border-gray-200">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="mt-2 h-3 w-64 max-w-full" />
                    <Skeleton rounded="rounded-xl" className="mt-5 h-24 w-full" />
                </SkeletonCard>
                <SkeletonCard className="rounded-xl border-gray-200">
                    <Skeleton className="h-4 w-40" />
                    <div className="mt-4 space-y-3">
                        {repeat(3).map((_, i) => (
                            <Skeleton
                                key={i}
                                rounded="rounded-xl"
                                className="h-12 w-full"
                            />
                        ))}
                    </div>
                </SkeletonCard>
            </div>
        </div>
    </>
);

// ========================================================== Section skeletons

const ChartCardSkeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
    <div className={`rounded-xl border border-gray-200 bg-white p-5 ${className}`}>
        <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-56 max-w-full" />
            </div>
            <Skeleton rounded="rounded-md" className="h-6 w-16" />
        </div>
        <Skeleton rounded="rounded-xl" className="mt-4 h-56 w-full" />
    </div>
);

/** Dashboard analytics body — header / connection strip are rendered by the page. */
export const DashboardAnalyticsSkeleton: React.FC = () => (
    <>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            {repeat(6).map((_, i) => (
                <div key={i} className="rounded-xl border border-gray-200 bg-white p-5">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-3.5 w-20" />
                    </div>
                    <Skeleton className="mt-3 h-7 w-16" />
                    <Skeleton className="mt-2 h-3 w-24" />
                </div>
            ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
            <ChartCardSkeleton className="xl:col-span-2" />
            <ChartCardSkeleton />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <ChartCardSkeleton />
            <ChartCardSkeleton />
            <ChartCardSkeleton />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6">
            <SkeletonCard className="rounded-xl border-gray-200 p-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-3 w-64 max-w-full" />
                    </div>
                    <Skeleton rounded="rounded-md" className="h-6 w-24" />
                </div>
                <ul className="mt-4 divide-y divide-gray-100">
                    {repeat(5).map((_, i) => (
                        <li key={i} className="flex items-center gap-3 py-3">
                            <Skeleton rounded="rounded-lg" className="h-8 w-8" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-3.5 w-40 max-w-full" />
                                <Skeleton className="h-2.5 w-24" />
                            </div>
                            <Skeleton className="h-3 w-14" />
                        </li>
                    ))}
                </ul>
            </SkeletonCard>
        </div>
    </>
);

/** WhatsApp profile card fields, shown while the profile request is in flight. */
export const WhatsappProfileFieldsSkeleton: React.FC = () => (
    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {repeat(2).map((_, i) => (
            <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton rounded="rounded-lg" className="h-10 w-full" />
            </div>
        ))}
    </div>
);

/** Contact picker rows inside the group members drawer. */
export const MemberListSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
    <div className="space-y-1">
        {repeat(rows).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl px-3 py-2.5">
                <Skeleton rounded="rounded" className="h-4 w-4" />
                <SkeletonCircle className="h-8 w-8" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-36 max-w-full" />
                    <Skeleton className="h-2.5 w-24" />
                </div>
            </div>
        ))}
    </div>
);

/** Recipient rows inside the campaign detail panel. */
export const RecipientListSkeleton: React.FC<{ rows?: number }> = ({ rows = 6 }) => (
    <div className="space-y-1.5">
        {repeat(rows).map((_, i) => (
            <div
                key={i}
                className="flex items-center gap-3 rounded-xl border border-gray-100 px-3 py-2.5"
            >
                <SkeletonCircle className="h-8 w-8" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-40 max-w-full" />
                    <Skeleton className="h-2.5 w-24" />
                </div>
                <Skeleton rounded="rounded-full" className="h-5 w-16" />
            </div>
        ))}
    </div>
);

/** Pill row — campaign audience counts, summary chips. */
export const ChipRowSkeleton: React.FC<{
    chips?: number;
    className?: string;
}> = ({ chips = 3, className = "" }) => (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
        {repeat(chips).map((_, i) => (
            <Skeleton
                key={i}
                rounded="rounded-full"
                className={`h-6 ${i === 1 ? "w-20" : i === 2 ? "w-24" : "w-28"}`}
            />
        ))}
    </div>
);

/**
 * Value + label tiles — the campaign "Statistics" grid and the dev-mode
 * counters. Grid/card classes are passed in so the tiles keep the exact shape
 * of the block they replace.
 */
export const StatTilesSkeleton: React.FC<{
    count?: number;
    grid?: string;
    card?: string;
}> = ({
    count = 6,
    grid = "grid-cols-3 gap-3 sm:grid-cols-6",
    card = "rounded-2xl border border-gray-100 p-3 text-center",
}) => (
    <div className={`grid ${grid}`}>
        {repeat(count).map((_, i) => (
            <div key={i} className={card}>
                <Skeleton className="mx-auto h-5 w-10" />
                <Skeleton className="mx-auto mt-1.5 h-2.5 w-14" />
            </div>
        ))}
    </div>
);

/** Input + action button row — campaign message preview. */
export const FormRowSkeleton: React.FC<{ className?: string }> = ({
    className = "",
}) => (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
        <Skeleton
            rounded="rounded-xl"
            className="h-9 min-w-[220px] flex-1"
        />
        <Skeleton rounded="rounded-xl" className="h-9 w-28" />
    </div>
);

/** Dev-campaign live status block (message + counters) in the campaign drawer. */
export const DevCampaignBlockSkeleton: React.FC = () => (
    <div className="mb-6 rounded-2xl border border-gray-200 bg-gray-50 p-4">
        <Skeleton className="h-3.5 w-56 max-w-full" />
        <Skeleton className="mt-2.5 h-2.5 w-full max-w-md" />
        <StatTilesSkeleton
            count={5}
            grid="mt-3 grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5"
            card="rounded-xl bg-white/70 px-3 py-2 text-center"
        />
    </div>
);

/** Full-screen drawer body placeholder (contact / message / campaign details). */
export const DrawerSkeleton: React.FC = () => (
    <div className="flex h-full w-full flex-col bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
            <div className="flex items-center gap-4">
                <SkeletonCircle className="h-12 w-12" />
                <div className="space-y-2">
                    <Skeleton className="h-5 w-36" />
                    <Skeleton className="h-4 w-28" />
                    <div className="flex gap-1.5 pt-0.5">
                        <Skeleton rounded="rounded-full" className="h-4 w-16" />
                        <Skeleton rounded="rounded-full" className="h-4 w-14" />
                    </div>
                </div>
            </div>
            <Skeleton rounded="rounded-xl" className="h-9 w-9" />
        </div>
        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
            {repeat(3).map((_, i) => (
                <div
                    key={i}
                    className="rounded-2xl border border-gray-100 bg-white p-5"
                >
                    <Skeleton className="h-4 w-32" />
                    <div className="mt-4 space-y-3">
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-5/6" />
                        <Skeleton className="h-3 w-2/3" />
                    </div>
                </div>
            ))}
        </div>
    </div>
);
