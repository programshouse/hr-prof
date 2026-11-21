import axios from 'axios';
import i18n from '@/i18n';

const publicAxiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://system.profmse.com/api/integrations/hr/',
  withCredentials: false,
});

// 🌐 Add Accept-Language header for backend localization
publicAxiosClient.interceptors.request.use(
  (config) => {
    config.headers = config.headers || {};
    config.headers['Accept-Language'] = i18n.language;
    return config;
  },
  (error) => Promise.reject(error)
);

// IMPORTANT: no auth interceptors here
export default publicAxiosClient;
