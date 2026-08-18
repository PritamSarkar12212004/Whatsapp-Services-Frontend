import { useQuery } from "@tanstack/react-query";
import { fetchAnalytics } from "@/features/dashboard/api/analytics.api";

export const useAnalytics = () => {
    return useQuery({
        queryKey: ["dashboard-analytics"],
        queryFn: fetchAnalytics,
        refetchInterval: 30000,
    });
};
