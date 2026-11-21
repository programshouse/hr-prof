
import { create } from 'zustand';
import { toast } from 'sonner';
import { queryClient } from '@/lib/react-query';
import { branchApi } from '@/features/settings/api/branch.api';
 
const getBranchName = (item) => {
  if (!item) return undefined;
  if (typeof item === 'string') return item;
  return item.name_en ?? item.name ?? item.title ?? item.branch_name;
};
 
// Pull an array of branches out of any cached response shape:
// [...], { data: [...] }, { data: { data: [...] } }, { branches: [...] }
const extractList = (cached) => {
  if (Array.isArray(cached)) return cached;
  if (Array.isArray(cached?.data)) return cached.data;
  if (Array.isArray(cached?.data?.data)) return cached.data.data;
  if (Array.isArray(cached?.branches)) return cached.branches;
  return [];
};
 
// Search EVERY cached query whose key starts with 'branches'
// (e.g. ['branches'], ['branches', params], ['branches', 'list']).
const getCachedBranches = () =>
  queryClient
    .getQueriesData({ queryKey: ['branches'] })
    .flatMap(([, cached]) => extractList(cached));
 
export const useBranchStore = create((_set, _get) => ({
  // data: { company_id, name_en, address_en, city_en, phones, lat, lng, allowed_radius }
  createBranch: async (data) => {
    if (!data || !data.name_en) return;
    try {
      await branchApi.createBranch(data);
      await queryClient.invalidateQueries({ queryKey: ['branches'] });
      toast.success('Branch created successfully');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to create branch';
      toast.error(msg);
      throw err;
    }
  },
 
  // PREFERRED: update by id (no name lookup, works even if names are duplicated).
  // data: { name_en, name_ar, lat, lng, allowed_radius, ... }
  updateBranch: async (id, data) => {
    if (!id || !data || !data.name_en) {
      toast.error('Branch id and name are required');
      throw new Error('Missing branch id or name');
    }
 
    try {
      await branchApi.updateBranch(id, data);
      await queryClient.invalidateQueries({ queryKey: ['branches'] });
      toast.success('Branch updated successfully');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to update branch';
      toast.error(msg);
      throw err;
    }
  },
 
  // Kept for backward compatibility. It used to return silently when the branch
  // was not found, so the modal looked like it saved but nothing was sent.
  updateBranchByName: async (oldName, data) => {
    if (!oldName || !data || !data.name_en) {
      toast.error('Branch name is required');
      throw new Error('Missing branch name');
    }
 
    const target = getCachedBranches().find((item) => getBranchName(item) === oldName);
 
    if (!target || !target.id) {
      toast.error('Branch not found');
      throw new Error('Branch not found');
    }
 
    try {
      await branchApi.updateBranch(target.id, data);
      await queryClient.invalidateQueries({ queryKey: ['branches'] });
      toast.success('Branch updated successfully');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to update branch';
      toast.error(msg);
      throw err;
    }
  },
 
  deleteBranchByName: async (name) => {
    if (!name) return;
 
    const target = getCachedBranches().find((item) => getBranchName(item) === name);
 
    if (!target || !target.id) {
      toast.error('Branch not found');
      return;
    }
 
    try {
      await branchApi.deleteBranch(target.id);
      await queryClient.invalidateQueries({ queryKey: ['branches'] });
      toast.success('Branch deleted successfully');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to delete branch';
      toast.error(msg);
      throw err;
    }
  },
}));