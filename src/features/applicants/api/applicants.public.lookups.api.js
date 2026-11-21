import publicAxiosClient from '@/services/http/publicAxiosClient';

export const applicantsPublicLookupsApi = {
 getPositions: async (companyId) => {
    const res = await publicAxiosClient.get(
      '/public-positions',
      {
        params: {
          company_id: companyId,
        },
      }
    );

    return res.data;
  },



  getCountries: async () => {
    const res = await publicAxiosClient.get('/public-countries');
    return res.data; // [...] (your response is array)
  },

  getGovernoratesByCountry: async (countryId) => {
    if (!countryId) return [];
    const res = await publicAxiosClient.get(`/public-countries/${countryId}/governorates`);
    return res.data; // [...]
  },
};