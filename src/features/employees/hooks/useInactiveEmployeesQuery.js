// src/features/employees/hooks/useInactiveEmployeesQuery.js

import { useQuery } from '@tanstack/react-query';
import axiosClient from '@/services/http/axiosClient';
import { buildAvatarUrl } from '@/lib/utils/avatarUtils';


// List with backend pagination for inactive employees
// API returns:
// {
//   status,
//   data: [...],
//   meta: {
//      current_page,
//      last_page,
//      per_page,
//      total
//   }
// }

export function useInactiveEmployeesQuery(filters = {}) {

  const page = filters.page ?? 1;

  const limit =
    filters.limit ??
    filters.pageSize ??
    10;



  return useQuery({

    queryKey: [
      'inactive-employees',
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



        // =============================
        // Search
        // =============================

        ...(filters.search
          ? {
              keyword: filters.search,
            }
          : {}),




        // =============================
        // Status
        // =============================

        ...(filters.status
          ? {
              status: filters.status,
            }
          : {}),




        // =============================
        // Company
        // =============================

        ...(filters.company_id
          ? {
              company_id: filters.company_id,
            }
          : {}),




        // =============================
        // Department
        // =============================

        ...(filters.department_id
          ? {
              department_id: filters.department_id,
            }
          : {}),




        // =============================
        // Position
        // =============================

        ...(filters.position_id
          ? {
              position_id: filters.position_id,
            }
          : {}),




        // =============================
        // Shift
        // =============================

        ...(filters.shift_id
          ? {
              shift_id: filters.shift_id,
            }
          : {}),




        // =============================
        // Branch
        // =============================

        ...(filters.branch_id
          ? {
              branch_id: filters.branch_id,
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





      const res = await axiosClient.get(
        '/inactive-employees',
        {
          params,
        }
      );





      const payload =
        res.data || {};




      const rows =
        Array.isArray(payload.data)
          ? payload.data
          : Array.isArray(payload.data?.data)
            ? payload.data.data
            : [];





      const meta =
        payload.meta ||
        payload.data?.meta ||
        null;





      const rowsWithAvatars =
        rows.map(
          (emp) => ({

            ...emp,


            avatarUrl:
              buildAvatarUrl(
                emp.full_name || 'Employee',
                emp.image
              ),



            is_active: false,

          })
        );





      return {

        rows: rowsWithAvatars,



        meta:
          meta ||
          {

            current_page: page,

            per_page: limit,

            total:
              rows.length,

            last_page: 1,

          },

      };


    },


  });

}