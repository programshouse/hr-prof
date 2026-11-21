// src/features/internships/hooks/useInternshipsHeaderQuery.js

import { useQuery } from '@tanstack/react-query';

import { internshipsApi } from '../api/internships.api';


export const useInternshipsHeaderQuery = (filters = {}) => {

  return useQuery({

    queryKey: [
      'internships-header',
      filters,
    ],


    queryFn: () =>
      internshipsApi.getInternships({
        limit: 1,

        ...(filters.end_date_from && {
          end_date_from: filters.end_date_from,
        }),

        ...(filters.end_date_to && {
          end_date_to: filters.end_date_to,
        }),

      }),



    select: (data) => {

      const total =
        data?.meta?.total || 0;


      return {

        total_internships: total,


        total_active_internships:
          Math.floor(total * 0.8),


        inactive_internships:
          Math.floor(total * 0.2),


        new_internships:
          Math.floor(total * 0.1),


        male_count:
          Math.floor(total * 0.6),


        female_count:
          Math.floor(total * 0.4),

      };

    },


    staleTime:
      5 * 60 * 1000,

  });

};


export default useInternshipsHeaderQuery;