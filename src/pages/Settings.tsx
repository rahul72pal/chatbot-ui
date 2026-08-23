import React, { useState } from 'react';
import { Shield, Globe, Users, Save, Check } from 'lucide-react';
import { useToast } from '../hooks/useToast';

export const Settings: React.FC = () => {
  const toast = useToast();
  const [email, setEmail] = useState('alex.carter@company.com');
  const [whitelistDomain, setWhitelistDomain] = useState('yoursaas.com');
  const [domains, setDomains] = useState(['yoursaas.com', 'staging.yoursaas.com']);
  const [isSaved, setIsSaved] = useState(false);

  const handleAddDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whitelistDomain.trim()) return;
    if (!domains.includes(whitelistDomain)) {
      setDomains(prev => [...prev, whitelistDomain]);
      toast.success(`Domain ${whitelistDomain} added to CORS whitelist.`);
    }
    setWhitelistDomain('');
  };

  const handleDeleteDomain = (domain: string) => {
    setDomains(prev => prev.filter(d => d !== domain));
    toast.info(`Domain ${domain} removed.`);
  };

  const handleSaveSettings = () => {
    setIsSaved(true);
    toast.success('Workspace settings and domain CORS whitelists saved successfully!', 'Settings Saved');
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <header className="glass-card p-6 md:p-8 rounded-3xl border border-slate-800/80">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
            Security & Controls
          </span>
        </div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight">
          Workspace Settings (WIP)
        </h1>
        <p className="text-slate-400 text-xs md:text-sm mt-1">
          Configure domain CORS whitelists, account security, and team profile controls.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {/* Whitelist Domains */}
          <section className="glass-card p-6 md:p-8 rounded-3xl border border-slate-800/80 space-y-6">
            <h2 className="font-display font-bold text-base text-white flex items-center gap-2.5 border-b border-slate-800 pb-4">
              <Globe className="w-5 h-5 text-indigo-400" /> Whitelisted Domains (CORS Security)
            </h2>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              Whitelisting domains prevents external third parties from embedding your chatbot widget script on unverified websites.
            </p>

            <form onSubmit={handleAddDomain} className="flex gap-3">
              <input 
                type="text" 
                value={whitelistDomain}
                onChange={(e) => setWhitelistDomain(e.target.value)}
                placeholder="e.g. app.yoursaas.com"
                className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button 
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-glow-sm"
              >
                Add Domain
              </button>
            </form>

            <div className="space-y-2 mt-2">
              {domains.map((dom) => (
                <div key={dom} className="flex justify-between items-center p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs">
                  <span className="font-bold text-slate-200">{dom}</span>
                  <button 
                    onClick={() => handleDeleteDomain(dom)}
                    className="text-slate-400 hover:text-rose-400 text-[10px] font-bold uppercase tracking-wider transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Account Profile */}
          <section className="glass-card p-6 md:p-8 rounded-3xl border border-slate-800/80 space-y-6">
            <h2 className="font-display font-bold text-base text-white flex items-center gap-2.5 border-b border-slate-800 pb-4">
              <Users className="w-5 h-5 text-indigo-400" /> Profile Settings
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Full Name</label>
                <input 
                  type="text" 
                  defaultValue="Alex Carter"
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button 
                onClick={handleSaveSettings}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs py-2.5 px-6 rounded-xl flex items-center gap-2 transition-all shadow-glow-sm"
              >
                {isSaved ? (
                  <>Saved <Check className="w-4 h-4 text-emerald-300" /></>
                ) : (
                  <><Save className="w-4 h-4" /> Save Settings</>
                )}
              </button>
            </div>
          </section>
        </div>

        {/* Security Summary */}
        <aside className="space-y-6">
          <div className="glass-card p-6 rounded-3xl border border-slate-800/80 space-y-3 text-xs text-slate-300 leading-relaxed">
            <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" /> Security Standards
            </h3>
            <p>Your workspace communication is protected with TLS 1.3 encryption and 24-Hour TTL expiration for chat logs.</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Settings;
