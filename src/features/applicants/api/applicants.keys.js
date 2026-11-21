export const applicantsKeys = {
  all: ['applicants'],

  header: () => [...applicantsKeys.all, 'header'],

  applyLink: (companyId) => [
    ...applicantsKeys.all,
    'apply-link',
    String(companyId || ''),
  ],

  table: (
    {
      page = 1,
      limit = 10,
      keyword = '',
      position_id = 'all',
      status = 'all',
    } = {}
  ) => [
    ...applicantsKeys.all,
    'table',
    String(page),
    String(limit),
    String(keyword || ''),
    String(position_id || 'all'),
    String(status || 'all'),
  ],

  details: () => [...applicantsKeys.all, 'details'],
  detail: (id) => [...applicantsKeys.details(), String(id)],
};