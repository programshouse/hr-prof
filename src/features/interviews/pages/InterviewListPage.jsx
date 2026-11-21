import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import InterviewSummaryCards from '../components/InterviewSummaryCards';
import InterviewFilters from '../components/InterviewFilters';
import InterviewTable from '../components/InterviewTable';
import AddInterviewModal from '../components/AddInterviewModal';
import ViewInterviewModal from '../components/ViewInterviewModal';
import DeleteInterviewModal from '../components/DeleteInterviewModal';
import { useInterviewsQuery } from '../hooks/useInterviewsQuery';
import { useInterviewsMutations } from '../hooks/useInterviewsMutations';
import { transformInterviewData } from '../utils/dataTransformers';

// ✅ employees hook
import { useAllEmployees } from '@/shared/hooks/useAllEmployees';
import { useAllDepartments } from '@/shared/hooks/useAllDepartments';
import { useAllPositions } from '@/shared/hooks/useAllPositions';

export default function InterviewListPage() {
  // pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // filters state
  const [filters, setFilters] = useState({
    search: '',
    company: '',
    position: '',
    level: '',
    type: '',
    from: null,
    to: null,
  });

  // ✅ Get employees list (for interviewer column)
  const {
    data: employeesData,
    isLoading: isEmployeesLoading,
    error: employeesError,
  } = useAllEmployees();

  // Get departments list
  const {
    data: departmentsData,
    isLoading: isDepartmentsLoading,
    error: departmentsError,
  } = useAllDepartments();

  // Get positions list
  const {
    data: positionsData,
    isLoading: isPositionsLoading,
    error: positionsError,
  } = useAllPositions();

  // normalize employees array (some hooks return {data:{employees:[]}} etc)
  const employees =
    employeesData?.employees ||
    employeesData?.data?.employees ||
    employeesData?.data ||
    employeesData ||
    [];

  // normalize departments array
  const departments =
    departmentsData?.departments ||
    departmentsData?.data?.departments ||
    departmentsData?.data ||
    departmentsData ||
    [];

  // normalize positions array
  const positions = useMemo(() => {
    if (Array.isArray(positionsData)) return positionsData;
    if (Array.isArray(positionsData?.data)) return positionsData.data;
    if (Array.isArray(positionsData?.data?.data)) return positionsData.data.data;
    if (Array.isArray(positionsData?.positions)) return positionsData.positions;
    return [];
  }, [positionsData]);

  // API query for interviews
  const { data: interviewsData, isLoading, error } = useInterviewsQuery({
    ...filters,
    page: currentPage,
    per_page: itemsPerPage,
  });

  const { i18n } = useTranslation();
  const transformedInterviews = transformInterviewData(
    interviewsData,
    employees,
    departments,
    positions,
    i18n.language
  );

  // Mutations
  const { createInterview, updateInterview, deleteInterview } =
    useInterviewsMutations();

  // modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Calculate pagination
  const totalPages =
    interviewsData?.last_page || interviewsData?.data?.last_page || 1;

  const getCurrentPageData = () => transformedInterviews;

  // Event handlers
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleReset = () => {
    setFilters({
      search: '',
      company: '',
      position: '',
      level: '',
      type: '',
      from: null,
      to: null,
    });
    setCurrentPage(1);
  };

  const handleAddInterview = () => {
    setIsEditMode(false);
    setSelectedInterview(null);
    setIsAddModalOpen(true);
  };

  const handleSaveInterview = async (interviewData) => {
    try {
      if (isEditMode) {
        await updateInterview({ id: selectedInterview.id, values: interviewData });
      } else {
        await createInterview(interviewData);
      }
      setIsAddModalOpen(false);
      setSelectedInterview(null);
      setIsEditMode(false);
    } catch (err) {
      console.error('Error saving interview:', err);
      // Silent error handling - no alerts
    }
  };

  const handleViewInterview = (interview) => {
    setSelectedInterview(interview);
    setIsViewModalOpen(true);
  };

  const handleEditInterview = (interview) => {
    setIsEditMode(true);
    setSelectedInterview(interview);
    setIsAddModalOpen(true);
  };

  const handleDeleteInterview = (interview) => {
    setSelectedInterview(interview);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (interview) => {
    try {
      await deleteInterview(interview.id);
      setIsDeleteModalOpen(false);
      setSelectedInterview(null);
    } catch (err) {
      console.error('Error deleting interview:', err);
      // Silent error handling - no alerts
    }
  };

  return (
    <div className="p-6">
      <InterviewSummaryCards />

      <InterviewFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
        onAddInterview={handleAddInterview}
      />

      <InterviewTable
        interviews={getCurrentPageData()}
        employees={employees} // ✅ pass employees here
        positions={positions} // ✅ pass positions here
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        isLoading={isLoading || isEmployeesLoading || isPositionsLoading} // ✅ include positions loading
        error={error || employeesError || positionsError} // ✅ include positions error
        onView={handleViewInterview}
        onEdit={handleEditInterview}
        onDelete={handleDeleteInterview}
      />

      <AddInterviewModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSave={handleSaveInterview}
        isEditMode={isEditMode}
        interviewData={selectedInterview}
      />

      <ViewInterviewModal
        open={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        interviewData={selectedInterview}
      />

      <DeleteInterviewModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onDelete={handleConfirmDelete}
        interviewData={selectedInterview}
      />
    </div>
  );
}