import { z } from 'zod';

export const exceptionSchema = z.object({
  employee_id: z.string().min(1, 'Employee is required'),
  date: z.string().min(1, 'Date is required'),
  from_time: z.string().min(1, 'From time is required'),
  to_time: z.string().min(1, 'To time is required'),
  reason: z.string().optional(),
});

export const createExceptionSchema = z.object({
  employee_ids: z.array(z.string()).min(1, 'At least one employee is required'),
  from_date: z.string().min(1, 'From date is required'),
  to_date: z.string().min(1, 'To date is required'),
  start_time: z.string().min(1, 'From time is required'),
  end_time: z.string().min(1, 'To time is required'),
  reason: z.string().optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
});

// ✅ Update: employee_ids optional for bulk editing, BUT from_date/to_date/start/end required
export const updateExceptionSchema = z.object({
  employee_ids: z.array(z.string()).optional(),
  from_date: z.string().min(1, 'From date is required'),
  to_date: z.string().min(1, 'To date is required'),
  start_time: z.string().min(1, 'From time is required'),
  end_time: z.string().min(1, 'To time is required'),
  reason: z.string().optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
});
