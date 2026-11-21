import { z } from 'zod';

export const attendanceSchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
  date: z.date({
    required_error: 'Date is required',
  }),
  clockIn: z.string().min(1, 'Clock in time is required'),
  clockOut: z.string().min(1, 'Clock out time is required'),
  shift: z.string().optional(),
});
