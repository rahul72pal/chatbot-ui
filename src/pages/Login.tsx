import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api';
import { useToast } from '../hooks/useToast';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const toast = useToast();

  const loginMutation = useMutation({
    mutationFn: (payload: any) => authApi.login(payload),
    onSuccess: (data: any) => {
      localStorage.setItem('access_token', data.access_token);
      toast.success('Signed in successfully!', 'Welcome Back');
      navigate('/');
    },
    onError: (err: any) => {
      const msg = err.message || 'Invalid email or password. Please try again.';
      setErrorMsg(msg);
      toast.error(msg, 'Authentication Failed');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="bg-[#090D16] text-slate-100 font-sans min-h-screen w-full flex items-center justify-center p-4 antialiased relative overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 blur-3xl pointer-events-none -z-10" />

      <main className="w-full max-w-[420px] flex flex-col items-center">
        {/* Header */}
        <header className="flex flex-col items-center mb-8 w-full text-center">
          <div 
            onClick={() => navigate('/home')}
            className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-0.5 shadow-glow-md mb-4 cursor-pointer group"
          >
            <div className="w-full h-full bg-[#090D16] rounded-[14px] flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
          </div>
          <h1 className="font-display text-2xl font-bold text-white mb-1 tracking-tight">Welcome back</h1>
          <p className="text-xs text-slate-400">Sign in to your AI Chatbot SaaS platform.</p>
        </header>

        {/* Form Card */}
        <div className="w-full glass-card border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block" htmlFor="email">
                Work Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full text-xs text-white bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block" htmlFor="password">
                  Password
                </label>
                <a href="#" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs text-white bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl py-3.5 px-4 transition-all shadow-glow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loginMutation.isPending ? 'Logging in...' : 'Sign In'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center">
          <p className="text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-indigo-400 font-bold hover:underline">
              Sign Up Free
            </Link>
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Login;
