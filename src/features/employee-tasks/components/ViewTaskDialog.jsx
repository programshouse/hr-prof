import { forwardRef, useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  BarChart3,
  Calendar,
  ClipboardList,
  FileImage,
  Paperclip,
  RotateCw,
  User,
} from 'lucide-react';

const value = (v) => v || '—';

function getAttachmentUrl(task) {
  const candidates = [
    task?.attachment,
    task?.attachment_url,
    task?.file_url,
  ];

  for (const raw of candidates) {
    if (!raw) continue;
    if (typeof raw === 'string' && /^https?:\/\//i.test(raw.trim())) {
      return raw.trim();
    }
    if (typeof raw === 'object' && raw?.url && typeof raw.url === 'string') {
      return raw.url.trim();
    }
  }

  return null;
}

function getAttachmentLabel(task, url) {
  if (task?.attachment_name) return task.attachment_name;
  if (!url) return 'Attachment';
  try {
    const path = new URL(url).pathname;
    const segment = path.split('/').filter(Boolean).pop();
    return segment ? decodeURIComponent(segment) : 'Attachment';
  } catch {
    return 'Attachment';
  }
}

function isImageAttachmentUrl(url) {
  if (!url) return false;
  return /\.(jpe?g|png|gif|webp|bmp|svg)(\?.*)?$/i.test(url);
}

function formatDate(date) {
  if (!date) return '—';

  const d = new Date(date);

  if (Number.isNaN(d.getTime())) return date;

  return `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`;
}

function InfoRow({
  icon: Icon,
  label,
  value: itemValue,
  valueClassName = '',
}) {
  return (
    <div className="flex gap-3 border-b border-[#d5d5d5] pb-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] bg-[#f1f1f1]">
        <Icon className="h-5 w-5 text-black" />
      </div>

      <div className="pt-[2px]">
        <p className="text-[18px] font-bold leading-none text-[#111]">
          {label}
        </p>

        <p
          className={`mt-3 text-[15px] font-bold text-[#6f6f6f] ${valueClassName}`}
        >
          {value(itemValue)}
        </p>
      </div>
    </div>
  );
}

function SectionTitle({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-[#e8f0ff]">
        <Icon className="h-5 w-5 text-[#1e293b]" />
      </div>

      <h3 className="text-[20px] font-bold text-[#111]">{title}</h3>
    </div>
  );
}

const ViewTaskDialog = forwardRef(
  ({ open, onOpenChange, task, isLoading = false }, ref) => {
    const { t } = useTranslation();

    useImperativeHandle(ref, () => ({
      show: () => onOpenChange(true),
    }));

    const taskNumber = task?.task_number || task?.taskNumber || task?.id;

    const taskName =
      task?.task_name ||
      task?.taskName ||
      task?.name ||
      task?.title ||
      'Task Name';

    const employeeName =
      task?.employee_name ||
      task?.employee?.name ||
      task?.employee?.applicant?.full_name_ar ||
      task?.employee?.applicant?.first_name ||
      '—';

    const startDate = task?.start_date || task?.startDate;

    const endDate =
      task?.end_date ||
      task?.due_date ||
      task?.dueDate;

    const createdAt =
      task?.added_at ||
      task?.created_at ||
      task?.createdAt;

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[92vh] max-w-[610px] overflow-y-auto rounded-[14px] border-0 bg-[#eeeeee] p-0 shadow-none">
          <DialogTitle className="sr-only">{t('employees.tasksBoard.viewTaskDialog.title')}</DialogTitle>

          <div className="rounded-[14px] bg-[#eeeeee] px-4 py-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500" />

                <p className="ml-3 text-sm text-gray-600">
                  {t('employees.tasksBoard.viewTaskDialog.loading')}
                </p>
              </div>
            ) : !task ? (
              <div className="flex items-center justify-center py-10">
                <p className="text-sm font-semibold text-gray-500">
                  {t('employees.tasksBoard.viewTaskDialog.noTaskFound')}
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-[#e8f0ff]">
                      <ClipboardList className="h-5 w-5 text-[#1e293b]" />
                    </div>

                    <div>
                      <h2 className="text-[22px] font-bold leading-none text-[#111]">
                        {taskNumber}-{taskName}
                      </h2>

                      <p className="mt-2 text-[15px] font-bold text-[#6f6f6f]">
                        {t('employees.tasksBoard.viewTaskDialog.createdOn')} {formatDate(createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[7px] border border-[#d0d0d0] bg-white px-4 py-4">
                  <div className="grid grid-cols-1 gap-7 md:grid-cols-[1fr_1px_1fr]">
                    <div className="space-y-8">
                      <InfoRow
                        icon={User}
                        label={t('employees.tasksBoard.viewTaskDialog.employeeName')}
                        value={employeeName}
                      />

                      <InfoRow
                        icon={BarChart3}
                        label={t('employees.tasksBoard.viewTaskDialog.priority')}
                        value={task.priority || 'Urgent'}
                        valueClassName="!text-[#c0003a]"
                      />

                      <div className="flex gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] bg-[#f1f1f1]">
                          <RotateCw className="h-5 w-5 text-black" />
                        </div>

                        <div className="pt-[2px]">
                          <p className="text-[18px] font-bold leading-none text-[#111]">
                            {t('employees.tasksBoard.viewTaskDialog.status')}
                          </p>

                          <p className="mt-3 text-[15px] font-bold text-[#35b647]">
                            {value(task.status || 'Done')}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="hidden bg-[#d0d0d0] md:block" />

                    <div className="space-y-8">
                      <InfoRow
                        icon={Calendar}
                        label={t('employees.tasksBoard.viewTaskDialog.startDate')}
                        value={formatDate(startDate)}
                      />

                      <div className="flex gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] bg-[#f1f1f1]">
                          <Calendar className="h-5 w-5 text-black" />
                        </div>

                        <div className="pt-[2px]">
                          <p className="text-[18px] font-bold leading-none text-[#111]">
                            {t('employees.tasksBoard.viewTaskDialog.endDate')}
                          </p>

                          <p className="mt-3 text-[15px] font-bold text-[#6f6f6f]">
                            {formatDate(endDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-[7px] border border-[#d0d0d0] bg-white px-4 py-4">
                  <SectionTitle icon={ClipboardList} title={t('employees.tasksBoard.viewTaskDialog.description')} />

                  <p className="ml-[50px] mt-2 text-[13px] font-semibold leading-6 text-[#7b8494]">
                    {value(task.description)}
                  </p>
                </div>

                <div className="mt-6 rounded-[7px] border border-[#d0d0d0] bg-white px-4 py-4">
                  <SectionTitle icon={Paperclip} title={t('employees.tasksBoard.viewTaskDialog.attachment')} />

                  {(() => {
                    const attachmentUrl = getAttachmentUrl(task);
                    const label = getAttachmentLabel(task, attachmentUrl, t);
                    const showImage =
                      attachmentUrl && isImageAttachmentUrl(attachmentUrl);

                    if (attachmentUrl) {
                      return (
                        <div className="mt-4 space-y-4 rounded-[8px] border border-[#d9d9d9] bg-white p-4">
                          {showImage ? (
                            <a
                              href={attachmentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block overflow-hidden rounded-md border border-[#e5e5e5]"
                            >
                              <img
                                src={attachmentUrl}
                                alt={label}
                                className="mx-auto max-h-64 w-full object-contain"
                              />
                            </a>
                          ) : (
                            <div className="flex justify-center py-2">
                              <FileImage className="h-9 w-9 text-[#7b8494]" />
                            </div>
                          )}

                          <div className="text-center">
                            <a
                              href={attachmentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[15px] font-bold text-[#2563eb] underline decoration-[#2563eb] underline-offset-2 hover:text-[#1d4ed8]"
                            >
                              {label}
                            </a>

                            {task.attachment_size ? (
                              <p className="mt-2 text-[15px] font-semibold text-[#6f6f6f]">
                                {task.attachment_size}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      );
                    }

                    if (task?.attachment && !attachmentUrl) {
                      return (
                        <div className="mt-4 rounded-[8px] border border-[#d9d9d9] bg-white py-5 text-center">
                          <FileImage className="mx-auto h-9 w-9 text-[#7b8494]" />

                          <p className="mt-3 text-[15px] font-bold text-[#111]">
                            {typeof task.attachment === 'string'
                              ? task.attachment
                              : task.attachment_name || t('employees.tasksBoard.viewTaskDialog.attachment')}
                          </p>

                          {task.attachment_size ? (
                            <p className="mt-2 text-[18px] font-bold text-[#6f6f6f]">
                              {task.attachment_size}
                            </p>
                          ) : null}
                        </div>
                      );
                    }

                    return null;
                  })()}

                  {!getAttachmentUrl(task) && !task?.attachment && (
                    <div className="mt-4 rounded-[8px] border border-[#d9d9d9] bg-gray-50 py-5 text-center">
                      <Paperclip className="mx-auto h-9 w-9 text-[#d1d5db]" />

                      <p className="mt-3 text-[15px] font-bold text-[#9ca3af]">
                        {t('employees.tasksBoard.viewTaskDialog.noAttachmentFound')}
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

ViewTaskDialog.displayName = 'ViewTaskDialog';

export { ViewTaskDialog };