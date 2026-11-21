// src/features/assets/pages/AssetsPage.jsx
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/EmptyState";
import PageSizeSelect from "@/components/shared/PageSizeSelect";
import { Pagination } from "@/components/ui/Pagination";
import AssetStatsCards from "@/components/shared/AssetStatsCards";
import { useTranslation } from 'react-i18next';

import AssetsFilters from "../components/AssetsFilters";
import AssetsHeaderActions from "../components/AssetsHeaderActions";
import AssetTable from "../components/AssetTable";
import AddAssetModal from "../components/AddAssetModal";
import EditAssetModal from "../components/EditAssetModal";
import ConfirmationModal from "@/components/ui/deleteassetmodal";
import { toast } from "sonner";
import { useAssetsQuery } from "../hooks/useAssetsQuery";
import { useCreateAssetMutation, useUpdateAssetMutation, useDeleteAssetMutation } from "../hooks/useAssetsMutations";
import { useAssetsStatsQuery } from "../hooks/useAssetsStatsQuery";

export default function AssetsPage() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    search: "",
    asset_type: "all",
    status: "all",
    department_id: "all",
    branch_id: "all",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState(null);
  const [editingAsset, setEditingAsset] = useState(null);

  // API queries and mutations
  const { data: assetsResponse, isLoading, error } = useAssetsQuery({
    page: currentPage,
    limit: pageSize,
    search: filters.search || undefined,
  });

  const { data: stats } = useAssetsStatsQuery({
    keyword: filters.search || undefined,
    department_id: filters.department_id !== "all" ? filters.department_id : undefined,
    branch_id: filters.branch_id !== "all" ? filters.branch_id : undefined,
  });

  const createAssetMutation = useCreateAssetMutation();
  const updateAssetMutation = useUpdateAssetMutation();
  const deleteAssetMutation = useDeleteAssetMutation();

  // Extract data from API response
  const assetsData = useMemo(() => assetsResponse?.data || [], [assetsResponse?.data]);
  const totalItems = assetsResponse?.meta?.total || assetsResponse?.total || assetsData.length;
  const serverCurrentPage = assetsResponse?.meta?.current_page || 1;
  const totalPages = assetsResponse?.meta?.last_page || Math.ceil(totalItems / pageSize);

  // Calculate stats from real data
  const apiStats = useMemo(() => {
    const totalAssets = assetsData.length;
    const returnedAssets = assetsData.filter(asset => 
      asset.status?.toLowerCase() === 'returned'
    ).length;
    const lostAssets = assetsData.filter(asset => 
      asset.status?.toLowerCase() === 'lost'
    ).length;

    return {
      totalAssets: { count: totalAssets, changePercent: 12 },
      returnedAssets: { count: returnedAssets, changePercent: -10 },
      lostAssets: { count: lostAssets, changePercent: -10 },
    };
  }, [assetsData]);

  // Use API stats if available, otherwise fallback to calculated stats
  const displayStats = stats || apiStats;

  const handleFiltersChange = (nextFilters) => {
    setFilters(nextFilters || {});
    setCurrentPage(1);
  };

  const handlePageSizeChange = (value) => {
    const num = Number(value) || 10;
    setPageSize(num);
    setCurrentPage(1);
  };

  const handleAddAsset = () => {
    setIsAddModalOpen(true);
  };

  const handleAddAssetSubmit = async (formData) => {
    try {
      const assetData = Object.fromEntries(formData);
      await createAssetMutation.mutateAsync(assetData);
      
      // Close modal on success
      setIsAddModalOpen(false);
      
      toast.success(t('assets.assetAssignedSuccess'));
    } catch (error) {
      console.error('Error adding asset:', error);
      toast.error(t('assets.failedToAssign'));
    }
  };

  const handleEditAsset = (asset) => {
    setEditingAsset(asset);
    setIsEditModalOpen(true);
  };

  const handleEditAssetSubmit = async (formData) => {
    try {
      await updateAssetMutation.mutateAsync({
        id: editingAsset.id,
        data: formData
      });
      
      // Close modal on success
      setIsEditModalOpen(false);
      setEditingAsset(null);
      
      toast.success(t('assets.assetUpdatedSuccess'));
    } catch (error) {
      console.error('Error updating asset:', error);
      toast.error(t('assets.failedToUpdate'));
    }
  };

  const handleDeleteAsset = (asset) => {
    setAssetToDelete(asset);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (assetToDelete) {
      try {
        await deleteAssetMutation.mutateAsync(assetToDelete.id);
        toast.success(t('assets.assetDeletedSuccess'));
        setIsDeleteModalOpen(false);
        setAssetToDelete(null);
      } catch (error) {
        console.error('Error deleting asset:', error);
        toast.error(t('assets.failedToDelete'));
      }
    }
  };

  const hasNoData = assetsData.length === 0;
  const shouldShowPagination = totalPages > 1;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <AssetStatsCards stats={displayStats} />

      {/* Filters Section */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex-1 xl:max-w-5xl">
  <AssetsFilters filters={filters} onFiltersChange={handleFiltersChange} showStatus={false} />
        </div>

        <AssetsHeaderActions
          onAddAsset={handleAddAsset}
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="text-sm text-gray-500">{t('assets.loadingAssets')}</div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex justify-center py-8">
          <div className="text-sm text-red-500">{t('assets.errorLoadingAssets')}: {error.message}</div>
        </div>
      )}

      {/* Page Size and View Controls */}
      {!isLoading && !error && (
        <div className="flex items-center justify-between">
          <PageSizeSelect value={pageSize} onChange={handlePageSizeChange} />
        </div>
      )}

      {/* Assets Display */}
      {!isLoading && !error && (hasNoData ? (
        <EmptyState
          title={t('assets.noAssetsFound')}
          description={t('assets.getStarted')}
          action={
            <Button onClick={handleAddAsset}>
              <Plus className="mr-2 size-4" />
              {t('assets.addAsset')}
            </Button>
          }
        />
      ) : (
        <AssetTable
          data={assetsData}
          onEdit={handleEditAsset}
          onDelete={handleDeleteAsset}
        />
      ))}

      {/* Pagination */}
      {!isLoading && !error && shouldShowPagination && (
        <Pagination
          currentPage={serverCurrentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Add Asset Modal */}
      <AddAssetModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSubmit={handleAddAssetSubmit}
        loading={createAssetMutation.isPending}
      />

      {/* Edit Asset Modal */}
      <EditAssetModal
        key={editingAsset?.id || 'edit-modal'}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onSubmit={handleEditAssetSubmit}
        loading={updateAssetMutation.isPending}
        asset={editingAsset}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={handleConfirmDelete}
        title={`${t('assets.deleteAsset', { assetName: assetToDelete?.name || t('common.thisAsset') })}`}
        description={t('assets.deleteAssetDescription')}
        confirmText={t('assets.delete')}
        cancelText={t('common.cancel')}
        loading={deleteAssetMutation.isPending}
      />
    </div>
  );
}
