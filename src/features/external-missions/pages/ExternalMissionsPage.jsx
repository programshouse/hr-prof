import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  ClipboardList,
  CalendarPlus,
  ListChecks,
  FileText,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import ExternalMissionsFilters from '../components/ExternalMissionsFilters';
import ExternalMissionsTable from '../components/ExternalMissionsTable';
import AddEditMissionModal from '../components/AddEditMissionModal';
import ViewMissionModal from '../components/ViewMissionModal';
import DeleteMissionModal from '../components/DeleteMissionModal';
import { getMissions, createMission, updateMission, deleteMission, getMissionStatistics } from '../api/missions.api';

function StatCard({ title, value, change: _change, changeType: _changeType = 'positive', icon: Icon }) {
  return (
    <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <CardContent className="p-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md  text-primary">
            <Icon className="h-6 w-6" />
          </div>
          <p className="text-sm font-semibold text-slate-800">{title}</p>
        </div>

        <div className="text-2xl font-bold text-slate-900">{value}</div>

      </CardContent>
    </Card>
  );
}

export default function ExternalMissionsPage() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    search: '',
    company: 'all',
    branch: 'all',
    status: 'all',
    department: 'all',
    position: 'all',
    priority: 'all',
    from: null,
    to: null,
  });

  const [page, setPage] = useState(1);
  const itemsPerPage = 7;

  // Data states
  const [missions, setMissions] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal states
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMission, setSelectedMission] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Fetch missions data
  const fetchMissions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        keyword: filters.search || undefined,
        department_id: filters.department !== 'all' ? filters.department : undefined,
        shift_id: filters.shift !== 'all' ? filters.shift : undefined,
        position_id: filters.position !== 'all' ? filters.position : undefined,
        branch_id: filters.branch !== 'all' ? filters.branch : undefined,
        from: filters.from,
        to: filters.to,
      };
      
      // Remove undefined values
      Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);
      
      const response = await getMissions(params);
      setMissions(response.data || []);
    } catch (err) {
      setError(err.message || t('externalMissions.toasts.fetchMissionsFailed'));
      toast.error(t('externalMissions.toasts.fetchMissionsFailed'));
      console.error('Error fetching missions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters, t]);

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const response = await getMissionStatistics();
      setStatistics(response.data || {});
    } catch (err) {
      console.error('Error fetching statistics:', err);
      toast.error(t('externalMissions.toasts.fetchStatisticsFailed'));
    }
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchMissions();
  }, [fetchMissions]);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const filteredMissions = useMemo(() => {
    return missions.filter((m) => {
      const q = String(filters.search || '').toLowerCase().trim();

      const matchesSearch =
        !q ||
        String(m.id || '').toLowerCase().includes(q) ||
        String(m.destination || '').toLowerCase().includes(q) ||
        String(m.purpose || '').toLowerCase().includes(q) ||
        (m.employees && m.employees.some(emp => 
          String(emp.name || '').toLowerCase().includes(q)
        ));

      const matchesStatus =
        !filters.status || filters.status === 'all' || m.status === filters.status;

      return matchesSearch && matchesStatus;
    });
  }, [missions, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredMissions.length / itemsPerPage));

  const paginatedMissions = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredMissions.slice(start, start + itemsPerPage);
  }, [filteredMissions, page]);

  const stats = useMemo(() => {
    if (statistics) {
      return {
        total: statistics.total_missions || 0,
        upcoming: statistics.upcoming_missions || 0,
        completed: statistics.completed_missions || 0,
        ongoing: statistics.ongoing_missions || 0,
      };
    }
    
    // Fallback to local calculation if API stats not available
    return {
      total: missions.length,
      upcoming: missions.filter((m) => m.status === 'upcoming').length,
      completed: missions.filter((m) => m.status === 'completed').length,
      ongoing: missions.filter((m) => m.status === 'ongoing').length,
    };
  }, [statistics, missions]);

  const handleFilterChange = (key, value) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setPage(1);
    setFilters({
      search: '',
      company: 'all',
      branch: 'all',
      status: 'all',
      department: 'all',
      position: 'all',
      priority: 'all',
      from: null,
      to: null,
    });
  };

  const handleAddMission = () => {
    setSelectedMission(null);
    setIsEditMode(false);
    setIsAddEditModalOpen(true);
  };

  const handleEditMission = (mission) => {
    setSelectedMission(mission);
    setIsEditMode(true);
    setIsAddEditModalOpen(true);
  };

  const handleViewMission = (mission) => {
    setSelectedMission(mission);
    setIsViewModalOpen(true);
  };

  const handleDeleteMission = (mission) => {
    setSelectedMission(mission);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteSuccess = async () => {
    if (selectedMission) {
      try {
        await deleteMission(selectedMission.id);
        await fetchMissions(); // Refresh data
        await fetchStatistics(); // Refresh stats
        setSelectedMission(null);
        toast.success(t('externalMissions.toasts.deleteSuccess'));
      } catch (err) {
        console.error('Error deleting mission:', err);
        setError(err.message || t('externalMissions.toasts.deleteFailed'));
        toast.error(t('externalMissions.toasts.deleteFailed'));
      }
    }
  };

  const handleDownloadMission = (mission) => {
    console.log('Download mission:', mission);
  };

  const handleSaveMission = async (missionData) => {
    try {
      if (isEditMode && selectedMission) {
        await updateMission(selectedMission.id, missionData);
        toast.success(t('externalMissions.toasts.updateSuccess'));
      } else {
        await createMission(missionData);
        toast.success(t('externalMissions.toasts.createSuccess'));
      }
      
      await fetchMissions(); // Refresh data
      await fetchStatistics(); // Refresh stats
      
      setIsAddEditModalOpen(false);
      setSelectedMission(null);
      setIsEditMode(false);
    } catch (err) {
      console.error('Error saving mission:', err);
      setError(err.message || t('externalMissions.toasts.saveFailed'));
      toast.error(t('externalMissions.toasts.saveFailed'));
    }
  };

  return (
    <div className="space-y-6 p-3">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title={t('externalMissions.stats.totalMissions')}
          value={stats.total}
          icon={ClipboardList}
        />
        <StatCard
          title={t('externalMissions.stats.upcomingMissions')}
          value={stats.upcoming}
          icon={CalendarPlus}
        />
        <StatCard
          title={t('externalMissions.stats.completedMissions')}
          value={stats.completed}
          icon={ListChecks}
        />
        <StatCard
          title={t('externalMissions.stats.ongoingMissions')}
          value={stats.ongoing}
          icon={FileText}
        />
      </div>

      {/* Filters + Table Wrapper */}
      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
        <ExternalMissionsFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleReset}
          onAddMission={handleAddMission}
        />

        <ExternalMissionsTable
          missions={paginatedMissions}
          isLoading={isLoading}
          error={error}
          onView={handleViewMission}
          onEdit={handleEditMission}
          onDownload={handleDownloadMission}
          onDelete={handleDeleteMission}
        />
      </div>

      {/* Add/Edit Mission Modal */}
      <AddEditMissionModal
        open={isAddEditModalOpen}
        onOpenChange={setIsAddEditModalOpen}
        mission={isEditMode ? selectedMission : null}
        onSave={handleSaveMission}
      />

      {/* View Mission Modal */}
      <ViewMissionModal
        open={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        mission={selectedMission}
      />

      {/* Delete Mission Modal */}
      <DeleteMissionModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        mission={selectedMission}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}