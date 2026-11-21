// src/features/internships/hooks/useInternshipsQuery.js

import { useQuery } from '@tanstack/react-query';

import { internshipsApi } from '../api/internships.api';


export const useInternshipsQuery = (params = {}) => {

  return useQuery({

    queryKey: [
      'internships',
      params,
    ],


    queryFn: () =>
      internshipsApi.getInternships(params),



    select: (data) =>
      data,



    placeholderData: (previousData) =>
      previousData,


  });

};