import { toast } from 'sonner';
import { exportEmployeeProfilePdf } from '@/lib/export/exportEmployeeProfilePdf.js';
import { resolveEmployeeDisplayName } from '@/lib/utils/employeeDisplayName';

function resolveEmpName(id, employees = [], preferArabic = false) {
  if (id === null || id === undefined || id === '') return '';
  const employeeList = Array.isArray(employees)
    ? employees
    : employees?.data ?? employees?.employees ?? [];
  const emp = employeeList.find(
    (e) => String(e.id ?? e.employee_id ?? e.value) === String(id)
  );
  if (!emp) return '';
  return (
    resolveEmployeeDisplayName(emp, { preferArabic }) ||
    emp.name ||
    emp.full_name ||
    emp.employee_name ||
    emp.label ||
    ''
  );
}

export async function exportApplicantProfile({
  applicant,
  rawData,
  t,
  i18n,
  customSignatures = null,
  downloadCv = false,
  employees = [],
}) {
  if (!applicant) {
    toast.error(t('applicants.profile.export.noData', 'No applicant data available'));
    return;
  }

  const isRTL = String(i18n?.language || '').toLowerCase().startsWith('ar');

  const valueOrDash = (value) => {
    if (value === null || value === undefined || value === '') return '--';
    if (Array.isArray(value)) return value.length ? value.join(', ') : '--';
    return String(value);
  };

  const listOrPlaceholder = (items) => (items?.length ? items : []);
  const field = (label, value) => ({ label, value: valueOrDash(value) });
  const section = (title, items) => ({
    title,
    columns: [
      { key: 'label', label: t('applicants.profile.export.field', 'Field') },
      { key: 'value', label: t('applicants.profile.export.value', 'Value') },
    ],
    rows: items,
  });

  const basic = applicant.basic || {};
  const contact = applicant.contact || {};
  const role = applicant.role || {};
  const qualifications = applicant.qualifications || {};
  const applicantName = valueOrDash(basic.fullName || applicant.name);
  const companyName = 'Nizam HR';
  const today = new Date().toLocaleDateString(i18n?.language || undefined);
  const positionTitle = valueOrDash(role.position || applicant.title);

  const cvDoc = applicant.documents?.find(
    (d) => String(d?.label || '').toUpperCase() === 'CV'
  );
  const cvUrl =
    cvDoc?.url ||
    applicant.cv ||
    rawData?.cv ||
    rawData?.data?.cv ||
    null;

  const certDoc = applicant.documents?.find(
    (d) => String(d?.label || '').toUpperCase() === 'CERTIFICATION'
  );
  const certificationUrl =
    certDoc?.url ||
    applicant.certification_attatchment ||
    rawData?.certification_attatchment ||
    rawData?.data?.certification_attatchment ||
    null;

  const coverLetter =
    applicant.coverLetter ||
    rawData?.cover_letter ||
    rawData?.data?.cover_letter ||
    null;

  const linksList = (applicant.links || [])
    .map((l) => `${l.label}: ${l.url}`)
    .filter(Boolean);

  // Resolve Line Manager & HR Manager info
  const lm = customSignatures?.lineManager || {};
  const hr = customSignatures?.hrManager || {};

  const source =
    rawData?.data?.applicant ??
    rawData?.data ??
    rawData?.applicant ??
    rawData ??
    applicant ??
    {};

  const lmId =
    source.hiring_manager_id ??
    source.hiring_manager?.id ??
    source.hiring_manager?.employee_id ??
    rawData?.hiring_manager_id ??
    rawData?.data?.hiring_manager_id ??
    applicant?.hiring_manager_id ??
    applicant?.hiring?.lineManagerId ??
    null;

  const hrId =
    source.hiring_hr_id ??
    source.hiring_hr?.id ??
    source.hiring_hr?.employee_id ??
    rawData?.hiring_hr_id ??
    rawData?.data?.hiring_hr_id ??
    applicant?.hiring_hr_id ??
    applicant?.hiring?.hrManagerId ??
    null;

  const rawLmName =
    source.hiring_manager_name ||
    source.hiring_manager?.name ||
    source.hiring_manager?.full_name ||
    rawData?.hiring_manager_name ||
    rawData?.data?.hiring_manager_name ||
    applicant?.hiring_manager_name ||
    applicant?.hiring?.lineManagerName ||
    '';

  const rawHrName =
    source.hiring_hr_name ||
    source.hiring_hr?.name ||
    source.hiring_hr?.full_name ||
    rawData?.hiring_hr_name ||
    rawData?.data?.hiring_hr_name ||
    applicant?.hiring_hr_name ||
    applicant?.hiring?.hrManagerName ||
    '';

  const rawLmNote =
    source.hiring_manager_note ??
    rawData?.hiring_manager_note ??
    rawData?.data?.hiring_manager_note ??
    applicant?.hiring_manager_note ??
    applicant?.hiring?.lineManagerNote ??
    '';

  const rawHrNote =
    source.hiring_hr_note ??
    rawData?.hiring_hr_note ??
    rawData?.data?.hiring_hr_note ??
    applicant?.hiring_hr_note ??
    applicant?.hiring?.hrManagerNote ??
    '';

  const resolvedLineManagerName =
    lm.name ||
    rawLmName ||
    resolveEmpName(lmId, employees, isRTL) ||
    (lmId ? t('applicants.profile.export.nameUnavailable', 'Name unavailable') : '');

  const resolvedLineManagerNote =
    lm.notes !== undefined && lm.notes !== ''
      ? lm.notes
      : rawLmNote;

  const resolvedHrManagerName =
    hr.name ||
    rawHrName ||
    resolveEmpName(hrId, employees, isRTL) ||
    (hrId ? t('applicants.profile.export.nameUnavailable', 'Name unavailable') : '');

  const resolvedHrManagerNote =
    hr.notes !== undefined && hr.notes !== ''
      ? hr.notes
      : rawHrNote;

  const tables = [
    section(t('applicants.profile.export.personalInformation', '1. Personal Information'), [
      field(t('applicants.profile.fields.fullName', 'Full Name'), basic.fullName || applicant.name),
      field(t('applicants.profile.applicantId', 'Applicant ID'), applicant.applicantCode || rawData?.applicant_code || applicant.id),
      field(t('applicants.profile.fields.gender', 'Gender'), basic.gender),
      field(t('applicants.profile.fields.dateOfBirth', 'Date of Birth'), basic.birthDate),
      field(t('applicants.profile.fields.maritalStatus', 'Marital Status'), basic.maritalStatus),
      field(t('applicants.profile.fields.nationalId', 'National ID'), basic.nationalId),
      field(t('applicants.profile.fields.militaryService', 'Military Service'), basic.militaryService),
      field(t('applicants.profile.fields.country', 'Country'), contact.country),
      field(t('applicants.profile.fields.governorate', 'Governorate'), contact.governorate),
      field(t('applicants.profile.fields.city', 'City'), contact.city),
      field(t('applicants.profile.fields.address', 'Address'), contact.address),
      field(t('applicants.profile.fields.phoneNumber', 'Phone Number'), contact.phone),
      field(t('applicants.profile.fields.whatsappNumber', 'WhatsApp Number'), contact.whatsapp),
      field(t('applicants.profile.fields.email', 'Email'), contact.email),
      field(t('applicants.profile.fields.smoker', 'Smoker'), basic.isSmoker),
      field(t('applicants.profile.fields.chronicDisease', 'Chronic Disease'), basic.hasChronicDisease),
      ...(basic.hasChronicDisease === 'Yes' && basic.chronicDiseases
        ? [field(t('applicants.profile.fields.diseases', 'Diseases'), basic.chronicDiseases)]
        : []),
    ]),

    section(t('applicants.profile.export.roleInformation', '2. Application & Role Information'), [
      field(t('applicants.profile.fields.position', 'Position Applied For'), role.position || applicant.title),
      field(t('applicants.profile.fields.employmentType', 'Employment Type'), role.employmentType),
      field(t('applicants.profile.fields.workSetup', 'Work Setup'), role.workSetup),
      field(t('applicants.profile.fields.availableStartDate', 'Available Start Date'), role.availableStartDate),
      field(t('applicants.profile.fields.expectedSalary', 'Expected Salary'), role.expectedSalary),
      field(t('applicants.profile.status', 'Status'), role.status || applicant.status),
      field(t('applicants.profile.appliedAt', 'Applied At'), role.createdAt),
    ]),

    {
      title: t('applicants.profile.export.qualifications', '3. Education & Qualifications'),
      columns: [
        { key: 'degree', label: t('applicants.profile.export.degree', 'Degree') },
        { key: 'fieldOfStudy', label: t('applicants.profile.export.fieldOfStudy', 'Field of Study') },
        { key: 'institution', label: t('applicants.profile.export.institution', 'Institution / University') },
        { key: 'country', label: t('applicants.profile.export.country', 'Country') },
        { key: 'startYear', label: t('applicants.profile.export.startYear', 'Start Year') },
        { key: 'graduationYear', label: t('applicants.profile.export.graduationYear', 'Graduation Year') },
      ],
      rows: listOrPlaceholder(qualifications.educations || rawData?.educations).map((item) => ({
        degree: valueOrDash(item.degree_level || item.degree),
        fieldOfStudy: valueOrDash(item.field_of_study || item.major),
        institution: valueOrDash(item.institution || item.university),
        country: valueOrDash(item.institution_country || item.country),
        startYear: valueOrDash(item.start_date),
        graduationYear: valueOrDash(item.end_date),
      })),
    },

    {
      title: t('applicants.profile.export.experience', '4. Work Experience'),
      columns: [
        { key: 'jobTitle', label: t('applicants.profile.export.jobTitle', 'Job Title') },
        { key: 'company', label: t('applicants.profile.export.company', 'Company') },
        { key: 'type', label: t('applicants.profile.export.workType', 'Type') },
        { key: 'from', label: t('applicants.profile.export.from', 'From') },
        { key: 'to', label: t('applicants.profile.export.to', 'To') },
        { key: 'salary', label: t('applicants.profile.export.salary', 'Salary') },
        { key: 'reason', label: t('applicants.profile.export.reasonLeaving', 'Reason / Responsibilities') },
      ],
      rows: listOrPlaceholder(qualifications.experiences || rawData?.experiences).map((item) => ({
        jobTitle: valueOrDash(item.job_title || item.title),
        company: valueOrDash(item.company_name || item.company),
        type: valueOrDash(item.employment_type || item.work_setup),
        from: valueOrDash(item.start_date),
        to: valueOrDash(
          item.end_date ||
            (item.is_current ? t('applicants.profile.export.present', 'Present') : '')
        ),
        salary: valueOrDash(item.salary),
        reason: valueOrDash(
          item.key_responsibilities || item.description || item.reason_leaving || item.reason
        ),
      })),
    },

    section(t('applicants.profile.export.skills', '5. Skills & Languages'), [
      field(
        t('applicants.profile.fields.skills', 'Skills'),
        qualifications.skills?.map((item) => item.name || item.skill)
      ),
      field(
        t('applicants.profile.fields.languages', 'Languages'),
        qualifications.languages?.map((item) =>
          [item.language, item.level].filter(Boolean).join(' - ')
        )
      ),
    ]),

    section(t('applicants.profile.export.documents', '6. Documents & Attachments'), [
      field(
        t('applicants.profile.fields.cv', 'CV / Resume'),
        cvUrl || t('applicants.profile.export.notUploaded', 'Not Uploaded')
      ),
      ...(coverLetter
        ? [field(t('applicants.profile.fields.coverLetter', 'Cover Letter'), coverLetter)]
        : []),
      ...(certificationUrl
        ? [field(t('applicants.profile.fields.certification', 'Certification Attachment'), certificationUrl)]
        : []),
      ...(linksList.length > 0
        ? [field(t('applicants.profile.fields.portfolioLinks', 'Portfolio & Profile Links'), linksList.join(' | '))]
        : []),
    ])
  ];

  const signatures = [
    {
      role: t(
        'applicants.profile.export.lineManagerSignature',
        'Line Manager Signature'
      ),
      title: t(
        'applicants.profile.export.lineManagerSignature',
        'Line Manager Signature'
      ),
      name: resolvedLineManagerName,
      signature: '',
      signatureText: '',
      decision: '',
      date: '',
      notes: resolvedLineManagerNote,
      signatureImage: null,
      nameLabel: isRTL ? 'الاسم: ........................................' : 'Name: ........................................',
      signatureLabel: isRTL ? 'التوقيع: ........................................' : 'Signature: ........................................',
      dateLabel: isRTL ? 'التاريخ:      /      / 202' : 'Date:      /      / 202',
      decisionLabel: isRTL ? 'القرار:  [  ] موافقة     [  ] رفض' : 'Decision:  [  ] Approved     [  ] Rejected',
      notesLabel: isRTL
        ? 'ملاحظات: .....................................................................................................................................'
        : 'Notes: .....................................................................................................................................',
    },
    {
      role: t(
        'applicants.profile.export.hrManagerSignature',
        'HR Manager Signature'
      ),
      title: t(
        'applicants.profile.export.hrManagerSignature',
        'HR Manager Signature'
      ),
      name: resolvedHrManagerName,
      signature: '',
      signatureText: '',
      decision: '',
      date: '',
      notes: resolvedHrManagerNote,
      signatureImage: null,
      nameLabel: isRTL ? 'الاسم: ........................................' : 'Name: ........................................',
      signatureLabel: isRTL ? 'التوقيع: ........................................' : 'Signature: ........................................',
      dateLabel: isRTL ? 'التاريخ:      /      / 202' : 'Date:      /      / 202',
      decisionLabel: isRTL ? 'القرار:  [  ] موافقة     [  ] رفض' : 'Decision:  [  ] Approved     [  ] Rejected',
      notesLabel: isRTL
        ? 'ملاحظات: .....................................................................................................................................'
        : 'Notes: .....................................................................................................................................',
    },
  ];

  const applicantPhoto = applicant.avatar || rawData?.image || null;

  const imageBaseUrl = String(import.meta.env.VITE_API_URL || '')
    .replace(/\/api\/hr\/v1\/?$/i, '')
    .replace(/\/api\/?$/i, '')
    .replace(/\/$/, '');

  const address =
    [contact.city, contact.governorate, contact.country].filter(Boolean).join(' / ') ||
    contact.address ||
    '';

  try {
    await exportEmployeeProfilePdf({
      tables,
      signatures,
      signaturesTitle: t('applicants.profile.export.signatures', '7. Approvals & Signatures'),
      fileName: `applicant-profile-${applicant.applicantCode || applicant.id}`,
      title: t('applicants.profile.export.title', 'Applicant Profile / Application Form'),
      subtitle: `${applicantName} | ${companyName} | ${today}`,
      language: i18n?.language,
      isRTL,
      header: {
        companyName,
        employeeName: applicantName,
        name: applicantName,
        jobTitle: positionTitle,
        phone: contact.phone || '',
        email: contact.email || '',
        address,
        photo: applicantPhoto,
        imageBaseUrl,
        exportDate: today,
        language: i18n?.language,
        isRTL,
        logo: '/nizam-logo.svg',
      },
    });

    if (downloadCv && cvUrl) {
      try {
        const link = document.createElement('a');
        link.href = cvUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        const ext = String(cvUrl).split('.').pop()?.split('?')[0] || 'pdf';
        link.download = `applicant-cv-${applicant.applicantCode || applicant.id}.${ext}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.warn('Auto-download CV failed:', err);
      }
    }

    toast.success(
      t('applicants.profile.export.success', 'Applicant profile exported successfully')
    );
  } catch (error) {
    console.error('Applicant profile PDF export failed:', error);
    toast.error(
      t('applicants.profile.export.error', 'Failed to export applicant profile')
    );
  }
}
