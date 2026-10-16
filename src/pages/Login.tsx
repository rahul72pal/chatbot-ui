import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, AlertCircle, Layers } from 'lucide-react';
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
      navigate('/dashboard');
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
    <div className="bg-[#070B14] text-[#F3F6FF] font-sans min-h-screen w-full flex items-center justify-center p-4 antialiased relative overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-600/15 via-purple-600/10 to-transparent blur-3xl pointer-events-none -z-10" />

      <main className="w-full max-w-[420px] flex flex-col items-center">
        {/* Header */}
        <header className="flex flex-col items-center mb-8 w-full text-center">
          <div 
            onClick={() => navigate('/')}
            className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-[1.5px] shadow-glow-indigo mb-4 cursor-pointer group"
          >
            <div className="w-full h-full bg-[#080E1B] rounded-[14px] flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
              <Layers className="w-6 h-6 text-indigo-400" />
            </div>
          </div>
          <h1 className="font-display text-2xl font-bold text-[#F3F6FF] mb-1 tracking-tight">Welcome back</h1>
          <p className="text-xs text-[#71829F]">Sign in to your AI Chatbot platform.</p>
        </header>

        {/* Form Card */}
        <div className="w-full bg-[#0D1730] border border-[#1C2C4B] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          {errorMsg && (
            <div className="p-3 bg-[#FB7185]/10 border border-[#FB7185]/30 text-[#FB7185] text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#71829F] uppercase tracking-wider block" htmlFor="email">
                Work Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full text-xs text-[#F3F6FF] bg-[#101D39] border border-[#1C2C4B] rounded-xl px-4 py-3 placeholder-[#71829F] focus:outline-none focus:border-[#4F46E5]"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-[#71829F] uppercase tracking-wider block" htmlFor="password">
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
                  className="w-full text-xs text-[#F3F6FF] bg-[#101D39] border border-[#1C2C4B] rounded-xl px-4 py-3 pr-10 placeholder-[#71829F] focus:outline-none focus:border-[#4F46E5]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#71829F] hover:text-[#F3F6FF] transition-colors"
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
                className="w-full btn-primary-gradient rounded-xl py-3 px-4 flex items-center justify-center gap-2 text-xs font-semibold disabled:opacity-50"
              >
                {loginMutation.isPending ? 'Logging in...' : 'Sign In'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center">
          <p className="text-xs text-[#71829F]">
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
