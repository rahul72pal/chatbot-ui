import React, { useState } from 'react';
import { Shield, Globe, Users, Save, Check } from 'lucide-react';
import { useToast } from '../hooks/useToast';

export const Settings: React.FC = () => {
  const toast = useToast();
  const [email, setEmail] = useState('rahul.pal@yourchatbot.com');
  const [name, setName] = useState('Rahul Pal');
  const [whitelistDomain, setWhitelistDomain] = useState('yoursaas.com');
  const [domains, setDomains] = useState(['yoursaas.com', 'staging.yoursaas.com']);
  const [isSaved, setIsSaved] = useState(false);

  const handleAddDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whitelistDomain.trim()) return;
    if (!domains.includes(whitelistDomain.trim())) {
      setDomains(prev => [...prev, whitelistDomain.trim()]);
      toast.success(`Domain ${whitelistDomain.trim()} added to CORS whitelist.`);
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
    <div className="space-y-6 max-w-5xl mx-auto pb-12 font-sans">
      {/* Header */}
      <header className="bg-[#0D1730] border border-[#1C2C4B] p-6 sm:p-7 rounded-2xl relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-600/15 via-purple-600/5 to-transparent blur-3xl pointer-events-none" />
        
        <div className="space-y-1.5 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#142342] border border-[#243653] text-[#C7D2FE] text-[11px] font-semibold">
              Security & Controls
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#F3F6FF] tracking-tight">
            Workspace Settings
          </h1>
          <p className="text-[#A3B3CF] text-xs sm:text-sm max-w-xl">
            Configure domain CORS whitelists, account profile details, and workspace security protocols.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Whitelist Domains */}
          <section className="bg-[#0D1730] border border-[#1C2C4B] p-6 sm:p-7 rounded-2xl shadow-xl space-y-5">
            <h2 className="font-display font-bold text-sm text-[#F3F6FF] flex items-center gap-2.5 border-b border-[#1C2C4B] pb-4">
              <Globe className="w-4 h-4 text-indigo-400" /> Whitelisted Domains (CORS Security)
            </h2>
            
            <p className="text-xs text-[#71829F] leading-relaxed">
              Whitelisting domains prevents external third parties from embedding your chatbot widget script on unverified websites.
            </p>

            <form onSubmit={handleAddDomain} className="flex gap-3">
              <input 
                type="text" 
                value={whitelistDomain}
                onChange={(e) => setWhitelistDomain(e.target.value)}
                placeholder="e.g. app.yoursaas.com"
                className="flex-1 bg-[#101D39] border border-[#1C2C4B] rounded-xl px-4 py-2.5 text-xs text-[#F3F6FF] placeholder-[#71829F] focus:outline-none focus:border-[#4F46E5]"
              />
              <button 
                type="submit"
                className="btn-primary-gradient px-4 py-2.5 rounded-xl text-xs font-semibold"
              >
                Add Domain
              </button>
            </form>

            <div className="space-y-2 mt-2">
              {domains.map((dom) => (
                <div key={dom} className="flex justify-between items-center p-3.5 bg-[#101D39] border border-[#1C2C4B] rounded-xl text-xs">
                  <span className="font-semibold text-[#F3F6FF]">{dom}</span>
                  <button 
                    onClick={() => handleDeleteDomain(dom)}
                    className="text-[#71829F] hover:text-[#FB7185] text-[10px] font-bold uppercase tracking-wider transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Account Profile */}
          <section className="bg-[#0D1730] border border-[#1C2C4B] p-6 sm:p-7 rounded-2xl shadow-xl space-y-5">
            <h2 className="font-display font-bold text-sm text-[#F3F6FF] flex items-center gap-2.5 border-b border-[#1C2C4B] pb-4">
              <Users className="w-4 h-4 text-indigo-400" /> Profile Settings
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#A3B3CF]">Full Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#101D39] border border-[#1C2C4B] rounded-xl px-4 py-2.5 text-xs text-[#F3F6FF] focus:outline-none focus:border-[#4F46E5]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#A3B3CF]">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#101D39] border border-[#1C2C4B] rounded-xl px-4 py-2.5 text-xs text-[#F3F6FF] focus:outline-none focus:border-[#4F46E5]"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#1C2C4B] flex justify-end">
              <button 
                onClick={handleSaveSettings}
                className="btn-primary-gradient px-6 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2"
              >
                {isSaved ? (
                  <>Saved <Check className="w-4 h-4 text-[#10D6A0]" /></>
                ) : (
                  <><Save className="w-4 h-4" /> Save Settings</>
                )}
              </button>
            </div>
          </section>
        </div>

        {/* Security Standards Summary */}
        <aside className="space-y-6">
          <div className="bg-[#0D1730] border border-[#1C2C4B] p-6 rounded-2xl shadow-xl space-y-3.5 text-xs text-[#A3B3CF] leading-relaxed">
            <h3 className="font-display font-bold text-sm text-[#F3F6FF] flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#10D6A0]" /> Security Standards
            </h3>
            <p>Your workspace communication is protected with TLS 1.3 encryption and 24-Hour TTL expiration for visitor chat logs.</p>
            <div className="p-3.5 bg-[#101D39] rounded-xl border border-[#1C2C4B] space-y-1.5">
              <p className="font-bold text-[#F3F6FF]">CORS Restrictions</p>
              <p className="text-[11px] text-[#71829F]">Only requests originating from verified whitelisted domain names are granted access to public widget streaming endpoints.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Settings;
