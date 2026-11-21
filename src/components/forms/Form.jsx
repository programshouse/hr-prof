import * as React from 'react';
import { Controller, FormProvider, useFormContext } from 'react-hook-form';

export { FormProvider, useFormContext };

export function Form({ form, onSubmit, children, className }) {
  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={className}>
        {children}
      </form>
    </FormProvider>
  );
}

export function FormField({ name, label, description, children, required }) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const error = errors[name];

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <div className="space-y-1">
          {label && (
            <label htmlFor={name} className="text-sm font-medium block">
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </label>
          )}
          {children({ field })}
          {description && <p className="text-muted-foreground text-sm">{description}</p>}
          {error && <p className="text-destructive text-xs">{error.message}</p>}
        </div>
      )}
    />
  );
}

export function ErrorText({ name }) {
  const {
    formState: { errors },
  } = useFormContext();

  const error = errors[name];

  if (!error) return null;

  return <p className="text-destructive mt-1 text-sm">{error.message}</p>;
}
