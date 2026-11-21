// src/features/employees/pages/PublicEmployeeFormPage.jsx
import React from 'react';
import { EmployeeFormDialog } from '@/features/employees/components/EmployeeFormDialog';

const PublicEmployeeFormPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      {/* You can actually remove this wrapper if you don't want a card *behind* the modal */}
      <div className="w-full max-w-3xl rounded-xl bg-white p-6 shadow-md">
        <h1 className="mb-4 text-xl font-semibold">Job Application Form</h1>

        {/*  Force dialog open */}
        <EmployeeFormDialog open={true} onOpenChange={() => {}} />
      </div>
    </div>
  );
};

export default PublicEmployeeFormPage;
