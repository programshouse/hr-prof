import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField } from '@/components/forms/Form';
import { useTranslation } from 'react-i18next';

export default function AdminFormModal({
  open,
  onOpenChange,
  admin = null,
  onSubmit,
  loading = false,
}) {
  const { t, i18n } = useTranslation();
  const isEdit = !!admin;
  const [showPassword, setShowPassword] = useState(false);

  const isRTL = i18n.language === 'ar';

  const createSchema = useMemo(
    () =>
      z.object({
        name: z.string().min(1, t('validation.required')),
        email: z.string().min(1, t('validation.required')).email(t('validation.email')),
        password: z.string().min(1, t('validation.required')),
        is_super_admin: z.boolean().default(false),
      }),
    [t]
  );

  const updateSchema = useMemo(
    () =>
      z.object({
        name: z.string().min(1, t('validation.required')),
        email: z.string().min(1, t('validation.required')).email(t('validation.email')),
        password: z.string().optional(),
        is_super_admin: z.boolean().default(false),
      }),
    [t]
  );

  const schema = useMemo(
    () => (isEdit ? updateSchema : createSchema),
    [isEdit, updateSchema, createSchema]
  );

  const defaultValues = useMemo(
    () => ({
      name: admin?.name || '',
      email: admin?.email || '',
      password: '',
      is_super_admin: !!admin?.is_super_admin,
    }),
    [admin]
  );

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, open]);

  const handleSubmit = (values) => {
    const payload = {
      name: values.name.trim(),
      email: values.email.trim(),
      is_super_admin: values.is_super_admin ? 1 : 0,
    };

    if (isEdit) {
      if (values.password?.trim()) {
        payload.password = values.password.trim();
      }
    } else {
      payload.password = values.password.trim();
    }

    onSubmit?.(payload);
  };

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen) {
      setShowPassword(false);
    }

    onOpenChange?.(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        dir={isRTL ? 'rtl' : 'ltr'}
        className={`max-w-2xl rounded-[22px] p-0 ${isRTL ? 'text-right' : 'text-left'}`}
      >
        <div className="p-6 md:p-8">
        <DialogHeader
  className={`mb-6 space-y-1 ${
    isRTL ? 'items-end text-right' : 'items-start text-left'
  }`}
>
  <DialogTitle
    className={`w-full text-[20px] font-bold text-[#0f172a] ${
      isRTL ? 'text-right' : 'text-left'
    }`}
  >
    {isEdit ? t('admins.form.updateAdmin') : t('admins.form.addNew')}
  </DialogTitle>

  <p
    className={`w-full text-sm text-slate-500 ${
      isRTL ? 'text-right' : 'text-left'
    }`}
  >
    {isEdit
      ? t('admins.form.updateDescription')
      : t('admins.form.createDescription')}
  </p>
</DialogHeader>

          <Form form={form} onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-4">
              <FormField
                name="name"
                label={t('admins.form.name')}
                required
                className={isRTL ? '[&_label]:text-right text-right' : ''}
              >
                {({ field, error }) => (
                  <Input
                    {...field}
                    dir={isRTL ? 'rtl' : 'ltr'}
                    placeholder={t('admins.form.namePlaceholder')}
                    className={`${isRTL ? 'text-right' : 'text-left'} ${
                      error ? 'border-red-500 focus-visible:ring-red-500' : ''
                    }`}
                  />
                )}
              </FormField>

              <FormField
                name="email"
                label={t('admins.form.email')}
                required
                className={isRTL ? '[&_label]:text-right text-right' : ''}
              >
                {({ field, error }) => (
                  <Input
                    {...field}
                    type="email"
                    dir="ltr"
                    placeholder={t('admins.form.emailPlaceholder')}
                    className={`${isRTL ? 'text-right' : 'text-left'} ${
                      error ? 'border-red-500 focus-visible:ring-red-500' : ''
                    }`}
                  />
                )}
              </FormField>

              <FormField
                name="password"
                label={isEdit ? t('admins.form.keepCurrentPassword') : t('admins.form.password')}
                required={!isEdit}
                className={`md:col-span-2 ${isRTL ? '[&_label]:text-right text-right' : ''}`}
              >
                {({ field, error }) => (
                  <div className="relative">
                    <Input
                      {...field}
                      type={showPassword ? 'text' : 'password'}
                      dir={isRTL ? 'rtl' : 'ltr'}
                      placeholder={t('admins.form.passwordPlaceholder')}
                      className={`${isRTL ? 'pl-10 pr-3 text-right' : 'pr-10 text-left'} ${
                        error ? 'border-red-500 focus-visible:ring-red-500' : ''
                      }`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 ${
                        isRTL ? 'left-3' : 'right-3'
                      }`}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                )}
              </FormField>

              <FormField name="is_super_admin" className="md:col-span-2">
                {({ field }) => (
                  <div className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3">
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        checked={!!field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-slate-300 accent-indigo-600"
                      />

                      <div className={isRTL ? 'flex-1 text-right' : 'flex-1 text-left'}>
                        <div
                          className={`flex items-center gap-2 text-sm font-semibold text-slate-900 ${
                            isRTL ? 'justify-start' : ''
                          }`}
                        >
                          <ShieldCheck size={16} className="text-indigo-600" />
                          {t('admins.form.superAdmin')}
                        </div>

                        <p className="mt-1 text-xs text-slate-500">
                          {t('admins.form.superAdminDescription')}
                        </p>
                      </div>
                    </label>
                  </div>
                )}
              </FormField>
            </div>

            <DialogFooter className={`pt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={loading}
              >
                {t('admins.form.cancel')}
              </Button>

              <Button type="submit" disabled={loading} className="min-w-[120px] bg-primary">
                {loading ? t('admins.form.saving') : t('admins.form.save')}
              </Button>
            </DialogFooter>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}