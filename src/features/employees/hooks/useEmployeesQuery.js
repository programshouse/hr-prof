// src/features/employees/hooks/useEmployeesQuery.js

import { useQuery } from '@tanstack/react-query';
import axiosClient from '@/services/http/axiosClient';
import { buildAvatarUrl } from '@/lib/utils/avatarUtils';


// -------- Hooks --------


// List with backend pagination
export function useEmployeesQuery(filters = {}) {

  const page = filters.page ?? 1;

  const limit =
    filters.limit ??
    filters.pageSize ??
    10;



  return useQuery({

    queryKey: [
      'employees',
      {
        ...filters,
        page,
        limit,
      },
    ],


    queryFn: async () => {


      const params = {

        page,

        limit,


        // Search
        ...(filters.search
          ? {
              keyword: filters.search,
            }
          : {}),



        // Status
        ...(filters.status
          ? {
              status: filters.status,
            }
          : {}),



        // Company
        ...(filters.company_id
          ? {
              company_id: filters.company_id,
            }
          : {}),



        // Department
        ...(filters.department_id
          ? {
              department_id: filters.department_id,
            }
          : {}),



        // Position
        ...(filters.position_id
          ? {
              position_id: filters.position_id,
            }
          : {}),



        // Shift
        ...(filters.shift_id
          ? {
              shift_id: filters.shift_id,
            }
          : {}),



        // Branch
        ...(filters.branch_id
          ? {
              branch_id: filters.branch_id,
            }
          : {}),



        // Employment Type
        ...(filters.employment_type
          ? {
              'contract.type':
                filters.employment_type,
            }
          : {}),



        // Active only
        ...(filters.active_only
          ? {
              active_only:
                filters.active_only,
            }
          : {}),



        // =============================
        // Join Date Range Filter
        // =============================


        ...(filters.join_date_from
          ? {
              join_date_from:
                filters.join_date_from,
            }
          : {}),



        ...(filters.join_date_to
          ? {
              join_date_to:
                filters.join_date_to,
            }
          : {}),



        // =============================
        // End Date Range Filter
        // =============================


        ...(filters.end_date_from
          ? {
              end_date_from:
                filters.end_date_from,
            }
          : {}),



        ...(filters.end_date_to
          ? {
              end_date_to:
                filters.end_date_to,
            }
          : {}),


      };
      const res =
        await axiosClient.get(
          '/employees',
          {
            params,
          }
        );

      const payload =
        res.data || {};
      const rowsSource =
        Array.isArray(payload)

          ? payload

          : Array.isArray(payload.data)

            ? payload.data

            : Array.isArray(payload.data?.data)

              ? payload.data.data

              : [];



      const meta =
        payload.meta ||
        payload.data?.meta ||
        null;




      const rowsWithAvatars =
        rowsSource.map((emp) => ({

          ...emp,


          avatarUrl:
            buildAvatarUrl(
              emp.full_name || 'Employee',
              emp.image
            ),

        }));



      return {

        rows: rowsWithAvatars,


        meta:
          meta ||
          {

            current_page: page,

            per_page: limit,

            total:
              rowsSource.length,

            last_page: 1,

          },

      };

    },

  });

}





// Single employee
export function useEmployeeQuery(id) {

  return useQuery({

    queryKey: [
      'employee',
      id,
    ],


    enabled: !!id,


    queryFn: async () => {

      if (!id) return null;



      const res =
        await axiosClient.get(
          `/employees/${id}`
        );



      const apiEmp =
        res.data?.data ||
        res.data;



      const fullName =

        apiEmp.full_name ||

        apiEmp.applicant?.preferred_name ||

        `${apiEmp.applicant?.first_name || ''} ${apiEmp.applicant?.last_name || ''}`.trim() ||

        'Employee';




      return {

        ...apiEmp,


        avatarUrl:
          buildAvatarUrl(
            fullName,
            apiEmp.image ||
            apiEmp.applicant?.image
          ),

      };

    },

  });

}