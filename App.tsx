
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { User, AuthState, FollowUp, Priority, Category, DashboardView, AutomationRule, Tone, Template } from './types';
import { Button } from './components/Button';
import { AIDraftModal } from './components/AIDraftModal';
import { databaseService } from './databaseService';

const DashboardContainer: React.FC<{ user: User | null; onLogout: () => void }> = ({ user, onLogout }) => {
  const [view, setView] = useState<DashboardView>('overview');
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  // Form States
  const [editingItem, setEditingItem] = useState<FollowUp | null>(null);
  const [selectedForAI, setSelectedForAI] = useState<FollowUp | null>(null);
  const [formData, setFormData] = useState({ title: '', recipient: '', platform: 'Email' as any, dueDate: '', priority: 'medium' as Priority });
  const [ruleData, setRuleData] = useState({ name: '', triggerDays: 3, tone: 'polite' as Tone });
  const [templateData, setTemplateData] = useState({ name: '', content: '', tone: 'professional' as Tone });

  // Settings
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [emailDigestEnabled, setEmailDigestEnabled] = useState(false);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        const [f, r, t] = await Promise.all([
          databaseService.getFollowUps(),
          databaseService.getRules(),
          databaseService.getTemplates()
        ]);
        setFollowUps(f);
        setRules(r);
        setTemplates(t);
      } catch (e) {
        console.error("Initialization failed", e);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const handleSaveFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const item: FollowUp = {
      id: editingItem?.id || Math.random().toString(36).substr(2, 9),
      ...formData,
      status: editingItem?.status || 'pending',
      category: 'Work',
      notes: '',
      createdAt: editingItem?.createdAt || new Date().toISOString()
    };
    await databaseService.saveFollowUp(item);
    setFollowUps(prev => editingItem ? prev.map(p => p.id === item.id ? item : p) : [item, ...prev]);
    setIsModalOpen(false);
  };

  const handleDeleteFollowUp = async (id: string) => {
    if (!confirm('Permanently delete this follow-up?')) return;
    await databaseService.deleteFollowUp(id);
    setFollowUps(prev => prev.filter(f => f.id !== id));
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    const rule: AutomationRule = { id: Math.random().toString(36).substr(2, 9), ...ruleData, enabled: true };
    await databaseService.saveRule(rule);
    setRules(prev => [rule, ...prev]);
    setIsRuleModalOpen(false);
    setRuleData({ name: '', triggerDays: 3, tone: 'polite' });
  };

  const handleDeleteRule = async (id: string) => {
    if (!confirm('Delete this automation rule?')) return;
    await databaseService.deleteRule(id);
    setRules(prev => prev.filter(r => r.id !== id));
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    const template: Template = { id: Math.random().toString(36).substr(2, 9), ...templateData };
    await databaseService.saveTemplate(template);
    setTemplates(prev => [template, ...prev]);
    setIsTemplateModalOpen(false);
    setTemplateData({ name: '', content: '', tone: 'professional' });
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Delete this template?')) return;
    await databaseService.deleteTemplate(id);
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  const handleClearData = async () => {
    if (!confirm('CRITICAL: This will erase all your local data forever. Continue?')) return;
    await databaseService.clearAll();
    window.location.reload();
  };

  const handleExportData = async () => {
    const data = await databaseService.exportAll();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `noreply-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderContent = () => {
    if (isLoading) return <div className="p-20 text-center font-black animate-pulse text-slate-300">CALIBRATING DASHBOARD...</div>;

    switch (view) {
      case 'overview':
        return (
          <div className="space-y-10">
            <header className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">System Status: Online</h1>
                <p className="text-slate-500 font-medium">Monitoring {followUps.length} outreach points for {user?.name}.</p>
              </div>
              <Button onClick={() => { setEditingItem(null); setFormData({ title: '', recipient: '', platform: 'Email', dueDate: '', priority: 'medium' }); setIsModalOpen(true); }} className="rounded-2xl h-14 px-8 shadow-xl shadow-indigo-100">Add New Track</Button>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white shadow-2xl lg:col-span-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full"></div>
                <h3 className="text-3xl font-black mb-4 tracking-tighter italic">Pipeline Efficiency: 98.4%</h3>
                <p className="text-slate-400 mb-10 max-w-md font-medium">Your automated rules are currently monitoring silence. Persistence is active across all platforms.</p>
                <div className="flex gap-4">
                  <Button onClick={() => setView('pipeline')} className="bg-indigo-600 hover:bg-indigo-500">View Pipeline</Button>
                  <Button variant="ghost" onClick={() => setView('automations')} className="text-white hover:bg-white/10">Manage Rules</Button>
                </div>
              </div>
              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 flex flex-col items-center justify-center text-center shadow-sm">
                <div className="w-16 h-16 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center text-2xl mb-4 border border-green-100"><i className="fa-solid fa-bolt"></i></div>
                <h4 className="text-xl font-black text-slate-900 mb-1">Active Flows</h4>
                <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">{rules.filter(r => r.enabled).length} Enabled</p>
              </div>
            </div>
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
               <h3 className="text-xl font-black mb-6">Recent Pending Actions</h3>
               <div className="space-y-3">
                 {followUps.filter(f => f.status === 'pending').slice(0, 5).map(f => (
                   <div key={f.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl hover:bg-white border border-transparent hover:border-indigo-100 transition-all">
                      <div className="flex items-center gap-4">
                         <div className={`w-3 h-3 rounded-full ${f.priority === 'high' ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]' : 'bg-slate-300'}`}></div>
                         <div><p className="font-black text-slate-800 leading-tight">{f.title}</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{f.recipient}</p></div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => { setSelectedForAI(f); setIsAIModalOpen(true); }} className="rounded-xl border-slate-200 text-indigo-600">Draft AI</Button>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        );
      case 'pipeline':
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black tracking-tight">Outreach Pipeline</h2>
              <Button onClick={() => { setEditingItem(null); setFormData({ title: '', recipient: '', platform: 'Email', dueDate: '', priority: 'medium' }); setIsModalOpen(true); }}>Add Track</Button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {followUps.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-[3rem] text-slate-300 font-black uppercase tracking-widest">No active tracking entries</div>
              ) : (
                followUps.map(f => (
                  <div key={f.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm hover:border-indigo-100 transition-all group">
                    <div className="flex items-center gap-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-inner ${f.status === 'completed' ? 'bg-green-50 text-green-500' : 'bg-slate-50 text-slate-300'}`}><i className={`fa-solid ${f.status === 'completed' ? 'fa-check' : 'fa-hourglass'}`}></i></div>
                      <div>
                        <h4 className="font-black text-xl text-slate-900 leading-none mb-1">{f.title}</h4>
                        <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest">{f.recipient} • {f.platform}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => { setEditingItem(f); setFormData({...f}); setIsModalOpen(true); }} className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 transition-all"><i className="fa-solid fa-pen"></i></button>
                      <button onClick={() => handleDeleteFollowUp(f.id)} className="w-10 h-10 rounded-xl bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"><i className="fa-solid fa-trash-can"></i></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      case 'automations':
        return (
          <div className="space-y-10">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black">Strategic Flows</h2>
              <Button onClick={() => setIsRuleModalOpen(true)}>Create New Flow</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rules.map(r => (
                <div key={r.id} className={`p-10 rounded-[3rem] border transition-all ${r.enabled ? 'bg-white border-indigo-100 shadow-xl' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                   <div className="flex justify-between items-start mb-6">
                      <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-xl shadow-sm"><i className="fa-solid fa-bolt-lightning"></i></div>
                      <button onClick={() => handleDeleteRule(r.id)} className="text-slate-300 hover:text-red-500 transition-all"><i className="fa-solid fa-trash-can"></i></button>
                   </div>
                   <h4 className="text-2xl font-black text-slate-900 mb-2">{r.name}</h4>
                   <p className="text-slate-500 font-medium mb-8">Triggers after <span className="text-slate-900 font-black">{r.triggerDays} days</span> of silence using <span className="text-indigo-600 font-black uppercase text-xs">{r.tone}</span> tone.</p>
                   <Button variant="outline" className="w-full rounded-2xl font-black py-4">Manage Ruleset</Button>
                </div>
              ))}
            </div>
          </div>
        );
      case 'templates':
        return (
          <div className="space-y-10">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black">Message Templates</h2>
              <Button onClick={() => setIsTemplateModalOpen(true)}>New Template</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {templates.map(t => (
                <div key={t.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 flex flex-col justify-between shadow-sm hover:border-indigo-100 transition-all">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                       <h4 className="font-black text-xl text-slate-900">{t.name}</h4>
                       <button onClick={() => handleDeleteTemplate(t.id)} className="text-slate-200 hover:text-red-400"><i className="fa-solid fa-xmark"></i></button>
                    </div>
                    <p className="text-slate-500 italic text-sm mb-10 leading-relaxed font-medium">"{t.content}"</p>
                  </div>
                  <Button variant="outline" className="w-full rounded-2xl py-4" onClick={() => { navigator.clipboard.writeText(t.content); alert('Template copied to clipboard!'); }}>Copy Content</Button>
                </div>
              ))}
            </div>
          </div>
        );
      case 'insights':
        return (
          <div className="space-y-10">
            <h2 className="text-3xl font-black">Outreach Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Volume', value: followUps.length, color: 'text-slate-900', icon: 'fa-chart-simple' },
                { label: 'Pending Response', value: followUps.filter(f => f.status === 'pending').length, color: 'text-indigo-600', icon: 'fa-clock' },
                { label: 'Conversions', value: followUps.filter(f => f.status === 'completed').length, color: 'text-green-500', icon: 'fa-check-double' },
                { label: 'Success Rate', value: followUps.length ? Math.round((followUps.filter(f => f.status === 'completed').length / followUps.length) * 100) + '%' : '0%', color: 'text-slate-900', icon: 'fa-percent' }
              ].map((s, i) => (
                <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                   <div className="flex items-center gap-3 mb-4 text-slate-300"><i className={`fa-solid ${s.icon} text-xs`}></i><span className="text-[10px] font-black uppercase tracking-widest">{s.label}</span></div>
                   <div className={`text-4xl font-black ${s.color}`}>{s.value}</div>
                </div>
              ))}
            </div>
            <div className="bg-slate-900 p-12 rounded-[4rem] text-white flex flex-col md:flex-row items-center gap-12">
               <div className="flex-1 space-y-4">
                  <h3 className="text-4xl font-black tracking-tighter">Gemini Optimization <br/> is currently Active.</h3>
                  <p className="text-slate-400 font-medium">Your tone is being automatically adjusted based on previous outreach response patterns. Keep tracking to improve accuracy.</p>
               </div>
               <div className="w-64 h-64 bg-indigo-600 rounded-full flex items-center justify-center border-[24px] border-slate-800 shadow-2xl relative">
                  <span className="text-4xl font-black">92%</span>
                  <div className="absolute -bottom-4 bg-white text-indigo-600 px-4 py-1 rounded-full font-black text-xs shadow-xl uppercase">Health Score</div>
               </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="max-w-3xl space-y-10 pb-20">
            <h2 className="text-3xl font-black tracking-tight">System Settings</h2>
            <section className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 space-y-8">
               <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem]">
                 <div><p className="font-black text-slate-900 text-lg">Push Reminders</p><p className="text-sm text-slate-400 font-medium italic">Instant browser alerts for actions.</p></div>
                 <button onClick={() => setNotifEnabled(!notifEnabled)} className={`w-14 h-8 rounded-full relative transition-all ${notifEnabled ? 'bg-indigo-600' : 'bg-slate-300'}`}><div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${notifEnabled ? 'right-1' : 'left-1'}`}></div></button>
               </div>
               <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem]">
                 <div><p className="font-black text-slate-900 text-lg">Daily Email Digest</p><p className="text-sm text-slate-400 font-medium italic">Morning summary of conversion stats.</p></div>
                 <button onClick={() => setEmailDigestEnabled(!emailDigestEnabled)} className={`w-14 h-8 rounded-full relative transition-all ${emailDigestEnabled ? 'bg-indigo-600' : 'bg-slate-300'}`}><div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${emailDigestEnabled ? 'right-1' : 'left-1'}`}></div></button>
               </div>
            </section>
            
            <section className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
              <h3 className="text-xl font-black text-red-500 mb-8 px-2">Data Governance</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button variant="outline" className="py-5 rounded-2xl font-black border-red-100 text-red-500 hover:bg-red-50" onClick={handleClearData}>Purge Local Database</Button>
                <Button variant="outline" className="py-5 rounded-2xl font-black" onClick={handleExportData}>Download Backup (.JSON)</Button>
              </div>
            </section>
            <Button variant="danger" className="w-full py-6 rounded-[2.5rem] text-xl font-black shadow-2xl shadow-red-100" onClick={onLogout}>Sign Out of NoReply</Button>
          </div>
        );
      default: return <div className="p-20 text-center font-black text-slate-300 uppercase tracking-[0.5em]">View Layer Invalid</div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 bg-slate-900 p-6 flex flex-col h-screen sticky top-0 shrink-0 z-50">
        <div className="flex items-center gap-3 mb-12 px-4">
           <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl"><i className="fa-solid fa-paper-plane"></i></div>
           <span className="text-2xl font-black text-white italic tracking-tighter">NoReply</span>
        </div>
        <nav className="flex-1 space-y-2">
          {(['overview', 'pipeline', 'automations', 'templates', 'insights', 'settings'] as DashboardView[]).map(v => (
            <button key={v} onClick={() => setView(v)} className={`w-full text-left px-6 py-4 rounded-2xl font-black capitalize transition-all text-sm tracking-wide ${view === v ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/40 translate-x-1' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}>{v}</button>
          ))}
        </nav>
        <div className="p-4 bg-slate-800/40 rounded-3xl mt-auto">
           <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Authenticated</p>
           <p className="text-white font-bold truncate text-sm">{user?.name}</p>
        </div>
      </aside>
      <main className="flex-1 p-6 lg:p-14 overflow-y-auto max-h-screen custom-scrollbar relative">
        <div className="max-w-5xl mx-auto">{renderContent()}</div>
      </main>

      {/* FLOW MODAL */}
      {isRuleModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
           <form onSubmit={handleSaveRule} className="bg-white p-12 rounded-[4rem] max-w-xl w-full space-y-8 animate-in zoom-in-95 shadow-2xl">
              <div className="flex justify-between items-center">
                 <h2 className="text-3xl font-black text-slate-900">Configure Flow</h2>
                 <button type="button" onClick={() => setIsRuleModalOpen(false)} className="w-12 h-12 rounded-full hover:bg-slate-50 text-slate-400"><i className="fa-solid fa-xmark text-xl"></i></button>
              </div>
              <div className="space-y-6">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Rule Label</label>
                    <input required placeholder="Investor Silence Rule" className="w-full px-8 py-5 rounded-3xl bg-slate-50 font-bold border-none focus:ring-4 focus:ring-indigo-100 outline-none" value={ruleData.name} onChange={e => setRuleData({...ruleData, name: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Silence Threshold (Days)</label>
                       <input required type="number" className="w-full px-8 py-5 rounded-3xl bg-slate-50 font-bold border-none focus:ring-4 focus:ring-indigo-100 outline-none" value={ruleData.triggerDays} onChange={e => setRuleData({...ruleData, triggerDays: parseInt(e.target.value)})} />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Strategic Tone</label>
                       <select className="w-full px-8 py-5 rounded-3xl bg-slate-50 font-bold border-none focus:ring-4 focus:ring-indigo-100 outline-none appearance-none" value={ruleData.tone} onChange={e => setRuleData({...ruleData, tone: e.target.value as Tone})}><option value="polite">Polite</option><option value="professional">Professional</option><option value="urgent">Urgent</option><option value="casual">Casual</option></select>
                    </div>
                 </div>
              </div>
              <Button className="w-full py-6 rounded-3xl text-xl font-black shadow-2xl shadow-indigo-100">Activate Flow</Button>
           </form>
        </div>
      )}

      {/* TRACKING MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
          <form onSubmit={handleSaveFollowUp} className="bg-white p-12 rounded-[4rem] max-w-xl w-full space-y-8 animate-in zoom-in-95 shadow-2xl border border-white">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{editingItem ? 'Edit Track' : 'Initialize Tracking'}</h2>
            <div className="space-y-4">
               <input required placeholder="Outreach Subject" className="w-full px-8 py-5 rounded-3xl bg-slate-50 font-bold border-none outline-none focus:ring-4 focus:ring-indigo-100" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
               <input required placeholder="Recipient Name" className="w-full px-8 py-5 rounded-3xl bg-slate-50 font-bold border-none outline-none focus:ring-4 focus:ring-indigo-100" value={formData.recipient} onChange={e => setFormData({...formData, recipient: e.target.value})} />
               <div className="grid grid-cols-2 gap-4">
                  <input required type="date" className="w-full px-8 py-5 rounded-3xl bg-slate-50 font-bold border-none outline-none focus:ring-4 focus:ring-indigo-100" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
                  <select className="w-full px-8 py-5 rounded-3xl bg-slate-50 font-bold border-none outline-none focus:ring-4 focus:ring-indigo-100" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value as any})}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select>
               </div>
            </div>
            <Button className="w-full py-6 rounded-3xl text-xl font-black shadow-2xl shadow-indigo-100">Secure Entry</Button>
            <Button variant="ghost" className="w-full" onClick={() => setIsModalOpen(false)}>Abort</Button>
          </form>
        </div>
      )}

      {/* TEMPLATE MODAL */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
           <form onSubmit={handleSaveTemplate} className="bg-white p-12 rounded-[4rem] max-w-2xl w-full space-y-8 animate-in zoom-in-95 shadow-2xl">
              <h2 className="text-3xl font-black">Design Template</h2>
              <div className="space-y-6">
                 <input required placeholder="Internal Template Name" className="w-full px-8 py-5 rounded-3xl bg-slate-50 font-bold border-none outline-none focus:ring-4 focus:ring-indigo-100" value={templateData.name} onChange={e => setTemplateData({...templateData, name: e.target.value})} />
                 <textarea required placeholder="Message content (use [Name] for dynamic placeholder)..." rows={6} className="w-full px-8 py-6 rounded-3xl bg-slate-50 font-bold border-none outline-none focus:ring-4 focus:ring-indigo-100 resize-none" value={templateData.content} onChange={e => setTemplateData({...templateData, content: e.target.value})} />
              </div>
              <Button className="w-full py-6 rounded-3xl text-xl font-black shadow-2xl shadow-indigo-100">Commit Template</Button>
              <Button variant="ghost" className="w-full" onClick={() => setIsTemplateModalOpen(false)}>Discard</Button>
           </form>
        </div>
      )}

      <AIDraftModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} recipientName={selectedForAI?.recipient || 'Contact'} initialContext={selectedForAI ? `${selectedForAI.title}` : ''} />
    </div>
  );
};

const LandingPage: React.FC = () => (
  <div className="min-h-screen bg-white">
    <nav className="p-10 flex justify-between items-center max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
         <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white"><i className="fa-solid fa-paper-plane"></i></div>
         <span className="text-2xl font-black italic tracking-tighter">NoReply</span>
      </div>
      <Link to="/login"><Button variant="outline" className="rounded-2xl px-8 border-2 font-black">Secure Sign In</Button></Link>
    </nav>
    <section className="pt-32 pb-40 text-center max-w-4xl mx-auto px-6 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-indigo-50/40 rounded-full blur-[120px] -z-10"></div>
      <h1 className="text-8xl md:text-[10rem] font-black tracking-tighter mb-10 leading-[0.85] animate-in slide-in-from-bottom-12 duration-700">Persistence <br/> as a <br/> <span className="text-indigo-600 italic">Service.</span></h1>
      <p className="text-xl md:text-2xl text-slate-500 font-medium mb-16 max-w-2xl mx-auto leading-relaxed italic">The outreach engine for high-performers. Automate the tracking, master the follow-up, win the deal.</p>
      <Link to="/login"><Button size="lg" className="rounded-full px-16 py-9 text-2xl font-black shadow-2xl shadow-indigo-200">Get NoReply Pro</Button></Link>
    </section>
  </div>
);

const LoginPage: React.FC<{ onLogin: (u: User) => void }> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      onLogin({ id: '123', name: email.split('@')[0].toUpperCase(), email });
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="bg-white p-16 md:p-24 rounded-[4rem] shadow-2xl w-full max-w-xl animate-in zoom-in-95 duration-500 border border-white">
        <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white text-3xl mx-auto mb-10 shadow-2xl shadow-indigo-100 transform -rotate-6"><i className="fa-solid fa-reply-all transform rotate-180"></i></div>
        <h2 className="text-5xl font-black mb-12 text-center tracking-tighter text-slate-900">Access Pro</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input required type="email" placeholder="Professional Email" className="w-full px-10 py-7 bg-slate-50 rounded-[2rem] font-black text-xl border-none outline-none focus:ring-8 focus:ring-indigo-100 transition-all" value={email} onChange={e => setEmail(e.target.value)} />
          <Button className="w-full py-7 rounded-[2.5rem] text-2xl font-black shadow-2xl shadow-indigo-100" isLoading={loading}>Unlock Dashboard</Button>
        </form>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    try {
      const saved = localStorage.getItem('noreply_auth_pro');
      return saved ? { user: JSON.parse(saved), isAuthenticated: true } : { user: null, isAuthenticated: false };
    } catch (e) {
      return { user: null, isAuthenticated: false };
    }
  });

  const login = (user: User) => {
    localStorage.setItem('noreply_auth_pro', JSON.stringify(user));
    setAuthState({ user, isAuthenticated: true });
    if (Notification.permission === 'default') Notification.requestPermission();
  };

  const logout = () => {
    localStorage.removeItem('noreply_auth_pro');
    setAuthState({ user: null, isAuthenticated: false });
  };

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={authState.isAuthenticated ? <Navigate to="/dashboard" /> : <LandingPage />} />
        <Route path="/login" element={authState.isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage onLogin={login} />} />
        <Route path="/dashboard" element={authState.isAuthenticated ? <DashboardContainer user={authState.user} onLogout={logout} /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
