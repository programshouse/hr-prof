// src/features/setting/SystemSettingsLayout.jsx
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

import SystemSettingsHeader from './SystemSettingsHeader';
import SystemSettingsTabs from './SystemSettingsTabs';
import SystemSettingsSearch from './SystemSettingsSearch';
import SystemSettingsEditDeleteActions from '../../../components/ui/EditDeleteActions';
import ShiftModal from './ShiftModal';
import BranchModal from './BranchModal';
import SalaryMethodModal from './SalaryMethodModal';
import { DeleteSettingsDialog } from './DeleteSettingsDialog';

import AgentsSettings from './AgentsSettings';
import PayrollSettings from '../pages/PayrollSettings';
import KpiSettings from '../pages/KpiSettings';

import { useDepartmentStore } from '@/stores/useDepartmentStore';
import { useBranchStore } from '@/stores/useBranchStore';
import { usePositionStore } from '@/stores/usePositionStore';
import { useSalaryMethodStore } from '@/stores/useSalaryMethodStore';
import { useShiftStore } from '@/stores/useShiftStore';

// NEW: used to load the full branch (with lat/lng/altitudes) when editing
import { branchApi } from '@/features/settings/api/branch.api';

import {
  useAllDepartments,
  useAllBranches,
  useAllPositions,
  useAllSalaryMethods,
  useAllShifts,
} from '@/shared/hooks';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

// ---------- UI Building Blocks ----------
function CardSearchRow({ placeholder, value, onChange, onAdd, t }) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-9 w-full rounded-lg border border-slate-200 bg-white ps-9 pe-3 text-start text-xs text-slate-700 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
        />
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={onAdd}
        className="h-9 rounded-lg border-indigo-200 bg-white px-3 text-xs text-primary"
      >
        <Plus className="me-1 h-3 w-3" />
        {t('settings.actions.addNew')}
      </Button>
    </div>
  );
}

function SettingsListCard({
  title,
  searchPlaceholder,
  availableLabel,
  items,
  getLabel,
  query,
  onQueryChange,
  onAdd,
  onEdit,
  onDelete,
  t,
  isRTL,
}) {
  const filtered = useMemo(() => {
    const q = (query || '').trim().toLowerCase();
    const safe = Array.isArray(items) ? items : [];

    if (!q) return safe;

    return safe.filter((it) => getLabel(it).toLowerCase().includes(q));
  }, [items, query, getLabel]);

  return (
    <Card dir={isRTL ? 'rtl' : 'ltr'} className="min-h-[300px] rounded-2xl border-slate-200 shadow-sm">
      <CardContent className="flex h-full flex-col p-4">
        <div className="mb-3 text-start text-sm font-semibold text-slate-800">{title}</div>

        <CardSearchRow
          placeholder={searchPlaceholder}
          value={query}
          onChange={onQueryChange}
          onAdd={onAdd}
          t={t}
        />

        <div className="mt-4 flex-1 rounded-xl border border-slate-100 bg-white p-3">
          <div className="mb-2 text-start text-[11px] font-semibold text-slate-700">{availableLabel}</div>

          <div className="h-[220px] space-y-1 overflow-y-auto pe-1">
            {filtered.length === 0 ? (
              <p className="py-2 text-xs text-slate-400">{t('settings.messages.noResultsFound')}</p>
            ) : (
              filtered.map((it) => {
                const label = getLabel(it);

                return (
                  <div
                    key={it?.id || label}
                    className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    <button
                      type="button"
                      className="min-w-0 flex-1 truncate text-start"
                      onClick={() => onEdit(it)}
                      title={t('settings.actions.edit')}
                    >
                      {label}
                    </button>

                    <SystemSettingsEditDeleteActions
                      onEdit={() => onEdit(it)}
                      onDelete={() => onDelete(it)}
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------- Helpers ----------
function getLocalizedName(item, isRTL, { preferTitle = false } = {}) {
  if (!item) return '';
  if (typeof item === 'string') return item;

  if (preferTitle) {
    return isRTL
      ? item.title_ar || item.title_en || item.title || item.name_ar || item.name_en || item.name || ''
      : item.title_en || item.title || item.title_ar || item.name_en || item.name_ar || item.name || '';
  }

  return isRTL
    ? item.name_ar || item.name_en || item.name || item.title_ar || item.title_en || item.title || ''
    : item.name_en || item.name || item.name_ar || item.title_en || item.title || item.title_ar || '';
}

function getCanonicalName(item, { preferTitle = false } = {}) {
  if (!item) return '';
  if (typeof item === 'string') return item;

  if (preferTitle) {
    return item.title_en || item.title || item.name_en || item.name || '';
  }

  return item.name_en || item.name || item.title_en || item.title || '';
}

function matchesLocalizedName(item, name, { preferTitle = false } = {}) {
  if (!item || !name) return false;
  if (typeof item === 'string') return item === name;

  const canonical = getCanonicalName(item, { preferTitle });
  const ar = preferTitle ? item.title_ar : item.name_ar;
  const en = preferTitle ? item.title_en || item.title : item.name_en || item.name;

  return canonical === name || en === name || ar === name;
}

function unwrapBranchResponse(response) {
  let branch = response;

  while (branch && typeof branch === 'object' && !Array.isArray(branch)) {
    if (branch.branch && typeof branch.branch === 'object') {
      branch = branch.branch;
    } else if (branch.data && typeof branch.data === 'object' && !Array.isArray(branch.data)) {
      branch = branch.data;
    } else {
      const hasBranchFields = [
        'id',
        'name_en',
        'name_ar',
        'name',
        'title',
        'branch_name',
        'lat',
        'latitude',
        'lng',
        'longitude',
        'allowed_radius',
        'radius',
        'altitudes',
        'floors',
      ].some((key) => key in branch);

      return hasBranchFields ? branch : null;
    }
  }

  return null;
}

export default function SystemSettingsLayout() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language.startsWith('ar');

  const [activeTab, setActiveTab] = useState('general');
  const [globalSearch, setGlobalSearch] = useState('');

  const [deptQ, setDeptQ] = useState('');
  const [branchQ, setBranchQ] = useState('');
  const [positionQ, setPositionQ] = useState('');
  const [shiftQ, setShiftQ] = useState('');
  const [methodQ, setMethodQ] = useState('');

  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [branchEditTarget, setBranchEditTarget] = useState(null);

  const [salaryMethodModalOpen, setSalaryMethodModalOpen] = useState(false);
  const [salaryMethodEditTarget, setSalaryMethodEditTarget] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteItemName, setDeleteItemName] = useState('');
  const [deleteItemType, setDeleteItemType] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const { createDepartment, updateDepartment, deleteDepartmentByName } = useDepartmentStore();
  const { data: departmentItems = [] } = useAllDepartments();

  // CHANGED: updateBranch (by id) instead of updateBranchByName
  const { createBranch, updateBranch, deleteBranchByName } = useBranchStore();
  const { data: branchItems = [] } = useAllBranches();

  const { createPosition, updatePosition, deletePositionByName } = usePositionStore();
  const { data: positionItems = [] } = useAllPositions();

  const { createSalaryMethod, updateSalaryMethodByName, deleteSalaryMethodByName } =
    useSalaryMethodStore();
  const { data: salaryMethodItems = [] } = useAllSalaryMethods();

  const { createShift, updateShift, deleteShiftByName } = useShiftStore();
  const { data: shiftItems = [] } = useAllShifts();

  const tabs = useMemo(
    () => [
      { key: 'general', label: t('settings.tabs.general') },
      { key: 'agents', label: t('settings.tabs.agents') },
      { key: 'payroll', label: t('settings.tabs.payroll') },
      { key: 'kpi', label: t('settings.tabs.kpi') },
    ],
    [t]
  );

  // ----- normalized lists -----
  const departmentsList = useMemo(
    () => (departmentItems || []).filter((it) => getCanonicalName(it)),
    [departmentItems]
  );

  const branchesList = useMemo(
    () => (branchItems || []).filter((it) => getCanonicalName(it)),
    [branchItems]
  );

  const positionsList = useMemo(
    () => (positionItems || []).filter((it) => getCanonicalName(it, { preferTitle: true })),
    [positionItems]
  );

  const shiftsList = useMemo(
    () => (shiftItems || []).filter((it) => getCanonicalName(it)),
    [shiftItems]
  );

  const salaryMethodsList = useMemo(() => {
    const items = Array.isArray(salaryMethodItems) ? salaryMethodItems : [];
    return items.filter((it) => getCanonicalName(it));
  }, [salaryMethodItems]);

  const askDelete = (name, type) => {
    setDeleteItemName(name);
    setDeleteItemType(type);
    setDeleteDialogOpen(true);
  };

  // ----- branch modal -----
  const openAddBranch = () => {
    setBranchEditTarget(null);
    setBranchModalOpen(true);
  };

  // CHANGED: load the full branch (lat, lng, allowed_radius, altitudes) before opening
  const openEditBranch = async (branch) => {
    try {
      const res = await branchApi.getBranch(branch.id);
      const branchDetails = unwrapBranchResponse(res);

      if (!branchDetails) throw new Error('Branch details response is invalid');

      setBranchEditTarget({ ...branch, ...branchDetails });
    } catch (error) {
      console.error(error);
      toast.error(t('settings.errors.couldNotLoadBranch'));
      return;
    }

    setBranchModalOpen(true);
  };

  const handleSaveBranch = async (data) => {
    if (!data.name_en?.trim()) {
      toast.error(t('settings.validation.branchEnglishNameRequired'));
      return;
    }

    try {
      const payload = {
        name_en: data.name_en.trim(),
        name_ar: data.name_ar?.trim() || '',
        lat: data.lat === '' ? null : Number(data.lat),
        lng: data.lng === '' ? null : Number(data.lng),
        allowed_radius:
          data.allowed_radius === '' || data.allowed_radius == null
            ? null
            : Number(data.allowed_radius),
        altitude_enabled: data.altitude_enabled ? 1 : 0,
        altitudes: data.altitudes ?? [],
      };

      if (!branchEditTarget) {
        await createBranch(payload);
      } else {
        // update by id instead of by name
        await updateBranch(branchEditTarget.id, payload);
      }

      setBranchModalOpen(false);
    } catch (error) {
      console.error(error);
      // the store already shows an error toast, so this one is optional
      toast.error(t('settings.errors.couldNotSaveBranch'));
    }
  };

  // ----- salary method modal -----
  const openAddSalaryMethod = () => {
    setSalaryMethodEditTarget(null);
    setSalaryMethodModalOpen(true);
  };

  const openEditSalaryMethod = (method) => {
    setSalaryMethodEditTarget(method);
    setSalaryMethodModalOpen(true);
  };

  const handleSaveSalaryMethod = async (data) => {
    if (!data.name_en?.trim()) {
      toast.error(t('settings.validation.paymentMethodEnglishNameRequired'));
      return;
    }

    try {
      const payload = {
        name_en: data.name_en.trim(),
        name_ar: data.name_ar?.trim() || '',
      };

      if (!salaryMethodEditTarget) {
        await createSalaryMethod(payload);
      } else {
        await updateSalaryMethodByName(salaryMethodEditTarget.name_en, payload);
      }

      setSalaryMethodModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(t('settings.errors.couldNotSavePaymentMethod'));
    }
  };

  // ----- position modal -----
  const [positionModalOpen, setPositionModalOpen] = useState(false);
  const [positionNameEn, setPositionNameEn] = useState('');
  const [positionNameAr, setPositionNameAr] = useState('');
  const [positionEditTarget, setPositionEditTarget] = useState(null);

  const [selectedDepartmentIdForPosition, setSelectedDepartmentIdForPosition] = useState('');
  const [departmentSearchQuery, setDepartmentSearchQuery] = useState('');

  const filteredDepartmentItems = useMemo(() => {
    const q = (departmentSearchQuery || '').trim().toLowerCase();

    if (!q) return departmentItems || [];

    return (departmentItems || []).filter((item) => {
      const en = getCanonicalName(item).toLowerCase();
      const ar = (item.name_ar || '').toLowerCase();
      const localized = getLocalizedName(item, isRTL).toLowerCase();
      return en.includes(q) || ar.includes(q) || localized.includes(q);
    });
  }, [departmentItems, departmentSearchQuery, isRTL]);

  const openAddPositionModal = () => {
    setPositionNameEn('');
    setPositionNameAr('');
    setPositionEditTarget(null);
    setSelectedDepartmentIdForPosition('');
    setDepartmentSearchQuery('');
    setPositionModalOpen(true);
  };

  const openEditPositionModal = (position) => {
    const posObj =
      typeof position === 'object' && position !== null
        ? position
        : (positionItems || []).find((p) =>
            matchesLocalizedName(p, String(position), { preferTitle: true })
          );

    const canonical = posObj
      ? getCanonicalName(posObj, { preferTitle: true })
      : String(position);

    setPositionNameEn(posObj?.title_en || posObj?.title || canonical || '');
    setPositionNameAr(posObj?.title_ar || '');
    setPositionEditTarget(posObj ?? {});
    setSelectedDepartmentIdForPosition(posObj?.department_id ? String(posObj.department_id) : '');
    setDepartmentSearchQuery('');
    setPositionModalOpen(true);
  };

  const handleSavePositionModal = async () => {
    const titleEn = positionNameEn.trim();
    const titleAr = positionNameAr.trim();

    if (!titleEn) {
      toast.error(t('settings.validation.positionEnglishNameRequired', 'Position English name is required'));
      return;
    }

    if (!titleAr) {
      toast.error(t('settings.validation.positionArabicNameRequired', 'Position Arabic name is required'));
      return;
    }

    if (!/^[a-zA-Z0-9\s\-_]+$/.test(titleEn)) {
      toast.error(t('settings.validation.positionNameInvalid'));
      return;
    }

    if (titleEn.length < 2) {
      toast.error(t('settings.validation.positionNameTooShort'));
      return;
    }

    if (titleEn.length > 100 || titleAr.length > 100) {
      toast.error(t('settings.validation.positionNameTooLong'));
      return;
    }

    if (!selectedDepartmentIdForPosition) {
      toast.error(t('settings.validation.departmentRequired'));
      return;
    }

    try {
      const payload = {
        title_en: titleEn,
        title_ar: titleAr,
        description_en: titleEn,
        description_ar: titleAr,
        department_id: Number(selectedDepartmentIdForPosition),
      };

      if (positionEditTarget == null) {
        await createPosition(payload);
      } else {
        await updatePosition(positionEditTarget.id, payload);
      }

      setPositionModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(t('settings.errors.couldNotSavePosition'));
    }
  };

  // ----- department modal -----
  const [entityModalOpen, setEntityModalOpen] = useState(false);
  const [entityType, setEntityType] = useState('');
  const [entityLabel, setEntityLabel] = useState('');
  const [entityNameEn, setEntityNameEn] = useState('');
  const [entityNameAr, setEntityNameAr] = useState('');
  const [entityEditTarget, setEntityEditTarget] = useState(null);

  const openAddEntity = (type, label) => {
    setEntityType(type);
    setEntityLabel(label);
    setEntityEditTarget(null);
    setEntityNameEn('');
    setEntityNameAr('');
    setEntityModalOpen(true);
  };

  const openEditEntity = (type, label, item) => {
    setEntityType(type);
    setEntityLabel(label);
    setEntityEditTarget(item);
    setEntityNameEn(item?.name_en || item?.name || '');
    setEntityNameAr(item?.name_ar || '');
    setEntityModalOpen(true);
  };

  const saveEntity = async () => {
    const nameEn = entityNameEn.trim();
    const nameAr = entityNameAr.trim();

    if (!nameEn) {
      toast.error(t('settings.validation.departmentEnglishNameRequired', 'Department English name is required'));
      return;
    }

    if (!nameAr) {
      toast.error(t('settings.validation.departmentArabicNameRequired', 'Department Arabic name is required'));
      return;
    }

    try {
      const payload = {
        name_en: nameEn,
        name_ar: nameAr,
      };

      if (entityType === 'department') {
        if (!entityEditTarget) {
          await createDepartment(payload);
        } else {
          await updateDepartment(entityEditTarget.id, payload);
        }
      }

      setEntityModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(t('settings.errors.somethingWentWrong'));
    }
  };

  // ----- shift modal -----
  const [shiftModalOpen, setShiftModalOpen] = useState(false);
  const [shiftEditTarget, setShiftEditTarget] = useState(null);
  const [shiftModalKey, setShiftModalKey] = useState(0);

  const openAddShift = () => {
    setShiftEditTarget(null);
    setShiftModalKey((prev) => prev + 1);
    setShiftModalOpen(true);
  };

  const openEditShift = (shift) => {
    const obj =
      typeof shift === 'object' && shift !== null
        ? shift
        : (shiftItems || []).find((it) => matchesLocalizedName(it, String(shift)));

    setShiftEditTarget(obj || { name_en: typeof shift === 'string' ? shift : '' });
    setShiftModalKey((prev) => prev + 1);
    setShiftModalOpen(true);
  };

  const saveShift = async (formData) => {
    if (!formData?.name_en?.trim()) {
      toast.error(t('settings.validation.shiftEnglishNameRequired', 'Shift English name is required'));
      return;
    }

    if (!formData?.name_ar?.trim()) {
      toast.error(t('settings.validation.shiftArabicNameRequired', 'Shift Arabic name is required'));
      return;
    }

    try {
      const payload = {
        name_en: formData.name_en.trim(),
        name_ar: formData.name_ar.trim(),
      };

      if (!shiftEditTarget) {
        await createShift(payload);
      } else {
        await updateShift(shiftEditTarget.id, payload);
      }

      setShiftModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(t('settings.errors.couldNotSaveShift'));
    }
  };

  // ----- delete confirm -----
  const confirmDelete = async () => {
    setIsDeleting(true);

    try {
      switch (deleteItemType) {
        case 'department':
          await deleteDepartmentByName(deleteItemName);
          break;

        case 'branch':
          await deleteBranchByName(deleteItemName);
          break;

        case 'position':
          await deletePositionByName(deleteItemName);
          break;

        case 'salaryMethod':
          await deleteSalaryMethodByName(deleteItemName);
          break;

        case 'shift':
          await deleteShiftByName(deleteItemName);
          break;

        default:
          break;
      }

      setDeleteDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(t('settings.errors.couldNotDeleteItem'));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        {isRTL ? (
          <>
            <SystemSettingsHeader />
            <SystemSettingsSearch value={globalSearch} onChange={setGlobalSearch} />
          </>
        ) : (
          <>
            <SystemSettingsSearch value={globalSearch} onChange={setGlobalSearch} />
            <SystemSettingsHeader />
          </>
        )}
      </div>

      <SystemSettingsTabs activeTab={activeTab} onTabChange={setActiveTab} tabs={tabs} />

      {activeTab === 'general' ? (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <SettingsListCard
              title={t('settings.sections.department')}
              searchPlaceholder={t('settings.placeholders.searchDepartment')}
              availableLabel={t('settings.labels.availableDepartments')}
              items={departmentsList}
              getLabel={(x) => getLocalizedName(x, isRTL)}
              query={deptQ}
              onQueryChange={setDeptQ}
              onAdd={() => openAddEntity('department', t('settings.sections.department'))}
              onEdit={(item) => openEditEntity('department', t('settings.sections.department'), item)}
              onDelete={(item) => askDelete(getCanonicalName(item), 'department')}
              t={t}
              isRTL={isRTL}
            />

            <SettingsListCard
              title={t('settings.sections.branch')}
              searchPlaceholder={t('settings.placeholders.searchBranch')}
              availableLabel={t('settings.labels.availableBranches')}
              items={branchesList}
              getLabel={(x) => getLocalizedName(x, isRTL)}
              query={branchQ}
              onQueryChange={setBranchQ}
              onAdd={openAddBranch}
              onEdit={openEditBranch}
              onDelete={(branch) => askDelete(getCanonicalName(branch), 'branch')}
              t={t}
              isRTL={isRTL}
            />

            <SettingsListCard
              title={t('settings.sections.position')}
              searchPlaceholder={t('settings.placeholders.searchPosition')}
              availableLabel={t('settings.labels.availablePosition')}
              items={positionsList}
              getLabel={(x) => getLocalizedName(x, isRTL, { preferTitle: true })}
              query={positionQ}
              onQueryChange={setPositionQ}
              onAdd={openAddPositionModal}
              onEdit={openEditPositionModal}
              onDelete={(item) => askDelete(getCanonicalName(item, { preferTitle: true }), 'position')}
              t={t}
              isRTL={isRTL}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <SettingsListCard
                title={t('settings.sections.shift')}
                searchPlaceholder={t('settings.placeholders.searchShift')}
                availableLabel={t('settings.labels.availableShifts')}
                items={shiftsList}
                getLabel={(x) => getLocalizedName(x, isRTL)}
                query={shiftQ}
                onQueryChange={setShiftQ}
                onAdd={openAddShift}
                onEdit={openEditShift}
                onDelete={(item) => askDelete(getCanonicalName(item), 'shift')}
                t={t}
                isRTL={isRTL}
              />
            </div>

            <div className="lg:col-span-1">
              <SettingsListCard
                title={t('settings.sections.paymentMethods')}
                searchPlaceholder={t('settings.placeholders.searchMethod')}
                availableLabel={t('settings.labels.availablePaymentMethods')}
                items={salaryMethodsList}
                getLabel={(x) => getLocalizedName(x, isRTL)}
                query={methodQ}
                onQueryChange={setMethodQ}
                onAdd={openAddSalaryMethod}
                onEdit={openEditSalaryMethod}
                onDelete={(method) => askDelete(getCanonicalName(method), 'salaryMethod')}
                t={t}
                isRTL={isRTL}
              />
            </div>

            <div className="hidden lg:block" />
          </div>
        </div>
      ) : activeTab === 'agents' ? (
        <AgentsSettings />
      ) : activeTab === 'payroll' ? (
        <PayrollSettings />
      ) : activeTab === 'kpi' ? (
        <KpiSettings />
      ) : (
        <Card>
          <CardContent className="py-12">
            <p className="text-sm text-slate-400">
              {t('settings.messages.configurationComingSoon', {
                tab: tabs.find((tab) => tab.key === activeTab)?.label ?? activeTab,
              })}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Department */}
      {entityModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-xs"
          onClick={() => setEntityModalOpen(false)}
        >
          <div
            dir={isRTL ? 'rtl' : 'ltr'}
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-4 text-center text-sm font-semibold text-slate-800">
              {entityEditTarget
                ? `${t('settings.actions.edit')} ${entityLabel}`
                : isRTL
                  ? t('settings.actions.addNewEntity', { entity: entityLabel })
                  : `${t('settings.actions.addNew')} ${entityLabel}`}
            </h2>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">
                  {t('settings.labels.departmentNameEnglish', 'Department Name English')}
                </label>
                <input
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
                  placeholder={t('settings.placeholders.departmentNameEnglish', 'Department name in English')}
                  value={entityNameEn}
                  onChange={(e) => setEntityNameEn(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">
                  {t('settings.labels.departmentNameArabic', 'اسم القسم بالعربي')}
                </label>
                <input
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
                  placeholder={t('settings.placeholders.departmentNameArabic', 'اسم القسم بالعربي')}
                  value={entityNameAr}
                  onChange={(e) => setEntityNameAr(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                className="flex-1 cursor-pointer rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => setEntityModalOpen(false)}
              >
                {t('settings.actions.cancel')}
              </button>

              <button
                type="button"
                className="bg-primary flex-1 cursor-pointer rounded-xl px-4 py-2 text-sm font-medium text-white"
                onClick={saveEntity}
              >
                {t('settings.actions.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      <BranchModal
        key={branchEditTarget?.id || 'new-branch'}
        open={branchModalOpen}
        initialData={branchEditTarget}
        onClose={() => setBranchModalOpen(false)}
        onSave={handleSaveBranch}
      />

      <SalaryMethodModal
        key={salaryMethodEditTarget?.id || 'new-salary-method'}
        open={salaryMethodModalOpen}
        initialData={salaryMethodEditTarget}
        onClose={() => setSalaryMethodModalOpen(false)}
        onSave={handleSaveSalaryMethod}
      />

      {positionModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-xs"
          onClick={() => setPositionModalOpen(false)}
        >
          <div
            dir={isRTL ? 'rtl' : 'ltr'}
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-4 text-center text-sm font-semibold text-slate-800">
              {positionEditTarget ? t('settings.actions.editPosition') : t('settings.actions.addNewPosition')}
            </h2>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">
                  {t('settings.labels.positionNameEnglish', 'Position Name English')}
                </label>
                <input
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
                  placeholder={t('settings.placeholders.positionNameEnglish', 'Position name in English')}
                  value={positionNameEn}
                  onChange={(e) => setPositionNameEn(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">
                  {t('settings.labels.positionNameArabic', 'اسم الوظيفة بالعربي')}
                </label>
                <input
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
                  placeholder={t('settings.placeholders.positionNameArabic', 'اسم الوظيفة بالعربي')}
                  value={positionNameAr}
                  onChange={(e) => setPositionNameAr(e.target.value)}
                />
              </div>

              {/* Department picker (ADD + EDIT) */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">{t('settings.labels.department')}</label>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex h-10 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 text-start text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
                    >
                      <span className={selectedDepartmentIdForPosition ? '' : 'text-slate-400'}>
                        {(() => {
                          const selectedDept = (departmentItems || []).find(
                            (d) => String(d.id) === String(selectedDepartmentIdForPosition)
                          );

                          return selectedDept
                            ? getLocalizedName(selectedDept, isRTL)
                            : t('settings.labels.selectDepartment');
                        })()}
                      </span>
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    className="w-(--radix-dropdown-menu-trigger-width) min-w-full rounded-lg border border-slate-200 bg-white p-0 shadow-lg"
                    align="start"
                    sideOffset={4}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    <div className="border-b border-slate-100 p-3">
                      <input
                        type="text"
                        placeholder={t('settings.placeholders.searchDepartments')}
                        value={departmentSearchQuery}
                        onChange={(e) => setDepartmentSearchQuery(e.target.value)}
                        className="h-9 w-full rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
                      />
                    </div>

                    <div className="max-h-60 overflow-y-auto p-1">
                      {filteredDepartmentItems.map((item) => {
                        const name = getLocalizedName(item, isRTL);
                        if (!name) return null;

                        return (
                          <DropdownMenuItem
                            key={item.id || name}
                            className="cursor-pointer rounded px-2 py-1.5 text-sm hover:bg-slate-100"
                            onSelect={() => {
                              setSelectedDepartmentIdForPosition(String(item.id));
                              setDepartmentSearchQuery('');
                            }}
                          >
                            <span
                              className={
                                selectedDepartmentIdForPosition === String(item.id)
                                  ? 'font-medium text-indigo-600'
                                  : ''
                              }
                            >
                              {name}
                            </span>
                          </DropdownMenuItem>
                        );
                      })}

                      {filteredDepartmentItems.length === 0 && (
                        <p className="px-2 py-2 text-xs text-slate-400">
                          {t('settings.messages.noDepartmentsFound')}
                        </p>
                      )}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                className="flex-1 cursor-pointer rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => setPositionModalOpen(false)}
              >
                {t('settings.actions.cancel')}
              </button>

              <button
                type="button"
                className="bg-primary flex-1 cursor-pointer rounded-xl px-4 py-2 text-sm font-medium text-white"
                onClick={handleSavePositionModal}
              >
                {t('settings.actions.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shift modal */}
      <ShiftModal
        key={shiftModalKey}
        open={shiftModalOpen}
        shift={shiftEditTarget}
        onCancel={() => setShiftModalOpen(false)}
        onSave={saveShift}
      />

      {/* Delete confirm */}
      <DeleteSettingsDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        itemName={deleteItemName}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
