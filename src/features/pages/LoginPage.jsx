import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  ArrowLeft,
  Building2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  LogIn,
  Mail,
  UserRound,
} from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { toast } from 'sonner';

import { useAuthStore } from '@/services/auth/auth.store';
import { getDefaultAuthorizedRoute, toBooleanFlag } from '@/lib/permissions';
import { authApi } from '@/services/auth/auth.api';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const [type, setType] = useState('hr');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const schema = useMemo(() => {
    if (type === 'employee') {
      return z.object({
        login_id: z.string().min(1, 'Login ID is required'),
        password: z.string().min(6, 'Password is required'),
        license_code: z.string().min(1, 'License code is required'),
      });
    }

    return z.object({
      email: z.string().min(1, 'Email is required'),
      password: z.string().min(6, 'Password is required'),
      license_code: z.string().min(1, 'License code is required'),
    });
  }, [type]);

  const { register, handleSubmit, reset } = useForm({
    resolver: zodResolver(schema),
  });

  const chooseType = (value) => {
    setType(value);
    setError('');
    reset();
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError('');

      const payload =
        type === 'employee'
          ? {
              login_id: data.login_id,
              password: data.password,
              license_code: data.license_code,
            }
          : {
              email: data.email,
              password: data.password,
              licenseCode: data.license_code,
            };

      const response =
        type === 'employee'
          ? await authApi.employeeLogin(payload)
          : await authApi.login(payload);

      if (!response.status || !response.token) {
        throw new Error('Invalid login credentials');
      }

      const user = response.employee || response.data || response;
      const employeeId = user?.id ?? user?.employee_id ?? null;

      setAuth(
        response.token,
        user,
        type === 'employee' ? 'employee-login' : 'login'
      );

      toast.success('Login successful');

      if (type === 'employee' && employeeId) {
        navigate(`/employees/${employeeId}`, {
          replace: true,
        });
        return;
      }

      const targetPermissions =
        user?.permissions ??
        response?.data?.permissions ??
        response?.permissions ??
        [];
      const isSuper = toBooleanFlag(
        user?.is_super_admin ??
        user?.hr?.is_super_admin ??
        response?.data?.hr?.is_super_admin
      );
      const targetRoute = getDefaultAuthorizedRoute(targetPermissions, isSuper);

      navigate(targetRoute, {
        replace: true,
      });
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Login failed';

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <Card className="grid w-full max-w-5xl overflow-hidden rounded-3xl border bg-white shadow-xl md:grid-cols-2">
        {/* LEFT SIDE */}
       
<div className="flex flex-col items-center justify-center bg-slate-50 p-10">

  <img
    src="/nizam-logo.svg"
    alt="Nizam HR"
    className="mb-3 h-36 w-fit"
  />


  <h1 className="mb-3 text-center text-4xl font-bold text-slate-900">
    Welcome Back
  </h1>


  <p className="mb-10 text-center text-slate-500">
    Choose your portal to continue
  </p>



  <div className="w-full">
    
    <button
      onClick={() => chooseType("employee")}
      className={`
        my-4
        flex
        w-full
        items-center
        gap-4
        rounded-2xl
        border
        p-5
        transition

        ${
          type === "employee"
            ? "border-emerald-500 bg-emerald-50"
            : "border-slate-200 hover:bg-white"
        }
      `}
    >

      <div className="
        flex
        h-12
        w-12
        shrink-0
        items-center
        justify-center
        rounded-xl
        bg-emerald-100
        text-emerald-600
      ">
        <UserRound />
      </div>



      <div className="text-left">

        <h3 className="font-semibold text-slate-900">
          Employee Portal
        </h3>


        <p className="text-sm text-slate-500">
          Access requests and profile
        </p>

      </div>


    </button>

    <button
      onClick={() => chooseType("hr")}
      className={`
        flex
        w-full
        items-center
        gap-4
        rounded-2xl
        border
        p-5
        transition

        ${
          type === "hr"
            ? "border-blue-500 bg-blue-50"
            : "border-slate-200 hover:bg-white"
        }
      `}
    >

      <div className="
        flex
        h-12
        w-12
        shrink-0
        items-center
        justify-center
        rounded-xl
        bg-blue-100
        text-blue-600
      ">
        <Building2 />
      </div>


      <div className="text-left">

        <h3 className="font-semibold text-slate-900">
          HR Portal
        </h3>


        <p className="text-sm text-slate-500">
          Manage employees and organization
        </p>

      </div>


    </button>






  </div>





</div>
        {/* RIGHT SIDE */}
        <div className="flex flex-col justify-center p-10">
          {!type ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              Select portal to login
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <button
                type="button"
                onClick={() => chooseType(null)}
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
              >
               
              </button>

              <div>
                <h2 className="text-3xl font-bold text-slate-900">
                  {type === 'employee' ? 'Employee Login' : 'HR Login'}
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Enter your account details to continue
                </p>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-slate-700">
                  {type === 'employee' ? 'Login ID' : 'Email'}
                </label>

                <div className="relative mt-2">
                  {type === 'employee' ? (
                    <UserRound
                      size={18}
                      className="absolute left-3 top-3 text-slate-400"
                    />
                  ) : (
                    <Mail
                      size={18}
                      className="absolute left-3 top-3 text-slate-400"
                    />
                  )}

                  <Input
                    className="h-12 rounded-xl pl-10"
                    {...register(type === 'employee' ? 'login_id' : 'email')}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Password
                </label>

                <div className="relative mt-2">
                  <Lock
                    size={18}
                    className="absolute left-3 top-3 text-slate-400"
                  />

                  <Input
                    type={showPassword ? 'text' : 'password'}
                    className="h-12 rounded-xl pl-10 pr-10"
                    {...register('password')}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  License Code
                </label>

                <div className="relative mt-2">
                  <KeyRound
                    size={18}
                    className="absolute left-3 top-3 text-slate-400"
                  />

                  <Input
                    className="h-12 rounded-xl pl-10"
                    {...register('license_code')}
                  />
                </div>
              </div>

              <Button
                disabled={loading}
                className="h-12 w-full rounded-xl text-base font-semibold"
              >
                {loading ? (
                  'Signing in...'
                ) : (
                  <>
                    <LogIn size={18} className="mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
}