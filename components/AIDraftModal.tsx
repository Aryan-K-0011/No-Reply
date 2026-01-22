
import React, { useState } from 'react';
import { Button } from './Button';
import { Tone } from '../types';
import { generateFollowUpDraft } from '../services/geminiService';

interface AIDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  initialContext: string;
}

export const AIDraftModal: React.FC<AIDraftModalProps> = ({
  isOpen, onClose, recipientName, initialContext
}) => {
  const [tone, setTone] = useState<Tone>('professional');
  const [context, setContext] = useState(initialContext);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await generateFollowUpDraft(recipientName, context, tone);
      setDraft(result);
    } catch (err: any) {
      setError(err.message || 'AI generation failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white rounded-[3rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.2)] max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden border border-white">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-slate-900">AI Outreach Engine</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Gemini 3.0 Flash Enabled</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400"><i className="fa-solid fa-xmark text-lg"></i></button>
        </div>

        <div className="p-8 overflow-y-auto space-y-6 custom-scrollbar">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400">Target Contact</label>
              <div className="px-4 py-3 bg-slate-50 rounded-2xl text-slate-700 font-bold border border-slate-100">{recipientName}</div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400">Strategic Tone</label>
              <select 
                value={tone} onChange={e => setTone(e.target.value as Tone)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-700 font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none"
              >
                <option value="professional">💼 Professional</option>
                <option value="polite">🙏 Polite & Warm</option>
                <option value="casual">👋 Friendly/Casual</option>
                <option value="urgent">⏳ Time Sensitive</option>
                <option value="creative">💡 Creative Hook</option>
                <option value="short">⚡ Quick Ping</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400">Original Conversation Details</label>
            <textarea 
              value={context} onChange={e => setContext(e.target.value)}
              placeholder="Paste relevant details or your last message here for better AI context..."
              rows={3}
              className="w-full px-5 py-4 border border-slate-100 bg-slate-50 rounded-2xl text-slate-700 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
            />
          </div>

          <Button className="w-full py-4 text-lg rounded-2xl shadow-xl shadow-indigo-100" onClick={handleGenerate} isLoading={loading}>
            {draft ? 'Refine Message' : 'Generate Strategic Draft'}
          </Button>

          {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center text-sm font-bold">{error}</div>}

          {draft && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black uppercase text-slate-400">Strategic Output</span>
                <div className="flex gap-2">
                   <button onClick={() => { navigator.clipboard.writeText(draft); alert('Copied!'); }} className="text-xs font-bold text-indigo-600 flex items-center gap-2 hover:underline"><i className="fa-solid fa-copy"></i> Copy</button>
                </div>
              </div>
              <div className="p-6 bg-slate-900 text-slate-100 rounded-[2rem] text-sm leading-relaxed min-h-[160px] font-medium selection:bg-indigo-500 selection:text-white">
                {draft}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
