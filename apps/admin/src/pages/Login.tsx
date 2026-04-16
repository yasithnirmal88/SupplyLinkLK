import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ShieldAlert, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { auth } from '../lib/firebase';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoggingIn(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      // Backend roles are checked on subsequent API calls, 
      // but simple redirect to dashboard works here as initial step.
      navigate('/');
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Invalid credentials or unauthorized access.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-primary-green rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-900/40 mb-4 animate-bounce">
            <ShieldAlert size={32} color="white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">SupplyLink <span className="text-primary-green">Admin</span></h1>
          <p className="text-slate-400 mt-2">Internal team authentication required</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-8 rounded-3xl shadow-2xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  {...register('email')}
                  type="email"
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-green/50 placeholder:text-slate-600 transition-all"
                  placeholder="admin@supplylink.lk"
                />
              </div>
              {errors.email && <p className="text-rose-400 text-xs mt-2 ml-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  {...register('password')}
                  type="password"
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-green/50 placeholder:text-slate-600 transition-all"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="text-rose-400 text-xs mt-2 ml-1">{errors.password.message}</p>}
            </div>

            {error && (
              <div className="bg-rose-400/10 border border-rose-400/20 p-4 rounded-xl flex gap-3 text-rose-400 text-sm">
                <ShieldAlert size={20} />
                <p>{error}</p>
              </div>
            )}

            <button
              disabled={isLoggingIn}
              type="submit"
              className="w-full bg-primary-green hover:bg-emerald-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Panel</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-500 text-sm mt-8">
          System restricted to verified administrative staff. 
          <br /> All access attempts are logged and monitored.
        </p>
      </div>
    </div>
  );
}
