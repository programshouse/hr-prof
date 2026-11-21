// src/features/auth/SsoLogin.jsx
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/services/auth/auth.store';
import { authApi } from '@/services/auth/auth.api';

export default function SsoLogin() {
  const navigate = useNavigate();
  const { setAuth, isAuthenticated } = useAuthStore();
  const calledRef = useRef(false);

  useEffect(() => {
    // Prevent double-call in React StrictMode
    if (calledRef.current) return;
    calledRef.current = true;

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    // Already logged in with this same token — just go to dashboard
    if (isAuthenticated && localStorage.getItem('accessToken') === token) {
      navigate('/', { replace: true });
      return;
    }

    // Put the token in localStorage first so axiosClient picks it up
    localStorage.setItem('accessToken', token);

    // Fetch full user profile using the SSO token
    authApi
      .getCurrentUser()
      .then((data) => {
        setAuth(token, data, 'sso');
        navigate('/', { replace: true });
      })
      .catch(() => {
        // Token rejected by the API — clean up and redirect to login
        localStorage.removeItem('accessToken');
        navigate('/login', { replace: true });
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex min-h-screen items-center justify-center">
      <span className="text-muted-foreground text-sm">جارٍ تسجيل الدخول…</span>
    </div>
  );
}
