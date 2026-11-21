import { create } from 'zustand';

export const useBreadcrumbStore = create((set) => ({
  names: {},
  setName: (key, value) =>
    set((state) => ({
      names: {
        ...state.names,
        [key]: value,
      },
    })),
}));