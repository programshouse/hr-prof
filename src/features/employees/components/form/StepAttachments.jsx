import React from 'react';
import { useTranslation } from 'react-i18next';
import StepSection from './StepSection';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/forms/Form';
import { Textarea } from '@/components/ui/textarea';

export default function StepAttachments() {
  const { t } = useTranslation();

  return (
    <StepSection title={t('applicants.steps.attachment')}>
      <div className="space-y-4">
        {/* CV / Resume */}
        <FormField name="cv" label={t('employees.form.cvResume')}>
          {({ field: { value, onChange, ...field } }) => {
            // Get file name from FileList or existing value
            const getFileName = () => {
              if (value instanceof FileList && value.length > 0) {
                return value[0].name;
              }
              if (value instanceof File) {
                return value.name;
              }
              if (value && typeof value === 'string') {
                // If it's a URL from the API, extract filename
                const parts = value.split('/');
                return parts[parts.length - 1];
              }
              return null;
            };

            const fileName = getFileName();
            const hasFile = value instanceof FileList || value instanceof File;
            const hasExistingFile = value && typeof value === 'string';

            return (
              <div className="space-y-2">
                <Input
                  {...field}
                  id="cv"
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="h-9 text-sm"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files && files.length > 0) {
                      const file = files[0];
                      const allowedTypes = [
                        'application/pdf',
                        'application/msword',
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                      ];
                      if (!allowedTypes.includes(file.type)) {
                        // Let validation handle the error
                        onChange(files);
                      } else {
                        onChange(files);
                      }
                    } else {
                      onChange(null);
                    }
                  }}
                />
                {hasFile && fileName && (
                  <p className="text-xs text-green-600">
                    <span className="font-medium">✓ {t('employees.form.fileAttached')}</span> {fileName}
                  </p>
                )}
                {!hasFile && hasExistingFile && fileName && (
                  <p className="text-xs text-blue-600">
                    <span className="font-medium">✓ {t('employees.form.previouslyUploaded')}</span> {fileName}
                  </p>
                )}
                {hasFile && (
                  <p className="text-xs text-slate-500 italic">
                    {t('employees.form.fileInputNote')}
                  </p>
                )}
              </div>
            );
          }}
        </FormField>

        {/* Cover Letter */}
        <FormField name="cover_letter" label={t('employees.form.coverLetter')}>
          {({ field }) => <Textarea {...field} id="cover_letter" rows={4} className="text-sm" />}
        </FormField>
      </div>
    </StepSection>
  );
}
