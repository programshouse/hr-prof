import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';

import PenaltiesTable from './PenaltiesTable.jsx';
import RewardsTable from './RewardsTable.jsx';

import PenaltyModal from '@/features/penalties/components/PenaltyModal.jsx';
import RewardModal from '@/features/rewards/components/RewardModal.jsx';
import { penaltiesApi } from '@/features/penalties/api/penalties.api';

import DeletePenaltyModal from '@/features/penalties/components/DeletePenaltyModal.jsx';
import DeleteRewardModal from '@/features/rewards/components/DeleteRewardModal.jsx';

import { useEmployeeProfileStore } from '@/stores/useEmployeeProfileStore';
import { useAuthStore } from '@/services/auth/auth.store';

import { getHeaderEmployeeData } from '@/features/employees/pages/employeesUtils';

export default function EmployeeRewardsAndPenalties({
  employeeId,
  isLoading = false,
  employeeName: employeeNameProp = '',
}) {
  const { t } = useTranslation();

  const {
    rewardsAndPenalties,
    getRewardsAndPenalties,
    isRewardsAndPenaltiesLoading,
    profile,
  } = useEmployeeProfileStore();

  const user = useAuthStore((state) => state.user);

  const authSource = useAuthStore((state) => state.authSource);
  const role = useAuthStore((state) => state.role);

  const isEmployeePortal =
    authSource === 'employee-login' ||
    role === 'employee';

  const canManageRewardsAndPenalties = !isEmployeePortal;

  const headerEmployee = getHeaderEmployeeData(profile);

  const employeeName =
    employeeNameProp ||
    headerEmployee?.name ||
    user?.name ||
    user?.full_name ||
    null;

  const [editingPenalty, setEditingPenalty] = useState(null);
  const [editingReward, setEditingReward] = useState(null);

  const [deletingPenalty, setDeletingPenalty] = useState(null);
  const [deletingReward, setDeletingReward] = useState(null);

  const [isAddPenaltyOpen, setIsAddPenaltyOpen] = useState(false);
  const [isAddRewardOpen, setIsAddRewardOpen] = useState(false);

  const refetch = () => {
    if (employeeId) {
      getRewardsAndPenalties(employeeId);
    }
  };

  // /RewardsAndPenalties/:employeeId is a profile summary endpoint.
  // Its penalty rows do not always contain all edit-only fields
  // (calculation_type, days_count, other, etc.).
  // Fetch the authoritative penalty record before opening Edit so this modal
  // uses the exact same data contract as the Penalties page in the sidebar.
  const handlePenaltyEdit = async (row) => {
    const penaltyId = row?.id ?? row?.penalty_id;

    if (!penaltyId) {
      setEditingPenalty(row);
      return;
    }

    try {
      const response = await penaltiesApi.getPenalty(penaltyId);
      const fullPenalty = response?.data?.data ?? response?.data ?? response;

      if (fullPenalty && typeof fullPenalty === 'object' && !Array.isArray(fullPenalty)) {
        setEditingPenalty({
          ...row,
          ...fullPenalty,
          employee: fullPenalty.employee ?? row?.employee,
        });
        return;
      }
    } catch (error) {
      console.error('Failed to load full penalty before edit:', error);
    }

    // Keep edit usable even if the detail request fails.
    setEditingPenalty(row);
  };

  const handlePenaltyUpdated = () => {
    setEditingPenalty(null);
    refetch();
  };

  const handleRewardUpdated = () => {
    setEditingReward(null);
    refetch();
  };

  const handlePenaltyDeleted = () => {
    setDeletingPenalty(null);
    refetch();
  };

  const handleRewardDeleted = () => {
    setDeletingReward(null);
    refetch();
  };

  useEffect(() => {
    if (
      employeeId &&
      employeeId !== 'undefined' &&
      employeeId !== 'null'
    ) {
      getRewardsAndPenalties(employeeId);
    }
  }, [employeeId, getRewardsAndPenalties]);

  const isComponentLoading =
    isLoading || isRewardsAndPenaltiesLoading;

  if (isComponentLoading) {
    return (
      <div className="space-y-6">
        <div className="h-40 w-full animate-pulse rounded-xl bg-slate-100" />
        <div className="h-40 w-full animate-pulse rounded-xl bg-slate-100" />
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* ADD BUTTONS - HR / ADMIN ONLY */}
      {canManageRewardsAndPenalties && (
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            onClick={() => setIsAddPenaltyOpen(true)}
          >
            <Plus className="mr-1 h-4 w-4" />

            {t(
              'penalties.modal.addPenalty',
              'Add Penalty'
            )}
          </Button>

          <Button
            size="sm"
            onClick={() => setIsAddRewardOpen(true)}
          >
            <Plus className="mr-1 h-4 w-4" />

            {t(
              'rewards.modal.addReward',
              'Add Reward'
            )}
          </Button>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">

        <PenaltiesTable
          penalties={
            rewardsAndPenalties?.penalties || []
          }
          isLoading={
            isRewardsAndPenaltiesLoading
          }

          onEdit={handlePenaltyEdit}
          onDelete={setDeletingPenalty}

          /*
           * Employee login:
           * icons visible but disabled
           */
          actionsDisabled={isEmployeePortal}
        />

        <RewardsTable
          rewards={
            rewardsAndPenalties?.rewards || []
          }
          isLoading={
            isRewardsAndPenaltiesLoading
          }

          onEdit={setEditingReward}
          onDelete={setDeletingReward}

          /*
           * Employee login:
           * icons visible but disabled
           */
          actionsDisabled={isEmployeePortal}
        />

      </div>

      {/* CRUD MODALS - HR / ADMIN ONLY */}
      {canManageRewardsAndPenalties && (
        <>
          <PenaltyModal
            open={isAddPenaltyOpen}
            onOpenChange={setIsAddPenaltyOpen}
            penalty={null}
            onSuccess={() => {
              setIsAddPenaltyOpen(false);
              refetch();
            }}
            defaultEmployeeIds={[
              String(employeeId),
            ]}
            employeeName={employeeName}
          />

          <RewardModal
            open={isAddRewardOpen}
            onOpenChange={setIsAddRewardOpen}
            reward={null}
            onSuccess={() => {
              setIsAddRewardOpen(false);
              refetch();
            }}
            defaultEmployeeIds={[
              String(employeeId),
            ]}
            employeeName={employeeName}
          />

          <PenaltyModal
            open={!!editingPenalty}
            onOpenChange={(open) => {
              if (!open) {
                setEditingPenalty(null);
              }
            }}
            penalty={editingPenalty}
            onSuccess={handlePenaltyUpdated}
          />

          <RewardModal
            open={!!editingReward}
            onOpenChange={(open) => {
              if (!open) {
                setEditingReward(null);
              }
            }}
            reward={editingReward}
            onSuccess={handleRewardUpdated}
          />

          <DeletePenaltyModal
            open={!!deletingPenalty}
            onOpenChange={(open) => {
              if (!open) {
                setDeletingPenalty(null);
              }
            }}
            penalty={deletingPenalty}
            onSuccess={handlePenaltyDeleted}
          />

          <DeleteRewardModal
            open={!!deletingReward}
            onOpenChange={(open) => {
              if (!open) {
                setDeletingReward(null);
              }
            }}
            reward={deletingReward}
            onSuccess={handleRewardDeleted}
          />
        </>
      )}

    </div>
  );
}