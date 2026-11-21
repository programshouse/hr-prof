export const transformInterviewData = (
  apiData,
  employees = [],
  departments = [],
  positions = [],
  language = 'en'
) => {
  const isArabic = String(language || '').toLowerCase().startsWith('ar');
  let interviewsArray = [];

  if (Array.isArray(apiData)) {
    interviewsArray = apiData;
  } else if (apiData?.data && Array.isArray(apiData.data)) {
    interviewsArray = apiData.data;
  } else if (apiData?.data?.data && Array.isArray(apiData.data.data)) {
    interviewsArray = apiData.data.data;
  }

  if (!Array.isArray(interviewsArray)) {
    console.warn('Invalid interview data structure:', apiData);
    return [];
  }

  // employee lookup map
  const employeesById = new Map();
  (employees || []).forEach((emp) => {
    const key = emp?.id ?? emp?.employee_id ?? emp?.user_id;
    if (key != null) employeesById.set(String(key), emp);
  });

  // department lookup map
  const departmentsById = new Map();
  (departments || []).forEach((dept) => {
    const key = dept?.id ?? dept?.department_id;
    if (key != null) departmentsById.set(String(key), dept);
  });

  // position lookup map
  const positionsById = new Map();
  (positions || []).forEach((pos) => {
    const key = pos?.id ?? pos?.position_id;
    if (key != null) positionsById.set(String(key), pos);
  });

  return interviewsArray.map((interview) => {
    const interviewerId =
      interview?.interviewer_id ??
      interview?.interviewer?.id ??
      interview?.interviewer?.employee_id ??
      null;

    const interviewerEmployee = interviewerId ? employeesById.get(String(interviewerId)) : null;

    const rawInterviewer = interview?.interviewer;
    const interviewerNameSource = interviewerEmployee || rawInterviewer;

    const interviewerName = (() => {
      if (typeof rawInterviewer === 'string' && rawInterviewer.trim()) {
        return rawInterviewer.trim();
      }

      if (!interviewerNameSource || typeof interviewerNameSource === 'string') {
        return '--';
      }

      const fallbackName = `${interviewerNameSource.first_name || ''} ${interviewerNameSource.last_name || ''}`.trim();

      if (isArabic) {
        return (
          interviewerNameSource.name_ar ||
          interviewerNameSource.employee_name_ar ||
          interviewerNameSource.full_name_ar ||
          interviewerNameSource.name ||
          interviewerNameSource.employee_name ||
          interviewerNameSource.full_name ||
          fallbackName ||
          '--'
        );
      }

      return (
        interviewerNameSource.name ||
        interviewerNameSource.employee_name ||
        interviewerNameSource.full_name ||
        interviewerNameSource.name_en ||
        interviewerNameSource.employee_name_en ||
        interviewerNameSource.name_ar ||
        interviewerNameSource.employee_name_ar ||
        fallbackName ||
        '--'
      );
    })();

    // Lookup department by department_id or department object
    const department = interview.department ||
      (interview.department_id ? departmentsById.get(String(interview.department_id)) : null);

    const departmentName = isArabic
      ? department?.name_ar || department?.name_en || department?.name || String(interview.department_id || interview.department?.id || '')
      : department?.name_en || department?.name_ar || department?.name || String(interview.department_id || interview.department?.id || '');

    // Lookup position by position_id or use API position title
    const positionAppliedFor = interview.applicant?.position_applied_for;
    const positionObj =
      (interview.position && typeof interview.position === 'object' ? interview.position : null) ||
      (positionAppliedFor && typeof positionAppliedFor === 'object' ? positionAppliedFor : null) ||
      (interview.applicant?.position && typeof interview.applicant?.position === 'object' ? interview.applicant.position : null);

    const positionId =
      interview.position_id ??
      interview.position?.id ??
      interview.applicant?.position_applied_for_id ??
      interview.applicant?.position_id ??
      null;

    const matchedPosition = positionId != null ? positionsById.get(String(positionId)) : null;

    let positionName = '';
    if (isArabic) {
      positionName =
        interview.position_title_ar ||
        interview.position_name_ar ||
        positionObj?.title_ar ||
        positionObj?.name_ar ||
        matchedPosition?.title_ar ||
        matchedPosition?.name_ar ||
        interview.position_title_en ||
        interview.position_title ||
        interview.position_name ||
        interview.position_name_en ||
        positionObj?.title_en ||
        positionObj?.name_en ||
        positionObj?.title ||
        positionObj?.name ||
        matchedPosition?.title_en ||
        matchedPosition?.title ||
        matchedPosition?.name_en ||
        matchedPosition?.name ||
        (typeof interview.position === 'string' ? interview.position : '') ||
        '';
    } else {
      positionName =
        interview.position_title_en ||
        interview.position_title ||
        interview.position_name ||
        interview.position_name_en ||
        positionObj?.title_en ||
        positionObj?.name_en ||
        positionObj?.title ||
        positionObj?.name ||
        matchedPosition?.title_en ||
        matchedPosition?.title ||
        matchedPosition?.name_en ||
        matchedPosition?.name ||
        interview.position_title_ar ||
        interview.position_name_ar ||
        positionObj?.title_ar ||
        positionObj?.name_ar ||
        matchedPosition?.title_ar ||
        matchedPosition?.name_ar ||
        (typeof interview.position === 'string' ? interview.position : '') ||
        '';
    }

    return {
      id: interview.id,

      applicant_name:
        isArabic
          ? interview.applicant?.full_name_ar || interview.applicant?.full_name ||
            `${interview.applicant?.first_name || ''} ${interview.applicant?.middle_name || ''} ${
              interview.applicant?.last_name || ''
            }`.trim() ||
            '—'
          : interview.applicant?.full_name ||
            interview.applicant?.full_name_ar ||
            `${interview.applicant?.first_name || ''} ${interview.applicant?.middle_name || ''} ${
              interview.applicant?.last_name || ''
            }`.trim() ||
            '—',

      applicant_code: interview.applicant?.applicant_code || `APP-${interview.applicant_id}`,
      applicant_avatar: interview.applicant?.image || null,

      department: departmentName,

      interviewDate: interview.interview_date
        ? new Date(interview.interview_date).toLocaleDateString(language || 'en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })
        : '',

      interviewTime: interview.interview_time
        ? (() => {
            try {
              const time = interview.interview_time;
              const match = /^(\d{1,2}):(\d{2})/.exec(time);
              if (match) {
                const h = parseInt(match[1], 10);
                const m = match[2];
                const suffix = h >= 12 ? 'PM' : 'AM';
                const h12 = h % 12 || 12;
                return `${h12}:${m} ${suffix}`;
              }
              return time;
            } catch {
              console.warn('Invalid time format:', interview.interview_time);
              return interview.interview_time;
            }
          })()
        : '',

      originalInterviewTime: interview.interview_time || '',

      // IMPORTANT: keep id + name
      interviewer_id: interviewerId,
      interviewer: interviewerName,

      status: interview.status || '',
      position: positionName,
      position_title_en:
        interview.position_title_en ||
        positionObj?.title_en ||
        matchedPosition?.title_en ||
        positionName,
      position_title_ar:
        interview.position_title_ar ||
        positionObj?.title_ar ||
        matchedPosition?.title_ar ||
        '',
      position_id: positionId,
      level: interview.level || '',
      type: interview.type || '',
      rate: interview.rate || '',
      comment: interview.comment || '',

      originalData: interview,
    };
  });
};
