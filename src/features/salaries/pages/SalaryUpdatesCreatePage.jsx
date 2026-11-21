import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { salariesApi } from '../api/salariesApi';
import { useAllEmployees } from '@/shared/hooks';
import DatePickerInput from '@/components/ui/date-picker-input';

const formSchema = z.object({
  employee_id: z.string().min(1, 'Employee is required'),
  effective_from: z.string().min(1, 'Effective From date is required'),
  salary_type: z.enum(['single', 'multi', 'range'], {
    required_error: 'Salary Type is required',
  }),
  base_salary: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'Base Salary must be a positive number',
  }),
  kpi: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'KPI must be a positive number',
  }).optional(),
  notes: z.string().optional(),
});

export default function SalaryUpdatesCreatePage() {
  const navigate = useNavigate();
  const { data: employees = [] } = useAllEmployees();
  
  const createMutation = useMutation({
    mutationFn: ({ data, employeeId }) => salariesApi.createSalaryChange(data, employeeId),
    onSuccess: (data) => {
      toast.success('Salary update created successfully');
      navigate('/salary-updates');
    },
    onError: (error) => {
      toast.error('Failed to create salary update');
      console.error('Create error:', error);
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employee_id: '',
      effective_from: '',
      salary_type: 'single',
      base_salary: '',
      kpi: '',
      notes: '',
    },
  });

  const salaryType = watch('salary_type');
  const selectedEmployee = watch('employee_id');

  const onSubmit = (data) => {
    const payload = {
      effective_from: data.effective_from,
      salary_type: data.salary_type,
      base_salary: Number(data.base_salary),
      kpi: data.kpi ? Number(data.kpi) : 0,
      notes: data.notes,
    };
    
    createMutation.mutate({ 
      data: payload, 
      employeeId: data.employee_id 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/salary-updates')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Salary Updates
        </Button>
      </div>
      
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Create New Salary Update</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Employee Selection */}
            <div className="space-y-2">
              <Label>Employee *</Label>
              <Select
                value={selectedEmployee}
                onValueChange={(value) => setValue('employee_id', value)}
              >
                <SelectTrigger className={errors.employee_id ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={String(employee.id)}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.employee_id && (
                <p className="text-sm text-red-500">{errors.employee_id.message}</p>
              )}
            </div>

            {/* Effective From */}
            <div className="space-y-2">
              <Label htmlFor="effective_from">Effective From *</Label>
              <DatePickerInput
                value={watch('effective_from') || ''}
                onChange={(v) => setValue('effective_from', v, { shouldValidate: true })}
                className={errors.effective_from ? '[&_input]:border-red-500' : ''}
              />
              {errors.effective_from && (
                <p className="text-sm text-red-500">{errors.effective_from.message}</p>
              )}
            </div>

            {/* Salary Type */}
            <div className="space-y-2">
              <Label>Salary Type *</Label>
              <Select
                value={salaryType}
                onValueChange={(value) => setValue('salary_type', value)}
              >
                <SelectTrigger className={errors.salary_type ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select salary type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="multi">Multi</SelectItem>
                  <SelectItem value="range">Range</SelectItem>
                </SelectContent>
              </Select>
              {errors.salary_type && (
                <p className="text-sm text-red-500">{errors.salary_type.message}</p>
              )}
            </div>

            {/* Base Salary */}
            <div className="space-y-2">
              <Label htmlFor="base_salary">Base Salary *</Label>
              <Input
                id="base_salary"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('base_salary')}
                className={errors.base_salary ? 'border-red-500' : ''}
              />
              {errors.base_salary && (
                <p className="text-sm text-red-500">{errors.base_salary.message}</p>
              )}
            </div>

            {/* KPI */}
            <div className="space-y-2">
              <Label htmlFor="kpi">KPI</Label>
              <Input
                id="kpi"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('kpi')}
                className={errors.kpi ? 'border-red-500' : ''}
              />
              {errors.kpi && (
                <p className="text-sm text-red-500">{errors.kpi.message}</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              rows={4}
              placeholder="Add any additional notes..."
              {...register('notes')}
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center gap-4 pt-4">
            <Button
              type="submit"
              disabled={createMutation.isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {createMutation.isLoading ? 'Creating...' : 'Create Salary Update'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/salary-updates')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
