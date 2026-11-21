// src/features/internships/schemas/internship.schema.js
import { z } from 'zod';
import { requiredString, email, phone, optionalString } from '@/lib/zodUtils';

/* ---------------------------------------------
  MAIN INTERNSHIP SCHEMA
--------------------------------------------- */
export const internshipSchema = z.object({
  id: z.number().optional(),
  
  // Personal Information
  first_name: requiredString,
  last_name: requiredString,
  email: email,
  phone: phone,
  national_id: optionalString,
  birth_date: optionalString,
  gender: optionalString,
  address: optionalString,
  
  // Internship Details
  position: requiredString,
  department: requiredString,
  branch_id: z.coerce.number().optional(),
  shift: optionalString,
  join_date: requiredString,
  end_date: optionalString,
  
  // University Information
  university: optionalString,
  faculty: optionalString,
  academic_year: optionalString,
  
  // Status
  is_active: z.boolean().default(true),
  
  // Additional Info
  notes: optionalString,
  emergency_contact_name: optionalString,
  emergency_contact_phone: phone.optional(),
});

export const internshipDefaultValues = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  national_id: '',
  birth_date: '',
  gender: '',
  address: '',
  position: '',
  department: '',
  branch_id: '',
  shift: '',
  join_date: '',
  end_date: '',
  university: '',
  faculty: '',
  academic_year: '',
  is_active: true,
  notes: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
};
