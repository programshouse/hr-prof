import { z } from 'zod';

export const preprocessEmptyString = (value) => {
  if (value === '') return undefined;
  return value;
};

export const optionalString = z.string().optional().or(z.literal(''));

export const requiredString = z.string().min(1, 'This field is required');

export const email = z.string().email('Invalid email address');

export const phone = z.string().regex(/^[0-9+\-\s()]+$/, 'Invalid phone number');

export const positiveNumber = z.number().positive('Must be a positive number');

export const dateString = z.string().refine((val) => !isNaN(Date.parse(val)), {
  message: 'Invalid date',
});

export const fileSchema = z.object({
  name: z.string(),
  size: z.number(),
  type: z.string(),
});

export function createSelectSchema(options) {
  return z.enum(options, {
    errorMap: () => ({ message: 'Please select a valid option' }),
  });
}
