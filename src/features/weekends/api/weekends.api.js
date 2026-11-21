import axiosClient from '@/services/http/axiosClient';

function buildFallbackUrls(pathname) {
  const base = String(axiosClient.defaults.baseURL || '').replace(/\/+$/, '');
  if (!base) return [];

  const cleanPath = String(pathname || '').startsWith('/')
    ? String(pathname || '')
    : `/${pathname}`;

  const candidates = new Set();

  const add = (nextBase) => {
    const normalized = String(nextBase || '').replace(/\/+$/, '');
    if (!normalized || normalized === base) return;
    candidates.add(`${normalized}${cleanPath}`);
  };

  const replaceEnd = (pattern, replacement) => {
    const next = base.replace(pattern, replacement);
    if (next !== base) add(next);
  };

  try {
    const parsed = new URL(base);
    const origin = parsed.origin;
    const pathParts = parsed.pathname.split('/').filter(Boolean);
    const hasHrPrefix = pathParts[0] === 'hr';
    const hrPrefix = hasHrPrefix ? '/hr' : '';

    [
      `${origin}${hrPrefix}/api/hr/v2`,
      `${origin}${hrPrefix}/api/v2`,
      `${origin}${hrPrefix}/api/hr/v1`,
      `${origin}${hrPrefix}/api/v1`,
      `${origin}${hrPrefix}/api/hr`,
      `${origin}${hrPrefix}/api`,
      `${origin}/api/hr/v2`,
      `${origin}/api/v2`,
      `${origin}/api/hr/v1`,
      `${origin}/api/v1`,
      `${origin}/api/hr`,
      `${origin}/api`,
    ].forEach(add);
  } catch {
  }

  // Strip version suffixes first (some deployments don't version these routes)
  replaceEnd(/\/api\/hr\/v\d+$/i, '/api/hr');
  replaceEnd(/\/api\/v\d+$/i, '/api');

  // Try v2 variants
  replaceEnd(/\/api\/hr\/v\d+$/i, '/api/hr/v2');
  replaceEnd(/\/api\/hr\/v\d+$/i, '/api/v2');
  replaceEnd(/\/api\/hr\/v\d+$/i, '/api/hr/v1');
  replaceEnd(/\/api\/v\d+$/i, '/api/hr/v2');
  replaceEnd(/\/api\/v\d+$/i, '/api/hr');
  replaceEnd(/\/api\/v\d+$/i, '/api/hr/v1');

  replaceEnd(/\/api\/hr$/i, '/api/hr/v2');
  replaceEnd(/\/api\/hr$/i, '/api/v2');

  replaceEnd(/\/api$/i, '/api/hr/v2');
  replaceEnd(/\/api$/i, '/api/v2');

  return Array.from(candidates);
}

export const weekendsApi = {
  getAll: async (params = {}) => {
    const res = await axiosClient.get('/weekends', { params });
    return res.data;
  },

  create: async (payload) => {
    const res = await axiosClient.post('/weekends', payload, {
      headers: { 'Content-Type': 'application/json' },
    });
    return res.data;
  },

  update: async (id, payload) => {
    const res = await axiosClient.put(`/weekends/${id}`, payload, {
      headers: { 'Content-Type': 'application/json' },
    });
    return res.data;
  },

  removeEmployee: async ({ weekend_id, employee_id }) => {
    const path = `/weekends/${weekend_id}/employee`;
    const config = { data: { employee_id } };

    try {
      const res = await axiosClient.delete(path, config);
      return res.data;
    } catch (error) {
      // If 404, we don't need to try versioned fallback because backend does not define it
      if (error?.response?.status === 404) {
        throw new Error(`Route not found: ${path}`);
      }
      throw error;
    }
  },

  delete: async (id) => {
    const res = await axiosClient.delete(`/weekends/${id}`);
    return res.data;
  },
};
