// src/features/assets/hooks/useAssetsStatsQuery.js
import { useQuery } from "@tanstack/react-query";
import { ASSETS_STATS_PERMISSIONS, useHasPermission } from "@/lib/permissions";
import { assetsApi, assetsKeys } from "../api/assets.api";

export const useAssetsStatsQuery = (filters = {}, options = {}) => {
  const canViewAssetsStats = useHasPermission(ASSETS_STATS_PERMISSIONS);

  return useQuery({
    queryKey: assetsKeys.statsWithFilters(filters),
    queryFn: () => assetsApi.getStats(filters),
    enabled: options.enabled !== false && canViewAssetsStats,
    select: (data) => {
      // Transform API response to match the expected format
      if (data?.status && data?.data) {
        return {
          totalAssets: { count: data.data.total || 0, changePercent: 0 },
          returnedAssets: { count: data.data.returned || 0, changePercent: 0 },
          lostAssets: { count: data.data.lost || 0, changePercent: 0 },
        };
      }
      // Fallback to default values
      return {
        totalAssets: { count: 0, changePercent: 0 },
        returnedAssets: { count: 0, changePercent: 0 },
        lostAssets: { count: 0, changePercent: 0 },
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2, // Retry failed requests twice
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
};
