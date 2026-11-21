// src/features/rewards/hooks/useRewardSummaryQuery.js
import { useQuery } from '@tanstack/react-query';
import { rewardsApi } from '../api/rewards.api';
import { rewardKeys } from '../api/rewards.keys';

export function useRewardSummaryQuery() {
  return useQuery({
    queryKey: [...rewardKeys.all, 'summary'],
    queryFn: async () => {
      const response = await rewardsApi.getRewardSummary();

      // Response: { status: true, data: { total_rewards, rewarded_employees, total_amount } }
      const data = response?.data || {};

      return {
        totalRewards: data.total_rewards || 0,
        affectedEmployees: data.rewarded_employees || 0,
        totalAmount: data.total_amount || '0.00',
      };
    },
  });
}
