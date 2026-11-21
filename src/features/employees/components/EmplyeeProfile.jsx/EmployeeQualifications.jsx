import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Star } from 'lucide-react';
import { EmptyState } from '@/components/feedback/EmptyState';

/* -------------------- Primitives -------------------- */

function Stars({ value = 0, outOf = 5 }) {
  const v = Math.max(0, Math.min(outOf, Number(value) || 0));
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: outOf }).map((_, i) => {
        const filled = i < v;
        return (
          <Star
            key={i}
            className={[
              'h-3.5 w-3.5',
              filled ? 'fill-primary text-primary' : 'text-slate-200',
            ].join(' ')}
          />
        );
      })}
    </div>
  );
}


function Timeline({ items }) {
  const { t } = useTranslation();
  
  if (!items?.length) {
    return <p className="text-sm text-gray">{t('employees.profile.details.qualifications.noWorkExperience')}</p>;
  }

  return (
    <div className="space-y-4">
      {items.map((exp, idx) => {
        const isLast = idx === items.length ;

        return (
          <div key={idx} className="relative pl-10">
            {/* Dot */}
            <span className="absolute left-2 top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-indigo-50 z-10" />

            {/* Line — auto height (matches card) */}
            {!isLast && (
              <span
                className="absolute left-[14px] top-2 bottom-0 w-[3px] rounded-full bg-primary"
              />
            )}

            {/* Content */}
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
              <div className="text-lg font-semibold text-primary">
                {exp.title}
              </div>

              <div className="mt-1 text-xs text-slate-700">
                <span className="font-medium">{exp.company}</span>
                {exp.type && <span className="text-black"> · {exp.type}</span>}
                {exp.salary && <span className="text-black"> · ${exp.salary}</span>}
              </div>

              <div className="mt-1 text-xs text-black font-bold">
                {exp.start} - {exp.end || 'Present'}
              </div>

              {exp.managerName && (
                <div className="mt-2 text-xs text-gray">
                  <span className="font-medium">{t('employees.profile.details.qualifications.manager')}:</span> {exp.managerName}
                  {exp.managerEmail && <span> · {exp.managerEmail}</span>}
                </div>
              )}

              {exp.description && (
                <p className="mt-2 text-xs leading-4 text-gray">
                  {exp.description}
                </p>
              )}

              {exp.okayToContact && exp.managerPhone && (
                <div className="mt-2 text-xs text-blue-600">
                  ✓ {t('employees.profile.details.qualifications.okayToContact')}: {exp.managerPhone}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* -------------------- MAIN (STATIC DATA) -------------------- */

export default function EmployeeQualifications({ employee, isLoading }) {
  const { t } = useTranslation();
  // Extract qualifications data from employee
  const qualifications = employee?.qualifications || {};
  
  // Process work experience
  const work = useMemo(() => {
    if (!qualifications.experiences?.length) return [];
    
    return qualifications.experiences.map(exp => ({
      title: exp.job_title || '',
      company: exp.company_name || '',
      type: exp.employment_type || '',
      start: exp.start_date ? new Date(exp.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '',
      end: exp.end_date ? new Date(exp.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : (exp.is_current ? t('employees.profile.details.qualifications.present') : ''),
      description: exp.key_responsibilities || '',
      salary: exp.salary || '',
      managerName: exp.manager_name || '',
      managerEmail: exp.manager_email || '',
      managerPhone: exp.manager_phone || '',
      okayToContact: exp.okay_to_contact || false,
    }));
  }, [qualifications.experiences, t]);

  // Process skills
  const hardSkills = useMemo(() => {
    if (!qualifications.skills?.length) return [];
    
    return qualifications.skills.map(skill => ({
      name: skill.name || '',
      stars: skill.level || 0,
    }));
  }, [qualifications.skills]);

  // Process languages
  const languages = useMemo(() => {
    if (!qualifications.languages?.length) return [];
    
    return qualifications.languages.map(lang => ({
      name: lang.language || '',
      level: lang.level || '',
    }));
  }, [qualifications.languages]);

  // Process education
  const educationPairs = useMemo(() => {
    if (!qualifications.educations?.length) return [];
    
    return qualifications.educations.map(edu => ({
      degree: edu.degree_level || '',
      institution: edu.institution || '',
      fieldOfStudy: edu.field_of_study || '',
      country: edu.institution_country || '',
      start: edu.start_date ? new Date(edu.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '',
      end: edu.end_date ? new Date(edu.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '',
      attachment: edu.education_attatchment || '',
    }));
  }, [qualifications.educations]);

  // Generate experience progress bars based on work experience count
  // const experience = useMemo(() => {
  //   const labels = [
  //     'Time Management',
  //     'Adaptability',
  //     'Critical Thinking',
  //     'Teamwork',
  //     'Communication',
  //     'Problem Solving',
  //     'Leadership',
  //     'Creativity',
  //   ];

  //   const values = [78, 62, 55, 70, 66, 58, 52, 73];

  //   return Array.from({ length: work.length }).map((_, i) => ({
  if (isLoading) {
    return <div className="space-y-5">{t('common.loading')}...</div>;
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Work Experience */}
        <Card className="rounded-xl border-slate-200">
          <CardHeader className="pb-2">
            <div className="text-2xl font-semibold text-black">
              {t('employees.profile.details.qualifications.workExperience')}
            </div>
          </CardHeader>
          <CardContent className="pt-1">
            {work.length > 0 ? (
              <Timeline items={work} />
            ) : (
              <EmptyState title={t('employees.profile.details.qualifications.noWorkExperience')} />
            )}
          </CardContent>
        </Card>

        {/* Skills */}
        <Card className="rounded-xl border-slate-200">
          <CardHeader className="pb-2">
           <div className="text-2xl font-semibold text-black">{t('employees.profile.details.qualifications.skills')}</div>
          </CardHeader>

          <CardContent className="space-y-4 pt-1">
            {/* Hard skills + stars */}
            {hardSkills.length > 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="space-y-2.5">
                  {hardSkills.map((skill, idx) => (
                    <div
                      key={`${skill.name}-${idx}`}
                      className="flex items-center justify-between gap-3"
                    >
                      <Badge
                        variant="outline"
                        className="rounded-md border-indigo-200 bg-indigo-50 px-2 py-1 text-xs font-medium text-primary"
                      >
                        {skill.name}
                      </Badge>
                      <Stars value={skill.stars} />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <EmptyState title={t('employees.profile.details.qualifications.noSkills')} />
              </div>
            )}

            {/* Language */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-2xl font-semibold text-black">{t('employees.profile.details.qualifications.language')}</div>
              {languages.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {languages.map((lang, idx) => (
                    <div key={`${lang.name}-${idx}`} className="flex items-center justify-between">
                      <div className="text-xs font-medium text-slate-700">{lang.name}</div>
                      <div className="text-xs text-slate-600">{lang.level}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-3">
                  <EmptyState title={t('employees.profile.details.qualifications.noLanguages')} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Education */}
      <div className="space-y-3">
        <div className="text-2xl font-semibold text-black">{t('employees.profile.details.qualifications.education')}</div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {educationPairs.length > 0 ? (
            educationPairs.map((edu, idx) => (
              <Card key={idx} className="rounded-xl border-slate-200">
                <CardContent className="p-4">
                  <div className="text-lg font-semibold text-primary">{edu.degree}</div>
                  <div className="mt-1 text-xs text-black font-bold">{edu.institution}</div>
                  {edu.fieldOfStudy && (
                    <div className="mt-1 text-xs text-gray">{edu.fieldOfStudy}</div>
                  )}

                  <div className="mt-3 flex items-center gap-2 text-xs text-gray">
                    <span>{edu.country}</span>
                    <span className="text-gray-300">|</span>
                    <span>
                      {edu.start} - {edu.end}
                    </span>
                  </div>

                  {edu.attachment && (
                    <div className="mt-3">
                      <a
                        href={edu.attachment.startsWith("http") ? edu.attachment : `/${edu.attachment}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        {t('employees.profile.details.qualifications.viewAttachment')}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-2">
              <EmptyState title={t('employees.profile.details.qualifications.noEducation')} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
