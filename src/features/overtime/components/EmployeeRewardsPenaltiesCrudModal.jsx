import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import RewardsTable from '@/features/rewards/components/RewardsTable';
import RewardModal from '@/features/rewards/components/RewardModal';
import { rewardsApi } from '@/features/rewards/api/rewards.api';

import PenaltiesTable from '@/features/penalties/components/PenaltiesTable';
import PenaltyModal from '@/features/penalties/components/PenaltyModal';
import { penaltiesApi } from '@/features/penalties/api/penalties.api';

const extractRows = (response, key) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.[key])) return response[key];
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.data?.[key])) return response.data[key];
  return [];
};

const belongsToEmployee = (row, employeeId) => {
  const rowEmployeeId =
    row?.employee_id ??
    row?.employee?.employee_id ??
    row?.employee?.id ??
    null;

  if (rowEmployeeId == null) return true;

  return String(rowEmployeeId) === String(employeeId);
};

export default function EmployeeRewardsPenaltiesCrudModal({
  open,
  onOpenChange,
  employeeId,
  employeeName = '',
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('rewards');
  const [rewardModalOpen, setRewardModalOpen] = useState(false);
  const [penaltyModalOpen, setPenaltyModalOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);
  const [selectedPenalty, setSelectedPenalty] = useState(null);

  const {
    data: rewardsResponse,
    isLoading: rewardsLoading,
    isFetching: rewardsFetching,
  } = useQuery({
    queryKey: ['rewards', 'employee', employeeId],
    queryFn: () =>
      rewardsApi.getRewards({
        employee_id: employeeId,
        limit: 10000,
      }),
    enabled: open && !!employeeId && activeTab === 'rewards',
    retry: false,
  });

  const {
    data: penaltiesResponse,
    isLoading: penaltiesLoading,
    isFetching: penaltiesFetching,
  } = useQuery({
    queryKey: ['penalties', 'employee', employeeId],
    queryFn: () =>
      penaltiesApi.getPenalties({
        employee_id: employeeId,
        limit: 10000,
      }),
    enabled: open && !!employeeId && activeTab === 'penalties',
    retry: false,
  });

  const rewards = useMemo(
    () =>
      extractRows(rewardsResponse, 'rewards')
        .filter((row) => belongsToEmployee(row, employeeId))
        .map((row) => ({
          ...row,
          employee: {
            ...(row?.employee || {}),
            full_name:
              row?.employee?.full_name ||
              row?.employeeName ||
              employeeName ||
              '—',
          },
        })),
    [rewardsResponse, employeeId, employeeName]
  );

  const penalties = useMemo(
    () =>
      extractRows(penaltiesResponse, 'penalties')
        .filter((row) => belongsToEmployee(row, employeeId))
        .map((row) => ({
          ...row,
          employee: {
            ...(row?.employee || {}),
            full_name:
              row?.employee?.full_name ||
              row?.employeeName ||
              employeeName ||
              '—',
          },
        })),
    [penaltiesResponse, employeeId, employeeName]
  );

  const refreshRewards = () => {
    queryClient.invalidateQueries({ queryKey: ['rewards'] });
  };

  const refreshPenalties = () => {
    queryClient.invalidateQueries({ queryKey: ['penalties'] });
  };

  const openAddReward = () => {
    setSelectedReward(null);
    setRewardModalOpen(true);
  };

  const openAddPenalty = () => {
    setSelectedPenalty(null);
    setPenaltyModalOpen(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] !w-[1180px] !max-w-[94vw] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {t('employees.profile.details.rewardsAndPenalties.title', 'Rewards & Penalties')}
              {employeeName ? ` — ${employeeName}` : ''}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="inline-flex w-fit rounded-lg bg-slate-100 p-1">
                <Button
                  type="button"
                  size="sm"
                  variant={activeTab === 'rewards' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('rewards')}
                >
                  {t('rewards.title', 'Rewards')}
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant={activeTab === 'penalties' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('penalties')}
                >
                  {t('penalties.title', 'Penalties')}
                </Button>
              </div>

              {activeTab === 'rewards' ? (
                <Button type="button" size="sm" onClick={openAddReward}>
                  <Plus className="mr-1.5 h-4 w-4" />
                  {t('rewards.modal.addReward', 'Add Reward')}
                </Button>
              ) : (
                <Button type="button" size="sm" onClick={openAddPenalty}>
                  <Plus className="mr-1.5 h-4 w-4" />
                  {t('penalties.modal.addPenalty', 'Add Penalty')}
                </Button>
              )}
            </div>

            {activeTab === 'rewards' ? (
              rewardsLoading ? (
                <div className="space-y-3 rounded-xl border border-slate-200 p-4">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton key={index} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                <div className={rewardsFetching ? 'opacity-70' : ''}>
                  <RewardsTable
                    data={rewards}
                    loading={rewardsLoading}
                    onEdit={(reward) => {
                      setSelectedReward(reward);
                      setRewardModalOpen(true);
                    }}
                  />
                </div>
              )
            ) : penaltiesLoading ? (
              <div className="space-y-3 rounded-xl border border-slate-200 p-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <div className={penaltiesFetching ? 'opacity-70' : ''}>
                <PenaltiesTable
                  data={penalties}
                  loading={penaltiesLoading}
                  onEdit={(penalty) => {
                    setSelectedPenalty(penalty);
                    setPenaltyModalOpen(true);
                  }}
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <RewardModal
        open={rewardModalOpen}
        onOpenChange={(nextOpen) => {
          setRewardModalOpen(nextOpen);
          if (!nextOpen) setSelectedReward(null);
        }}
        reward={selectedReward}
        defaultEmployeeIds={employeeId ? [String(employeeId)] : []}
        employeeName={employeeName}
        lockEmployee
        onSuccess={refreshRewards}
      />

      <PenaltyModal
        open={penaltyModalOpen}
        onOpenChange={(nextOpen) => {
          setPenaltyModalOpen(nextOpen);
          if (!nextOpen) setSelectedPenalty(null);
        }}
        penalty={selectedPenalty}
        defaultEmployeeIds={employeeId ? [String(employeeId)] : []}
        employeeName={employeeName}
        lockEmployee
        onSuccess={refreshPenalties}
      />
    </>
  );
}
