import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEmployeeProfileStore } from '@/stores/useEmployeeProfileStore';
import { useAuthStore } from '@/services/auth/auth.store';
import { useAllShifts } from '@/shared/hooks/useAllShifts';
import { useAllPositions } from '@/shared/hooks/useAllPositions';
import { useAllDepartments } from '@/shared/hooks/useAllDepartments';
import { useAllBranches } from '@/shared/hooks/useAllBranches';
import { prepareDetailsData } from './employeesUtils';
import { employeesApi } from '../api/employees.api';

export function useEmployeeDetails() {
  const { id: paramId } = useParams();
  const { user, role } = useAuthStore();
  // Employee-portal sessions land on their own /employees/:id (see Sidebar's
  // employeeProfilePath) — the :id param is always present there. This
  // fallback just guards against a stray render with no param.
  const id = paramId || user?.id;
  const isEmployeeRole = role === 'employee';
  const { i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTabState] = useState(tabFromUrl || 'personalInformation');

  // Keep activeTab in sync when the URL's ?tab= changes (e.g. the sidebar
  // links to /employees/:id?tab=activity) — the sidebar is a separate
  // component and can't reach this hook's local state directly.
  useEffect(() => {
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTabState(tabFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabFromUrl]);

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', tab);
      return next;
    }, { replace: true });
  };

  const [isEditing, setIsEditing] = useState(false);
  const [profileCards, setProfileCards] = useState(null);
  const [dateFilters, setDateFilters] = useState({ from: '', to: '' });
  const [salaryData, setSalaryData] = useState(null);

  const {
    profile,
    activity,
    isLoading,
    profileStatus,
    profileRequestId,
    getEmployeeProfile,
    getEmployeeActivity,
    updateEmployeeProfile,
  } = useEmployeeProfileStore();

  // These are admin/settings-scoped endpoints only needed for the HR edit
  // form's dropdowns. An employee-portal token gets a 401 from them, which
  // trips axiosClient's auto-logout — so skip them entirely for that role.
  const { data: shifts = [] } = useAllShifts({ enabled: !isEmployeeRole });
  const { data: positions = [] } = useAllPositions({ enabled: !isEmployeeRole });
  const { data: departments = [] } = useAllDepartments({ enabled: !isEmployeeRole });
  const { data: branches = [] } = useAllBranches({ enabled: !isEmployeeRole });

  const mergedProfile = useMemo(() => {
    if (!profile) return null;

    const unwrappedProfileCards = profileCards?.data?.employee ?? profileCards?.employee ?? profileCards;

    return {
      ...(unwrappedProfileCards || {}),
      ...profile,
    };
  }, [profile, profileCards]);

  const detailsData = useMemo(() => {
    return prepareDetailsData(mergedProfile, shifts, positions, departments, branches);
  }, [mergedProfile, shifts, positions, departments, branches, i18n.language]);

  const [editFormData, setEditFormData] = useState(null);
  const editableDetails = isEditing && editFormData ? editFormData : detailsData;
  const currentRouteId = String(id || '');
  const currentProfileId = String(profile?.id || '');
  const isCurrentEmployeeProfile =
    Boolean(profile) &&
    (currentProfileId === currentRouteId || String(profileRequestId || '') === currentRouteId);
  const isProfileReady = profileStatus === 'success' && isCurrentEmployeeProfile;
  const isNotFound =
    profileStatus === 'not_found' && String(profileRequestId || '') === currentRouteId;

  useEffect(() => {
    setProfileCards(null);
    setSalaryData(null);
    setEditFormData(null);
  }, [id]);

  // ✅ base profile
  useEffect(() => {
    if (!id) return;
    getEmployeeProfile(id).catch(() => {});
  }, [id, getEmployeeProfile]);

  // ✅ dependent profile activity
  useEffect(() => {
    if (!id || !isProfileReady) return;
    getEmployeeActivity(id).catch(() => {});
  }, [id, isProfileReady, getEmployeeActivity]);

  // ✅ profile cards refetch when FROM/TO changes
  useEffect(() => {
    if (!id || !isProfileReady) return;

    const fetchProfileCards = async () => {
      try {
        const cardsData = await employeesApi.getProfileCards(id, {
          from: dateFilters?.from || '',
          to: dateFilters?.to || '',
        });
        console.log('Setting profile cards:', cardsData);
        setProfileCards(cardsData);
      } catch (error) {
        console.error('Failed to fetch profile cards:', error);
      }
    };

    fetchProfileCards();
  }, [id, isProfileReady, dateFilters?.from, dateFilters?.to]);

  // ✅ fetch salary data
  useEffect(() => {
    if (!id || !isProfileReady) return;

    const fetchSalaryData = async () => {
      try {
        const data = await employeesApi.getEmployeeSalary(id);
        console.log('Setting salary data:', data);
        setSalaryData(data);
      } catch (error) {
        console.error('Failed to fetch salary data:', error);
      }
    };

    fetchSalaryData();
  }, [id, isProfileReady, isEmployeeRole]);

  const setIsEditingWrapper = (editing) => {
    if (editing) {
      setEditFormData(detailsData);
    } else {
      setEditFormData(null);
    }
    setIsEditing(editing);
  };

  const setEditableDetails = (data) => {
    if (isEditing) {
      setEditFormData(data);
    }
  };

  return {
    id,
    activeTab,
    setActiveTab,
    isEditing,
    setIsEditing: setIsEditingWrapper,
    editableDetails,
    setEditableDetails,
    profile: mergedProfile,
    profileCards,
    activity,
    isLoading,
    isProfileReady,
    isNotFound,
    detailsData,
    salaryData,
    updateEmployeeProfile,
    shifts,
    positions,
    dateFilters,
    setDateFilters,
  };
}
