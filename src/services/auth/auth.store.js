import { create } from 'zustand';
import { persist } from 'zustand/middleware';

function resolveUser(userData) {
  if (!userData) return null;
  if (typeof userData !== 'object') return { name: String(userData) };

  return (
    userData.hr ??
    userData.user ??
    userData.data?.hr ??
    userData.data?.user ??
    (userData.data && typeof userData.data === 'object' && !Array.isArray(userData.data)
      ? userData.data
      : null) ??
    userData
  );
}

function toBooleanFlag(value) {
  return value === true || value === 1 || value === '1' || value === 'true';
}

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      permissions: [],
      isAuthenticated: false,
      hasHydrated: false,
      authSource: null,
      role: null,
      jobRole: null,
      isManager: false,

      setAuth: (token, userData, source = 'login') => {
        const hr = resolveUser(userData) || { name: 'User' };
        // `role` reflects which portal was used to log in, not the employee's
        // job role. Employee managers still have role === 'employee'.
        const resolvedRole = source === 'employee-login' ? 'employee' : 'hr';
        const jobRole = hr?.role ?? null;
        const isManager = toBooleanFlag(hr?.is_manager);
        const isSuperAdmin = toBooleanFlag(
          hr?.is_super_admin ??
          userData?.is_super_admin ??
          userData?.data?.hr?.is_super_admin ??
          userData?.data?.is_super_admin
        );

        const rawPermissions =
          hr?.permissions ??
          userData?.permissions ??
          userData?.data?.permissions ??
          [];
        const permissions = Array.isArray(rawPermissions)
          ? rawPermissions
              .map((p) => (typeof p === 'string' ? p : p?.name || ''))
              .filter(Boolean)
          : [];

        const resolvedUser = {
          ...hr,
          is_super_admin: isSuperAdmin,
          permissions,
        };

        localStorage.setItem('accessToken', token);

        set({
          user: resolvedUser,
          accessToken: token,
          permissions,
          isAuthenticated: !!token,
          hasHydrated: true,
          authSource: source,
          role: resolvedRole,
          jobRole,
          isManager,
        });
      },

      setUser: (user) =>
        set((state) => {
          const isSuperAdmin = toBooleanFlag(
            user?.is_super_admin ?? state.user?.is_super_admin
          );
          const rawPerms =
            Array.isArray(user?.permissions) && user.permissions.length > 0
              ? user.permissions
              : state.permissions;
          const permissions = Array.isArray(rawPerms)
            ? rawPerms
                .map((p) => (typeof p === 'string' ? p : p?.name || ''))
                .filter(Boolean)
            : [];

          return {
            user: user
              ? {
                  ...user,
                  is_super_admin: isSuperAdmin,
                  permissions,
                }
              : null,
            isManager: toBooleanFlag(user?.is_manager),
            permissions,
          };
        }),

      clearAuth: () => {
        localStorage.removeItem('accessToken');

        set({
          user: null,
          accessToken: null,
          permissions: [],
          isAuthenticated: false,
          hasHydrated: true,
          authSource: null,
          role: null,
          jobRole: null,
          isManager: false,
        });
      },

      updateToken: (token) => {
        localStorage.setItem('accessToken', token);
        set({ accessToken: token, isAuthenticated: !!token });
      },

      markHydrated: () => set({ hasHydrated: true }),
    }),
    {
      name: 'auth-storage',
      merge: (persistedState, currentState) => {
        const merged =
          currentState.isAuthenticated && currentState.accessToken
            ? { ...currentState, hasHydrated: true }
            : { ...currentState, ...(persistedState || {}), hasHydrated: true };

        const user = merged?.user;
        const isSuperAdmin = toBooleanFlag(user?.is_super_admin);
        const rawPerms =
          Array.isArray(merged?.permissions) && merged.permissions.length > 0
            ? merged.permissions
            : Array.isArray(user?.permissions)
              ? user.permissions
              : [];
        const permissions = rawPerms
          .map((p) => (typeof p === 'string' ? p : p?.name || ''))
          .filter(Boolean);

        return {
          ...merged,
          user: user
            ? {
                ...user,
                is_super_admin: isSuperAdmin,
                permissions,
              }
            : null,
          permissions,
          isManager: toBooleanFlag(user?.is_manager),
        };
      },
      onRehydrateStorage: () => () => {
        const state = useAuthStore.getState();
        useAuthStore.setState({
          hasHydrated: true,
          isManager: toBooleanFlag(state?.user?.is_manager),
        });
      },
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        permissions: state.permissions,
        isAuthenticated: state.isAuthenticated,
        authSource: state.authSource,
        role: state.role,
        jobRole: state.jobRole,
        isManager: state.isManager,
      }),
    }
  )
);
