import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUIStore = create(
  persist(
    (set) => ({
      sidebarOpen: true,
      sidebarCollapsed: false,
      viewMode: 'cards', // 'cards' | 'table' - Global view mode for any page with cards/table views

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      collapseSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setViewMode: (mode) => set({ viewMode: mode }),
    }),
    {
      name: 'ui-storage',
    }
  )
);
