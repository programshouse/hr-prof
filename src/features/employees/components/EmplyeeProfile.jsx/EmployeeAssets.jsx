import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/services/auth/auth.store';
import { useEmployeeProfileStore } from '@/stores/useEmployeeProfileStore';
import { getHeaderEmployeeData } from '@/features/employees/pages/employeesUtils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Package, Calendar, Trash2, Edit, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import axiosClient from '@/services/http/axiosClient';
import AssignAssetModal from '@/features/assets/components/AssignAssetModal';
import EditEmployeeAssetModal from '@/features/assets/components/EditEmployeeAssetModal';
import DeleteEmployeeAssetModal from '@/features/assets/components/DeleteEmployeeAssetModal';
import { useDeleteEmployeeAsset, useCreateEmployeeAsset, useUpdateEmployeeAsset } from '@/features/assets/hooks/useEmployeeAssetsQuery';

function SectionHeader({ icon: Icon, title }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <Icon className="h-5 w-5 text-slate-600" />
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
    </div>
  );
}

export default function EmployeeAssets({ employeeId, isLoading: parentLoading }) {
  const { t } = useTranslation();
  const { user, authSource } = useAuthStore();
  const isEmployeePortal = authSource === 'employee-login';
  const profile = useEmployeeProfileStore((s) => s.profile);
  // Resolve name the same way as the profile header
  const headerEmployee = getHeaderEmployeeData(profile);
  const employeeName =
    headerEmployee?.name ||
    user?.name ||
    user?.full_name ||
    null;
  const [assets, setAssets] = useState([]);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [assetToDelete, setAssetToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createMutation = useCreateEmployeeAsset();
  const updateMutation = useUpdateEmployeeAsset();
  const deleteMutation = useDeleteEmployeeAsset();

  useEffect(() => {
    const fetchAssets = async () => {
      if (!employeeId) return;
      
      try {
        setAssetsLoading(true);
        const response = await axiosClient.get(`/${employeeId}/assets`);
        setAssets(response.data?.data || []);
      } catch (error) {
        console.error('Failed to fetch assets:', error);
        setAssets([]);
      } finally {
        setAssetsLoading(false);
      }
    };

    fetchAssets();
  }, [employeeId]);

  const refetch = async () => {
    if (!employeeId) return;
    try {
      setAssetsLoading(true);
      const response = await axiosClient.get(`/${employeeId}/assets`);
      setAssets(response.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch assets:', error);
    } finally {
      setAssetsLoading(false);
    }
  };

  const isLoading = parentLoading || assetsLoading;

  const handleAddAsset = () => {
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const payload = Object.fromEntries(formData);
      const apiPayload = {
        employee_id: parseInt(employeeId),
        asset_id: parseInt(payload.asset),
        quantity: parseInt(payload.numberOfAssets),
        start_date: payload.startDate,
        end_date: payload.endDate,
        status: payload.status,
      };

      await createMutation.mutateAsync(apiPayload);
      setIsAddModalOpen(false);
      refetch();
      toast.success(t('assets.employeeAssets.assetAssignedSuccess'));
    } catch (error) {
      console.error('Error adding asset:', error);
      toast.error(t('assets.employeeAssets.failedToAssign'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (asset) => {
    setEditingAsset(asset);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const payload = Object.fromEntries(formData);
      const apiPayload = {
        employee_id: parseInt(employeeId),
        asset_id: parseInt(payload.asset),
        quantity: parseInt(payload.numberOfAssets),
        start_date: payload.startDate,
        end_date: payload.endDate,
        status: payload.status,
      };

      await updateMutation.mutateAsync({
        id: editingAsset.id,
        ...apiPayload
      });

      setIsEditModalOpen(false);
      setEditingAsset(null);
      refetch();
      toast.success(t('assets.employeeAssets.assetUpdatedSuccess'));
    } catch (error) {
      console.error('Error updating asset:', error);
      toast.error(t('assets.employeeAssets.failedToUpdate'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (asset) => {
    setAssetToDelete(asset);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (assetToDelete) {
      try {
        await deleteMutation.mutateAsync(assetToDelete.id);
        setIsDeleteModalOpen(false);
        setAssetToDelete(null);
        refetch();
        toast.success(t('assets.employeeAssets.assetDeletedSuccess'));
      } catch (error) {
        console.error('Error deleting asset:', error);
        toast.error(t('assets.employeeAssets.failedToDelete'));
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      returned: 'bg-blue-100 text-blue-800',
      damaged: 'bg-red-100 text-red-800',
    };
    return statusStyles[status] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <SectionHeader icon={Package} title={t('assets.employeeAssets.title')} />
          {!isEmployeePortal && (
            <Button size="sm" onClick={handleAddAsset}>
              <Plus className="mr-1 h-4 w-4" />
              {t('assets.employeeAssets.assignAsset', 'Assign Asset')}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {assets.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('assets.employeeAssets.assetName')}</TableHead>
                  <TableHead>{t('assets.employeeAssets.quantity')}</TableHead>
                  <TableHead>{t('assets.employeeAssets.startDate')}</TableHead>
                  <TableHead>{t('assets.employeeAssets.endDate')}</TableHead>
                  <TableHead>{t('assets.employeeAssets.status')}</TableHead>
                  <TableHead className="text-right">{t('assets.employeeAssets.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-slate-500" />
                        {asset.asset?.name || asset.asset_name || t('common.na')}
                      </div>
                    </TableCell>
                    <TableCell>{asset.quantity || 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {asset.start_date || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {asset.end_date || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(asset.status)}>
                        {asset.status || 'active'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(asset)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(asset)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        
        ) : (
          <EmptyState
            icon={<Package className="h-6 w-6 text-slate-400" />}
            title={t('assets.employeeAssets.noAssetsAssigned')}
            description={t('assets.employeeAssets.noAssetsDescription')}
          />
        )}
      </CardContent>

      {/* Assign Asset Modal — HR only */}
      {!isEmployeePortal && (
        <AssignAssetModal
          open={isAddModalOpen}
          onOpenChange={setIsAddModalOpen}
          onSubmit={handleAddSubmit}
          loading={isSubmitting}
          defaultEmployeeId={String(employeeId)}
          employeeName={employeeName}
        />
      )}

      {/* Edit Asset Modal */}
      <EditEmployeeAssetModal
        key={editingAsset?.id || 'edit-modal'}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onSubmit={handleEditSubmit}
        loading={isSubmitting}
        employeeAsset={editingAsset}
      />

      {/* Delete Asset Modal */}
      <DeleteEmployeeAssetModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={handleConfirmDelete}
        loading={deleteMutation.isPending}
        assetName={assetToDelete?.asset?.name || assetToDelete?.asset_name || 'this asset'}
      />
    </Card>
  );
}
