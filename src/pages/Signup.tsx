import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api';
import { useToast } from '../hooks/useToast';

export const Signup: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  const loginMutation = useMutation({
    mutationFn: (payload: any) => authApi.login(payload),
    onSuccess: (data: any) => {
      localStorage.setItem('access_token', data.access_token);
      queryClient.invalidateQueries({ queryKey: ['llmConfigs'] });
      toast.success('Account created! Please configure your LLM settings.', 'Welcome');
      navigate('/llm-setup');
    },
    onError: (err: any) => {
      const msg = err.message || 'Auto-login failed. Please try logging in manually.';
      setErrorMsg(msg);
      toast.error(msg, 'Login Failed');
    }
  });

  const signupMutation = useMutation({
    mutationFn: (payload: any) => authApi.signup(payload),
    onSuccess: () => {
      loginMutation.mutate({ email, password });
    },
    onError: (err: any) => {
      const msg = err.message || 'Signup failed. Please try again.';
      setErrorMsg(msg);
      toast.error(msg, 'Registration Failed');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    signupMutation.mutate({ name, email, password });
  };

  return (
    <div className="bg-[#090D16] text-slate-100 font-sans min-h-screen w-full flex items-center justify-center p-4 antialiased relative overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 blur-3xl pointer-events-none -z-10" />

      <main className="w-full max-w-[420px] flex flex-col items-center">
        {/* Header */}
        <header className="flex flex-col items-center mb-8 w-full text-center">
          <div 
            onClick={() => navigate('/')}
            className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-0.5 shadow-glow-md mb-4 cursor-pointer group"
          >
            <div className="w-full h-full bg-[#090D16] rounded-[14px] flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
          </div>
          <h1 className="font-display text-2xl font-bold text-white mb-1 tracking-tight">Create your account</h1>
          <p className="text-xs text-slate-400">Start building custom RAG AI chatbots in seconds.</p>
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
            {/* Name Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block" htmlFor="name">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Carter"
                className="w-full text-xs text-white bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500"
              />
            </div>

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
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
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

            {/* Terms checkbox */}
            <div className="flex items-start gap-2 pt-1">
              <input 
                id="terms" 
                type="checkbox" 
                required 
                className="mt-1 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="terms" className="text-xs text-slate-400 leading-tight">
                I agree to the{' '}
                <a href="#" className="text-indigo-400 hover:underline font-medium">Terms of Service</a> and{' '}
                <a href="#" className="text-indigo-400 hover:underline font-medium">Privacy Policy</a>.
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={signupMutation.isPending || loginMutation.isPending}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl py-3.5 px-4 transition-all shadow-glow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {signupMutation.isPending || loginMutation.isPending ? 'Creating Account...' : 'Get Started Free'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center">
          <p className="text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Signup;
