import React from 'react';

interface SummaryData {
  name: string | null;
  phone_number: string | null;
  intent: string | null;
  actions: string[] | null;
  appointment_date: string | null;
  appointment_time: string | null;
  preferences: string | null;
  timestamp: string;
  metrics?: {
    stt_cost: number;
    llm_cost: number;
    tts_cost: number;
    total: number;
  };
}

interface SummaryScreenProps {
  summary: SummaryData;
  duration: number;
  toolCallsCount: number;
  onClose: () => void;
}

export default function SummaryScreen({ summary, duration, toolCallsCount, onClose }: SummaryScreenProps) {
  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-slate-800">Conversation Summary</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-1">Patient</p>
              <p className="font-semibold text-slate-800">{summary.name || 'Not Provided'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-1">Phone</p>
              <p className="font-semibold text-slate-800">{summary.phone_number || 'Not Provided'}</p>
            </div>
          </div>

          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
            <p className="text-sm font-medium text-blue-400 uppercase tracking-wider mb-1">Intent</p>
            <p className="font-semibold text-blue-900 capitalize">{summary.intent?.replace(/_/g, ' ') || 'Not Detected'}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">Actions</p>
            <div className="space-y-2">
              {summary.actions && Array.isArray(summary.actions) && summary.actions.length > 0 ? (
                summary.actions.map((action, i) => (
                  <div key={i} className="flex items-center gap-2 text-slate-700 font-medium">
                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {action}
                  </div>
                ))
              ) : (
                <p className="text-slate-500 italic">No actions recorded.</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-1">Appointment</p>
              <p className="font-semibold text-slate-800">
                {summary.appointment_date ? new Date(summary.appointment_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
              </p>
              <p className="font-semibold text-slate-600">{summary.appointment_time || ''}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-1">Preferences</p>
              <p className="font-semibold text-slate-800">{summary.preferences || 'None'}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-1">Timestamp</p>
              <p className="text-sm font-semibold text-slate-600">{summary.timestamp || new Date().toLocaleString()}</p>
            </div>
          </div>

          {/* Cost Breakdown & Session Metrics */}
          {summary.metrics && (
            <div className="pt-4 border-t border-slate-100">
              <p className="text-sm font-bold text-slate-800 mb-3">Session Metrics</p>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-600">Duration:</span>
                  <span className="text-sm font-bold text-slate-800">{formatDuration(duration)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-600">Tool Calls:</span>
                  <span className="text-sm font-bold text-slate-800">{toolCallsCount}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200 mt-2">
                  <span className="text-sm font-medium text-slate-600">Total Cost:</span>
                  <span className="text-sm font-bold text-green-600">${summary.metrics.total.toFixed(4)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
