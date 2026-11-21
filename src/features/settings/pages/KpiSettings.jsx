import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useAllPositions } from '@/shared/hooks';
import { useKpiItems } from '@/shared/hooks/useKpiItems';
import EditDeleteActions from '../../../components/ui/EditDeleteActions';
import { DeleteKpiDialog } from '../components/DeleteKpiDialog';

export default function KpiSettings() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { data: positionItems = [] } = useAllPositions();
  const [selectedPosition, setSelectedPosition] = useState('');
  const [positionSearch, setPositionSearch] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { kpiItems, isLoading, createKpiItem, updateKpiItem, deleteKpiItem } =
    useKpiItems(selectedPosition);

  const [form, setForm] = useState({
    item: '',
    max_score: 50,
    notes: '',
  });

  const positions = useMemo(() => {
    if (!Array.isArray(positionItems)) return [];
    return positionItems
      .map((p) => ({
        id: String(p?.id ?? p?.value ?? ''),
        label: isRTL
          ? p?.title_ar ?? p?.name_ar ?? p?.title_en ?? p?.title ?? p?.name_en ?? String(p ?? '')
          : p?.title_en ?? p?.title ?? p?.name_en ?? p?.title_ar ?? p?.name_ar ?? String(p ?? ''),
      }))
      .filter((p) => p.id && p.label);
  }, [positionItems, isRTL]);

  const openAdd = () => {
    setEditingItem(null);
    setForm({ item: '', max_score: 50, notes: '' });
    setOpenModal(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({
      item: item.item,
      max_score: item.max_score,
      notes: item.notes || '',
    });
    setOpenModal(true);
  };

  const onSave = async () => {
    if (!selectedPosition) return toast.error(t('settings.kpiSetup.selectPositionRequired'));
    if (!form.item.trim()) return toast.error(t('settings.kpiSetup.itemNameRequired'));

    try {
      if (editingItem) {
        await updateKpiItem(editingItem.id, form);
        toast.success(t('settings.kpiSetup.itemUpdated'));
      } else {
        await createKpiItem(form);
        toast.success(t('settings.kpiSetup.itemAdded'));
      }
      setOpenModal(false);
    } catch {
      toast.error(
        editingItem ? t('settings.kpiSetup.itemUpdateFailed') : t('settings.kpiSetup.itemAddFailed')
      );
    }
  };

  const onDelete = (id) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    try {
      await deleteKpiItem(itemToDelete);
      toast.success(t('settings.kpiSetup.itemDeleted'));
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch {
      toast.error(t('settings.kpiSetup.itemDeleteFailed'));
    } finally {
      setIsDeleting(false);
    }
  };

  const updateKpiScore = async (id, max_score) => {
    try {
      await updateKpiItem(id, { max_score });
    } catch {
      toast.error(t('settings.kpiSetup.scoreUpdateFailed'));
    }
  };

  const modalAction = editingItem ? t('common.update') : t('common.add');

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="space-y-4">
      <div className={isRTL ? 'text-right' : 'text-left'}>
        <h2 className="text-lg font-semibold text-slate-900">{t('settings.kpiSetup.title')}</h2>
        <p className="text-sm text-slate-500">{t('settings.kpiSetup.subtitle')}</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-700">
            {t('settings.kpiSetup.selectLabel')} :
          </span>

          <div className="w-[220px]">
            <Select value={selectedPosition} onValueChange={setSelectedPosition}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder={t('settings.kpiSetup.positionPlaceholder')} />
              </SelectTrigger>

              <SelectContent>
                <div className="sticky top-0 z-10 bg-white p-2">
                  <Input
                    placeholder={t('settings.kpiSetup.searchPositions')}
                    value={positionSearch}
                    onChange={(e) => setPositionSearch(e.target.value)}
                    className="h-9"
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                </div>
                {positions
                  .filter((p) => p.label.toLowerCase().includes(positionSearch.toLowerCase()))
                  .map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.label}
                    </SelectItem>
                  ))}

                {positions.filter((p) =>
                  p.label.toLowerCase().includes(positionSearch.toLowerCase())
                ).length === 0 && (
                  <SelectItem value="__empty" disabled>
                    {t('settings.kpiSetup.noPositionsFound')}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={openAdd}
          disabled={!selectedPosition || isLoading}
          className="bg-primary h-9 rounded-md hover:bg-primary"
        >
          <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {t('settings.kpiSetup.addKpiItem')}
        </Button>
      </div>

      <Card className="rounded-xl border-slate-200">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/70">
                <TableHead className="w-[38%]">{t('tables.headers.item')}</TableHead>
                <TableHead className="w-[18%]">{t('tables.headers.maxScore')}</TableHead>
                <TableHead>{t('tables.headers.notes')}</TableHead>
                <TableHead className="w-[160px] text-end">{t('tables.headers.action')}</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center">
                    {t('settings.kpiSetup.loading')}
                  </TableCell>
                </TableRow>
              ) : kpiItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-slate-500">
                    {selectedPosition
                      ? t('settings.kpiSetup.noItemsForPosition')
                      : t('settings.kpiSetup.selectPositionFirst')}
                  </TableCell>
                </TableRow>
              ) : (
                kpiItems.map((kpi) => (
                  <TableRow key={kpi.id} className="border-slate-100">
                    <TableCell className="font-medium text-slate-900">{kpi.item}</TableCell>
                    <TableCell>
                      <Input
                        value={kpi.max_score}
                        onChange={(e) => {
                          const v = Number(e.target.value || 0);
                          updateKpiScore(kpi.id, v);
                        }}
                        className="h-9 w-[110px] rounded-md bg-white"
                        type="number"
                        min={0}
                      />
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">{kpi.notes}</TableCell>
                    <TableCell className="text-end">
                      <div className="flex justify-end">
                        <EditDeleteActions
                          onEdit={() => openEdit(kpi)}
                          onDelete={() => onDelete(kpi.id)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="sm:max-w-[520px]" dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader className={isRTL ? 'text-right' : 'text-left'}>
            <DialogTitle>
              {editingItem
                ? t('settings.modals.kpiItem.editTitle')
                : t('settings.modals.kpiItem.addTitle')}
            </DialogTitle>
            <DialogDescription>
              {t('settings.modals.kpiItem.description', { action: modalAction })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>{t('tables.headers.item')}</Label>
              <Input
                value={form.item}
                onChange={(e) => setForm((p) => ({ ...p, item: e.target.value }))}
                placeholder={t('settings.modals.kpiItem.itemPlaceholder')}
              />
            </div>

            <div className="space-y-1.5">
              <Label>{t('tables.headers.maxScore')}</Label>
              <Input
                type="number"
                min={0}
                value={form.max_score}
                onChange={(e) => setForm((p) => ({ ...p, max_score: Number(e.target.value || 0) }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label>{t('tables.headers.notes')}</Label>
              <Input
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                placeholder={t('settings.modals.kpiItem.notePlaceholder')}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setOpenModal(false)}>
                {t('settings.actions.cancel')}
              </Button>
              <Button className="bg-primary" onClick={onSave} disabled={isLoading}>
                {modalAction}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteKpiDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        kpiItem={itemToDelete}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
