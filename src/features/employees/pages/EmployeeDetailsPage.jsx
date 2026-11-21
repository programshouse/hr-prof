// src/features/employees/pages/EmployeeDetailsPage.jsx
import React, { useState } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/services/auth/auth.store';
import { ArrowLeft, ArrowRight, Download } from 'lucide-react';

// Components
import EmployeeProfileHeader from '@/features/employees/components/EmplyeeProfile.jsx/EmployeeProfileHeader.jsx';
import EmployeeDetailsCards from '@/features/employees/components/EmplyeeProfile.jsx/EmployeeDetailsCards.jsx';
import ProfileHeader from '@/features/employees/components/EmplyeeProfile.jsx/ProfileHeader.jsx';
import ProfileDateFilters from '@/features/employees/components/EmplyeeProfile.jsx/ProfileDateFilters.jsx';
import EmployeeActivity from '@/features/employees/components/EmplyeeProfile.jsx/EmployeeActivity.jsx';
import EmployeeQualifications from '@/features/employees/components/EmplyeeProfile.jsx/EmployeeQualifications.jsx';
import EmployeeHolidays from '@/features/employees/components/EmplyeeProfile.jsx/EmployeeHolidays.jsx';
import EmployeeTotalHolidays from '@/features/employees/components/EmplyeeProfile.jsx/EmployeeTotalHolidays.jsx';
import EmployeeRewardsAndPenalties from '@/features/employees/components/EmplyeeProfile.jsx/EmployeeRewardsAndPenalties.jsx';
import EmployeeKpiPerformance from '@/features/employees/components/EmplyeeProfile.jsx/EmployeeKpiPerformance.jsx';
import EmployeeAllRequests from '@/features/employees/components/EmplyeeProfile.jsx/EmployeeAllRequests.jsx';
import EmployeeSalary from '@/features/employees/components/EmplyeeProfile.jsx/EmployeeSalary.jsx';
import EmployeePayrollSetting from '@/features/employees/components/EmplyeeProfile.jsx/EmployeePayrollSetting.jsx';
import EmployeeMeetings from '@/features/employees/components/EmplyeeProfile.jsx/EmployeeMeetings.jsx';
import EmployeeAssets from '@/features/employees/components/EmplyeeProfile.jsx/EmployeeAssets.jsx';
import EmployeeExceptions from '@/features/employees/components/EmplyeeProfile.jsx/EmployeeExceptions.jsx';
import EmployeeManager from '@/features/employees/components/EmplyeeProfile.jsx/EmployeeManager.jsx';

// Multi-step edit dialog
import EmployeeFormDialog from '@/features/employees/components/EmployeeFormDialog';

// API
import { employeesApi } from '@/features/employees/api/employees.api';

// Custom Hooks
import { useEmployeeDetails } from './useEmployeeDetails';

// Utils
import { getEmployeeProfileImageSource, getHeaderEmployeeData } from './employeesUtils';

// Isolated, form-style PDF renderer for this page only — kept separate from
// the shared `exportToPdf` in tableExport.js so other pages that still use
// the generic rows/columns table export are unaffected.
import { exportEmployeeProfilePdf } from '@/lib/export/exportEmployeeProfilePdf.js';

export default function EmployeeDetailsPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const isEmployeePortal = useAuthStore(
    (state) => state.authSource === 'employee-login'
  );

  // startsWith so 'ar', 'ar-EG', 'ar-SA' ... are all treated as Arabic.
  const isRTL = String(i18n.language || '').toLowerCase().startsWith('ar');
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const {
    id,
    activeTab,
    setActiveTab,
    profile,
    profileCards,
    activity,
    isLoading,
    isProfileReady,
    isNotFound,
    detailsData,
    salaryData,
    shifts,
    positions,
    dateFilters,
    setDateFilters,
  } = useEmployeeDetails();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [isLoadingForm, setIsLoadingForm] = useState(false);

  const headerEmployee = getHeaderEmployeeData(profile, shifts, positions);

  const handleExportPersonalInfo = async () => {
    const employee = detailsData || profile;

    if (!employee) {
      toast.error('No employee data available');
      return;
    }

    const valueOrDash = (value) => {
      if (value === null || value === undefined || value === '') return '--';
      if (Array.isArray(value)) return value.length ? value.join(', ') : '--';
      return String(value);
    };
    const listOrPlaceholder = (items) => (items?.length ? items : [{}]);
    const field = (label, value) => ({ label, value: valueOrDash(value) });
    const section = (title, items) => ({
      title,
      columns: [
        { key: 'label', label: t('employees.profile.export.field', 'Field') },
        { key: 'value', label: t('employees.profile.export.value', 'Value') },
      ],
      rows: items,
    });
    const qualifications = employee.qualifications || {};
    const basic = employee.basic || {};
    const contact = employee.contact || {};
    const work = employee.work || {};
    const contract = employee.contract || {};
    const salary = employee.salary || {};
    const employeeName = valueOrDash(basic.full_name || headerEmployee?.name);
    const companyName = valueOrDash(work.companyName || 'Nizam HR');
    const today = new Date().toLocaleDateString(i18n.language || undefined);

    const tables = [
      section(t('employees.profile.export.personalInformation', '1. Personal Information'), [
        field(t('employees.profile.details.fullName', 'Full Name'), basic.full_name),
        field(t('employees.profile.details.employeeId', 'Employee ID'), basic.employeeId),
        field(t('employees.profile.details.gender', 'Gender'), basic.gender),
        field(t('employees.profile.details.birthDate', 'Birth Date'), basic.birth_date),
        field(t('employees.profile.details.maritalStatus', 'Marital Status'), basic.maritalStatus),
        field(t('employees.profile.details.nationalId', 'National ID'), basic.nationalId),
        field(t('employees.profile.details.militaryService', 'Military Service'), basic.militaryService),
        field(t('employees.profile.details.nationality', 'Nationality'), contact.countryName),
        field(t('employees.profile.details.contact.address', 'Address'), [contact.city, contact.governorateName, contact.countryName].filter(Boolean).join(' / ')),
        field(t('employees.profile.details.contact.phoneNumber', 'Phone'), contact.phone),
        field(t('employees.profile.details.email', 'Email'), contact.email),
      ]),
      section(t('employees.profile.export.workInformation', '2. Work Information'), [
        field(t('employees.profile.details.work.company', 'Company'), work.companyName),
        field(t('employees.profile.details.work.department', 'Department'), work.departmentName),
        field(t('employees.profile.details.work.branch', 'Branch'), work.branchName),
        field(t('employees.profile.details.work.position', 'Position'), work.positionName),
        field(t('employees.profile.details.work.manager', 'Manager'), work.managerName),
        field(t('employees.profile.details.work.shift', 'Shift'), work.shiftName),
        field(t('employees.profile.details.joiningDate', 'Joining Date'), contract.startDate),
      ]),
      section(t('employees.profile.export.contractInformation', '3. Contract Information'), [
        field(t('employees.profile.details.contract.contractType', 'Contract Type'), contract.type),
        field(t('employees.profile.details.contract.startDate', 'Start Date'), contract.startDate),
        field(t('employees.profile.details.contract.endDate', 'End Date'), contract.endDate),
        field(t('employees.profile.details.contract.duration', 'Duration'), contract.duration),
      ]),
      {
        title: t('employees.profile.export.qualifications', '4. Qualifications'),
        columns: [
          { key: 'degree', label: t('employees.profile.export.degree', 'Degree') },
          { key: 'college', label: t('employees.profile.export.college', 'College') },
          { key: 'university', label: t('employees.profile.export.university', 'University') },
          { key: 'startYear', label: t('employees.profile.export.startYear', 'Start Year') },
          { key: 'graduationYear', label: t('employees.profile.export.graduationYear', 'Graduation Year') },
        ],
        rows: listOrPlaceholder(qualifications.educations).map((item) => ({
          degree: valueOrDash(item.degree_level),
          college: valueOrDash(item.field_of_study),
          university: valueOrDash(item.institution),
          startYear: valueOrDash(item.start_date),
          graduationYear: valueOrDash(item.end_date),
        })),
      },
      {
        title: t('employees.profile.export.courses', '5. Courses'),
        columns: [
          { key: 'course', label: t('employees.profile.export.course', 'Course') },
          { key: 'place', label: t('employees.profile.export.place', 'Place') },
          { key: 'duration', label: t('employees.profile.export.duration', 'Duration') },
          { key: 'date', label: t('employees.profile.export.date', 'Date') },
        ],
        rows: listOrPlaceholder(employee.courses || employee.training_courses).map((item) => ({
          course: valueOrDash(item.name || item.course || item.title),
          place: valueOrDash(item.place || item.provider || item.institution),
          duration: valueOrDash(item.duration),
          date: valueOrDash(item.date || item.start_date),
        })),
      },
      {
        title: t('employees.profile.export.previousEmployment', '6. Previous Employment'),
        columns: [
          { key: 'jobTitle', label: t('employees.profile.export.jobTitle', 'Job Title') },
          { key: 'company', label: t('employees.profile.export.company', 'Company') },
          { key: 'address', label: t('employees.profile.export.address', 'Address') },
          { key: 'from', label: t('employees.profile.export.from', 'From') },
          { key: 'to', label: t('employees.profile.export.to', 'To') },
          { key: 'salary', label: t('employees.profile.export.salary', 'Salary') },
          { key: 'reason', label: t('employees.profile.export.reasonLeaving', 'Reason Leaving') },
        ],
        rows: listOrPlaceholder(qualifications.experiences).map((item) => ({
          jobTitle: valueOrDash(item.job_title),
          company: valueOrDash(item.company_name),
          address: valueOrDash(item.address),
          from: valueOrDash(item.start_date),
          to: valueOrDash(
            item.end_date ||
              (item.is_current ? t('employees.profile.export.present', 'Present') : '')
          ),
          salary: valueOrDash(item.salary),
          reason: valueOrDash(item.reason_leaving || item.reason),
        })),
      },
      section(t('employees.profile.export.skills', '7. Skills'), [
        field(t('employees.profile.export.microsoftOffice', 'Microsoft Office'), qualifications.skills?.filter((item) => /office|excel|word|powerpoint/i.test(item.name || '')).map((item) => item.name)),
        field(t('employees.profile.export.languages', 'Languages'), qualifications.languages?.map((item) => [item.language, item.level].filter(Boolean).join(' - '))),
        field(t('employees.profile.export.graphics', 'Graphics'), qualifications.skills?.filter((item) => /graphic|design|photoshop|illustrator/i.test(item.name || '')).map((item) => item.name)),
        field(t('employees.profile.export.translation', 'Translation'), qualifications.skills?.filter((item) => /translat/i.test(item.name || '')).map((item) => item.name)),
        field(t('employees.profile.export.otherSkills', 'Other Skills'), qualifications.skills?.map((item) => item.name)),
      ]),
      section(t('employees.profile.export.salaryInformation', '8. Salary Information'), [
        field(t('employees.profile.details.salary.salaryType', 'Salary Type'), salary.type),
        field(t('employees.profile.details.salary.totalSalary', 'Total Salary'), salary.net),
        field(t('employees.profile.details.salary.kpi', 'KPI'), salary.kpi),
        field(t('employees.profile.details.salary.commission', 'Commission'), salary.commission),
        field(t('employees.profile.details.salary.paymentMethod', 'Payment Method'), salary.salary_method),
      ]),
    ];

    // Export the exact same real profile image source used by
    // EmployeeProfileHeader. Never use detailsData/applicant.image here because
    // applicant.image can be an uploaded document instead of the avatar.
    const employeePhoto = getEmployeeProfileImageSource(profile) || null;

    const jobTitle =
      work?.positionName ||
      headerEmployee?.role ||
      employee?.jobTitle ||
      employee?.job_title ||
      '';

    const phone = contact?.phone || employee?.phone || '';
    const email = contact?.email || employee?.email || '';
    const address =
      [contact?.city, contact?.governorateName, contact?.countryName]
        .filter(Boolean)
        .join(' / ') ||
      contact?.address ||
      employee?.address ||
      '';

    const imageBaseUrl = String(import.meta.env.VITE_API_URL || '')
      .replace(/\/api\/hr\/v1\/?$/i, '')
      .replace(/\/api\/?$/i, '')
      .replace(/\/$/, '');


    try {
      await exportEmployeeProfilePdf({
        tables,
        fileName: `employee-profile-${employee?.basic?.employeeId || id}`,
        title: t('employees.profile.export.title', 'Employee Profile / CV'),
        subtitle: `${employeeName} | ${companyName} | ${today}`,
        language: i18n.language,
        isRTL,
        header: {
          companyName,
          employeeName,
          name: employeeName,
          jobTitle,
          phone,
          email,
          address,
          photo: employeePhoto,
          imageBaseUrl,
          exportDate: today,
          language: i18n.language,
          isRTL,
          logo: '/nizam-logo.svg',
        },
      });

      toast.success(
        t('employees.profile.export.success', 'Employee profile exported successfully')
      );
    } catch (error) {
      // Without this, a failure inside the PDF code is silent in the UI.
      console.error('Employee profile PDF export failed:', error);
      toast.error(
        t('employees.profile.export.error', 'Failed to export employee profile')
      );
    }
  };

  const handleOpenEditForm = async () => {
    try {
      setIsLoadingForm(true);

      const personalDataId =
        detailsData?.employee?.id || detailsData?.id || profile?.id || id;

      const data = await employeesApi.getPersonalData(personalDataId);

      setEditFormData(data);
      setIsFormOpen(true);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to load employee data');
    } finally {
      setIsLoadingForm(false);
    }
  };

  const handleImageUpload = async (file) => {
    try {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];

      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a valid image file (JPG, JPEG, or PNG)');
        return;
      }

      const maxSize = 5 * 1024 * 1024;

      if (file.size > maxSize) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      const employeeId =
        detailsData?.employee?.id || detailsData?.id || profile?.id || id;

      await employeesApi.uploadEmployeeImage(employeeId, file);

      toast.success('Profile picture uploaded successfully');

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      let errorMessage = 'Failed to upload profile picture';

      if (error?.response?.data?.errors?.image?.[0]) {
        errorMessage = error.response.data.errors.image[0];
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    }
  };

  if (isNotFound) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="p-8 text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a7.5 7.5 0 1115 0"
                />
              </svg>
            </div>

            <h2 className="mb-2 text-xl font-semibold text-slate-900">
              {t(
                'employees.tasksBoard.employeeProfile.notFoundTitle',
                'Employee not found'
              )}
            </h2>

            <p className="mb-6 text-sm text-slate-500">
              {t(
                'employees.tasksBoard.employeeProfile.notFoundDescription',
                'The employee profile could not be loaded or may no longer exist.'
              )}
            </p>

            <button
              type="button"
              onClick={() => navigate('/employees')}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary/90"
            >
              <BackIcon className="h-4 w-4" />
              {t(
                'employees.tasksBoard.employeeProfile.backToEmployees',
                'Back to Employees'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isProfileReady) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center px-4">
        <svg
          className="mb-2 h-6 w-6 animate-spin text-primary"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
        <p className="text-sm text-slate-500">
          {t(
            'employees.tasksBoard.employeeProfile.loading',
            'Loading employee profile...'
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div />

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportPersonalInfo}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 cursor-pointer text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            <Download className="h-4 w-4" />
            {t('employees.profile.exportPersonalInfo', 'Export Personal Info')}
          </button>

          {!isEmployeePortal && (
            <button
              type="button"
              onClick={handleOpenEditForm}
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              {t('employees.profile.edit')}
            </button>
          )}
        </div>
      </div>

      <EmployeeProfileHeader
        employee={profile}
        shifts={shifts}
        positions={positions}
        stats={profileCards}
        onImageUpload={handleImageUpload}
        isLoadingEdit={isLoadingForm}
      />

      <EmployeeFormDialog
        open={isFormOpen}
        onOpenChange={(v) => {
          setIsFormOpen(v);
          if (!v) setEditFormData(null);
        }}
        employee={editFormData}
      />

      <div className="flex w-full flex-col gap-3">
        <div className="w-full">
          <ProfileHeader
            activeTab={activeTab}
            onTabChange={setActiveTab}
            employee={profile}
          />
        </div>

        <ProfileDateFilters
          filters={dateFilters}
          onFiltersChange={setDateFilters}
          className="justify-end"
        />
      </div>

      {activeTab === 'personalInformation' && detailsData && (
        <EmployeeDetailsCards
          employee={detailsData}
          isLoading={isLoading}
          isEditing={false}
          onFieldChange={() => {}}
        />
      )}

      {activeTab === 'qualifications' && (
        <EmployeeQualifications employee={detailsData} isLoading={isLoading} />
      )}

      {activeTab === 'activity' && (
        <EmployeeActivity
          employee={headerEmployee}
          employeeId={id}
          attendances={activity?.attendances || []}
          isLoading={isLoading}
        />
      )}

      {activeTab === 'holidays' && (
        <EmployeeHolidays employeeId={id} isLoading={isLoading} />
      )}

      {activeTab === 'totalHoliday' && (
        <EmployeeTotalHolidays employeeId={id} isLoading={isLoading} />
      )}

      {activeTab === 'rewardsAndPenalties' && (
        <EmployeeRewardsAndPenalties employeeId={id} isLoading={isLoading} />
      )}

      {activeTab === 'kpiPerformance' && (
        <EmployeeKpiPerformance
          employeeId={id}
          isLoading={isLoading}
          employee={detailsData}
        />
      )}

      {activeTab === 'requests' && (
        <EmployeeAllRequests
          employeeId={id}
          employee={headerEmployee}
          isLoading={isLoading}
        />
      )}

      {activeTab === 'salary' && (
        <EmployeeSalary
          employeeId={id}
          salaryData={salaryData}
          isLoading={isLoading}
        />
      )}

      {activeTab === 'payrollSetting' && (
        <EmployeePayrollSetting employeeId={id} isLoading={isLoading} />
      )}

      {activeTab === 'meetings' && (
        <EmployeeMeetings employeeId={id} isLoading={isLoading} />
      )}

      {activeTab === 'assets' && (
        <EmployeeAssets employeeId={id} isLoading={isLoading} />
      )}

      {activeTab === 'exceptions' && (
        <EmployeeExceptions employeeId={id} isLoading={isLoading} />
      )}

      {activeTab === 'teams' && (
        <EmployeeManager
          employeeId={id}
          isLoading={isLoading}
          dateFilters={dateFilters}
        />
      )}
    </div>
  );
}
