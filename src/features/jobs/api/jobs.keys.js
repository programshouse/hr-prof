export const jobsKeys = {
  all: ['jobs'],

  sections: (positionId) => [...jobsKeys.all, 'sections', String(positionId || '')],

  questions: (sectionId) => [...jobsKeys.all, 'questions', String(sectionId || '')],

  publicForm: (positionId, companyId) => [
    ...jobsKeys.all,
    'public-form',
    String(positionId || ''),
    String(companyId || ''),
  ],
};
