import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Users, KeyRound } from 'lucide-react';
import { useAllEmployees } from '@/shared/hooks';
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
import EmployeeCombobox from '@/components/ui/EmployeeCombobox';

const createSchema = z
  .object({
    employee_id: z.string().min(1, 'Employee is required'),
    username: z.string().min(1, 'User Name is required'),
    password: z.string().min(1, 'Password is required'),
    confirm_password: z.string().min(1, 'Confirm Password is required'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  });

const updateSchema = z
  .object({
    password: z.string().min(1, 'Password is required'),
    confirm_password: z.string().min(1, 'Confirm Password is required'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  });

export default function UserFormModal({
  open,
  onOpenChange,
  user,
  onSubmit,
  loading = false,
}) {
  const { t } = useTranslation();

  const { data: employeesResponse, isLoading: employeesLoading } = useAllEmployees();

  const employees = useMemo(() => {
    if (Array.isArray(employeesResponse)) return employeesResponse;
    if (Array.isArray(employeesResponse?.data)) return employeesResponse.data;
    if (Array.isArray(employeesResponse?.data?.data)) return employeesResponse.data.data;
    return [];
  }, [employeesResponse]);

  const isEdit = !!user;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const formatEmployeeLabel = (emp) => {
    const id = String(emp?.employee_id ?? emp?.id ?? '');

    const code = emp?.employee_code
      ? String(emp.employee_code)
      : emp?.employee_code === 0
        ? '0'
        : emp?.code
          ? String(emp.code)
          : '';

    const name =
      emp?.employee_name ||
      emp?.name ||
      emp?.full_name ||
      `${emp?.first_name || ''} ${emp?.last_name || ''}`.trim();

    if (code && name) return `${code} - ${name}`;
    return name || id || '';
  };

  const schema = useMemo(() => (isEdit ? updateSchema : createSchema), [isEdit]);

  const defaultValues = useMemo(() => {
    return {
      employee_id: String(user?.employee_id ?? user?.id ?? ''),
      username: isEdit ? user?.username || user?.login_id || '' : '',
      password: '',
      confirm_password: '',
    };
  }, [user, isEdit]);

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
    if (isEdit) {
      onSubmit?.({
        password: values.password.trim(),
        password_confirmation: values.confirm_password.trim(),
      });

      return;
    }

    onSubmit?.({
      employee_id: values.employee_id,
      login_id: values.username.trim(),
      username: values.username.trim(),
      password: values.password.trim(),
      password_confirmation: values.confirm_password.trim(),
    });
  };

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen) {
      setShowPassword(false);
      setShowConfirmPassword(false);
    }

    onOpenChange?.(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl rounded-[22px] p-0">
        <div className="p-6 md:p-8">
          <DialogHeader className="mb-6 space-y-1 text-left">
            <DialogTitle className="flex items-center gap-2 text-[20px] font-bold text-[#0f172a]">
              <Users className="h-5 w-5" />
              {isEdit ? t('users.resetPassword') : t('users.createAccount')}
            </DialogTitle>

            <p className="text-sm text-slate-500">
              {isEdit
                ? t('users.resetPasswordDescription')
                : t('users.createAccountDescription')}
            </p>
          </DialogHeader>

          {isEdit ? (
            <Form form={form} onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-4">
                <div className="rounded-lg bg-slate-50 p-4">
                  <h3 className="mb-2 text-sm font-medium text-slate-700">
                    {t('users.employeeInformation')}
                  </h3>

                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">
                        {t('tables.headers.name')}:
                      </span>{' '}
                      {formatEmployeeLabel(user)}
                    </p>

                    <p className="text-sm">
                      <span className="font-medium">
                        {t('tables.headers.userName')}:
                      </span>{' '}
                      {user?.username || user?.login_id || t('common.na')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <FormField name="password" label={t('forms.fields.newPassword')} required>
                    {({ field, error }) => (
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? 'text' : 'password'}
                          placeholder={t('forms.fields.newPassword')}
                          autoComplete="new-password"
                          className={error ? 'border-red-500 focus-visible:ring-red-500 pr-10' : 'pr-10'}
                        />

                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    )}
                  </FormField>

                  <FormField
                    name="confirm_password"
                    label={t('forms.fields.confirmPassword')}
                    required
                  >
                    {({ field, error }) => (
                      <div className="relative">
                        <Input
                          {...field}
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder={t('forms.fields.confirmPassword')}
                          autoComplete="new-password"
                          className={error ? 'border-red-500 focus-visible:ring-red-500 pr-10' : 'pr-10'}
                        />

                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((prev) => !prev)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    )}
                  </FormField>
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={loading}
                >
                  {t('common.cancel')}
                </Button>

                <Button
                  type="button"
                  disabled={loading}
                  className="min-w-[120px] bg-primary"
                  onClick={form.handleSubmit(handleSubmit)}
                >
                  <KeyRound className="mr-2 h-4 w-4" />
                  {loading ? t('common.loading') : t('users.resetPassword')}
                </Button>
              </DialogFooter>
            </Form>
          ) : (
            <Form form={form} onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-4">
                <FormField name="employee_id" label={t('users.selectEmployee')} required>
                  {({ field, error }) => (
                    <EmployeeCombobox
                      value={field.value}
                      onChange={field.onChange}
                      employees={employees}
                      loading={employeesLoading}
                      placeholder={t('users.selectEmployeePlaceholder')}
                      searchPlaceholder={t('users.searchEmployee')}
                      disabled={employeesLoading}
                      className={error ? 'border-red-500 focus-visible:ring-red-500' : ''}
                    />
                  )}
                </FormField>

                <FormField name="username" label={t('tables.headers.userName')} required>
                  {({ field, error }) => (
                    <Input
                      {...field}
                      placeholder={t('users.enterUserName')}
                      autoComplete="off"
                      className={error ? 'border-red-500 focus-visible:ring-red-500' : ''}
                    />
                  )}
                </FormField>

                <FormField name="password" label={t('forms.fields.password')} required>
                  {({ field, error }) => (
                    <div className="relative">
                      <Input
                        {...field}
                        type={showPassword ? 'text' : 'password'}
                        placeholder={t('forms.fields.password')}
                        autoComplete="new-password"
                        className={error ? 'border-red-500 focus-visible:ring-red-500 pr-10' : 'pr-10'}
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  )}
                </FormField>

                <FormField
                  name="confirm_password"
                  label={t('forms.fields.confirmPassword')}
                  required
                >
                  {({ field, error }) => (
                    <div className="relative">
                      <Input
                        {...field}
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder={t('forms.fields.confirmPassword')}
                        autoComplete="new-password"
                        className={error ? 'border-red-500 focus-visible:ring-red-500 pr-10' : 'pr-10'}
                      />

                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  )}
                </FormField>
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={loading}
                >
                  {t('common.cancel')}
                </Button>

                <Button
                  type="button"
                  disabled={loading}
                  className="min-w-[120px] bg-primary"
                  onClick={form.handleSubmit(handleSubmit)}
                >
                  <Users className="mr-2 h-4 w-4" />
                  {loading ? t('common.loading') : t('users.createUser')}
                </Button>
              </DialogFooter>
            </Form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}