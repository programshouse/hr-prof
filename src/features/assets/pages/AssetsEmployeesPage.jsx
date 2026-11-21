// src/features/assets/pages/AssetsEmployeesPage.jsx
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/EmptyState";
import PageSizeSelect from "@/components/shared/PageSizeSelect";
import { Pagination } from "@/components/ui/Pagination";
import AssetStatsCards from "@/components/shared/AssetStatsCards";
import { useTranslation } from 'react-i18next';

import AssetsFilters from "../components/AssetsFilters";
import AssetsHeaderActions from "../components/AssetsHeaderActions";
import AssetEmployeeTable from "../components/AssetEmployeeTable";
import AssignAssetModal from "../components/AssignAssetModal";
import EditEmployeeAssetModal from "../components/EditEmployeeAssetModal";
import DeleteEmployeeAssetModal from "../components/DeleteEmployeeAssetModal";
import { useEmployeeAssets, useDeleteEmployeeAsset, useCreateEmployeeAsset, useUpdateEmployeeAsset } from "../hooks/useEmployeeAssetsQuery";
import { useAssetsStatsQuery } from "../hooks/useAssetsStatsQuery";
import { ASSETS_STATS_PERMISSIONS, useHasPermission } from "@/lib/permissions";
import { toast } from "sonner";

export default function AssetsEmployeesPage() {
  const { t } = useTranslation();
  const canViewAssetsStats = useHasPermission(ASSETS_STATS_PERMISSIONS);
  const [filters, setFilters] = useState({
    search: "",
    asset_type: "all",
    status: "all",
    department_id: "all",
    branch_id: "all",
    from_date: undefined,
    to_date: undefined,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingEmployeeAsset, setEditingEmployeeAsset] = useState(null);
  const [assetToDelete, setAssetToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Build query parameters from filters and pagination
  const queryParams = useMemo(() => {
    const params = {};
    if (filters.search) params.keyword = filters.search;
    if (filters.asset_type && filters.asset_type !== "all") params.asset_type = filters.asset_type;
    if (filters.status && filters.status !== "all") params.status = filters.status;
    if (filters.department_id && filters.department_id !== "all") params.department_id = filters.department_id;
    if (filters.branch_id && filters.branch_id !== "all") params.branch_id = filters.branch_id;
    
    // Format dates to YYYY-MM-DD strings
    if (filters.from_date) {
      const fromDate = new Date(filters.from_date);
      params.from = fromDate.toISOString().split('T')[0];
    }
    if (filters.to_date) {
      const toDate = new Date(filters.to_date);
      params.to = toDate.toISOString().split('T')[0];
    }
    
    params.page = currentPage;
    params.per_page = pageSize;
    
    // Debug logging
    console.log('Filters:', filters);
    console.log('Query params sent to API:', params);
    
    return params;
  }, [filters, currentPage, pageSize]);

  // Fetch employee assets data
  const { data: employeeAssetsData = [], isLoading, refetch } = useEmployeeAssets(queryParams);
  const { data: stats } = useAssetsStatsQuery({
    keyword: filters.search || undefined,
    department_id: filters.department_id !== "all" ? filters.department_id : undefined,
    branch_id: filters.branch_id !== "all" ? filters.branch_id : undefined,
    from: filters.from_date ? new Date(filters.from_date).toISOString().split('T')[0] : undefined,
    to: filters.to_date ? new Date(filters.to_date).toISOString().split('T')[0] : undefined,
  });
  const deleteMutation = useDeleteEmployeeAsset();
  const createMutation = useCreateEmployeeAsset();
  const updateMutation = useUpdateEmployeeAsset();

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
    setIsSubmitting(true);
    try {
      const payload = Object.fromEntries(formData);
      console.log('Submitting asset data:', payload);
      
      // Map form fields to API expected format
      const apiPayload = {
        employee_id: parseInt(payload.employeeId),
        asset_id: parseInt(payload.asset),
        quantity: parseInt(payload.numberOfAssets),
        start_date: payload.startDate,
        end_date: payload.endDate,
        status: payload.status,
      };
      
      // Call the actual create API
      await createMutation.mutateAsync(apiPayload);
      
      // Close modal on success
      setIsAddModalOpen(false);
      
      // Refresh data
      refetch();
      toast.success(t('assets.employeeAssets.assetAssignedSuccess'));
    } catch (error) {
      console.error('Error adding asset:', error);
      toast.error(t('assets.employeeAssets.failedToAssign'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (employeeAsset) => {
    setEditingEmployeeAsset(employeeAsset);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const payload = Object.fromEntries(formData);
      console.log('Updating asset data:', payload);
      
      // Map form fields to API expected format
      const apiPayload = {
        employee_id: parseInt(payload.employeeId),
        asset_id: parseInt(payload.asset),
        quantity: parseInt(payload.numberOfAssets),
        start_date: payload.startDate,
        end_date: payload.endDate,
        status: payload.status,
      };
      
      // Call the actual update API
      await updateMutation.mutateAsync({
        id: editingEmployeeAsset.id,
        ...apiPayload
      });
      
      // Close modal on success
      setIsEditModalOpen(false);
      setEditingEmployeeAsset(null);
      
      toast.success(t('assets.employeeAssets.assetUpdatedSuccess'));
    } catch (error) {
      console.error('Error updating asset:', error);
      toast.error(t('assets.employeeAssets.failedToUpdate'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (employeeAsset) => {
    setAssetToDelete(employeeAsset);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (assetToDelete) {
      try {
        await deleteMutation.mutateAsync(assetToDelete.id);
        setIsDeleteModalOpen(false);
        setAssetToDelete(null);
        toast.success(t('assets.employeeAssets.assetDeletedSuccess'));
      } catch (error) {
        console.error('Error deleting asset assignment:', error);
        toast.error(t('assets.employeeAssets.failedToDelete'));
      }
    }
  };

  // Use API data directly - filtering is handled by the backend
  const currentData = employeeAssetsData;
  const hasNoData = !isLoading && employeeAssetsData.length === 0;
  const totalPages = 1; // TODO: Get from API meta data

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {canViewAssetsStats && <AssetStatsCards stats={stats} />}

      {/* Filters Section */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex-1 xl:max-w-5xl">
          <AssetsFilters filters={filters} onFiltersChange={handleFiltersChange} showStatus={true} showDateFilters={true} />
        </div>

        <AssetsHeaderActions
          onAddAsset={handleAddAsset}
        />
      </div>

      {/* Page Size and View Controls */}
      <div className="flex items-center justify-between">
        <PageSizeSelect value={pageSize} onChange={handlePageSizeChange} />

      </div>

      {/* Employees Display */}
      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <div className="text-sm text-slate-500">{t('common.loading')}</div>
        </div>
      ) : hasNoData ? (
        <EmptyState
          title="لا توجد أصول موظفين"
          description="لا توجد أصول موظفين تطابق الفلاتر الحالية"
          action={
            <Button onClick={() => setFilters({ search: "", asset_type: "all", status: "all", department_id: "all", branch_id: "all" })}>
              مسح الفلاتر
            </Button>
          }
        />
      ) : (
        <AssetEmployeeTable
          data={currentData}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Pagination */}
      {!hasNoData && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Delete Employee Asset Modal */}
      <DeleteEmployeeAssetModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={handleConfirmDelete}
        loading={deleteMutation.isPending}
        assetName={assetToDelete?.asset?.name || assetToDelete?.asset_name || 'this asset'}
      />

      {/* Edit Employee Asset Modal */}
      <EditEmployeeAssetModal
        key={editingEmployeeAsset?.id || 'edit-modal'}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onSubmit={handleEditSubmit}
        loading={isSubmitting}
        employeeAsset={editingEmployeeAsset}
      />

      {/* Assign Asset Modal */}
      <AssignAssetModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSubmit={handleAddAssetSubmit}
        loading={isSubmitting}
      />
    </div>
  );
}
