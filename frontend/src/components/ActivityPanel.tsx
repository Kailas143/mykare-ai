import React, { useRef, useEffect } from 'react';

export type LogEntry = {
  timestamp: string;
  type: 'user' | 'tool' | 'ai' | 'success' | 'info';
  content: string;
};

interface ActivityPanelProps {
  logs: LogEntry[];
}

export default function ActivityPanel({ logs }: ActivityPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  const renderIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'user': return '🎤';
      case 'tool': return '🔧';
      case 'ai': return '🤖';
      case 'success': return '✅';
      case 'info': return 'ℹ️';
      default: return '🔹';
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-96">
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center gap-2">
        <h3 className="font-semibold text-slate-700">Tool Timeline</h3>
      </div>
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
      >
        {logs.length === 0 ? (
          <p className="text-slate-400 text-center italic text-sm mt-10">No activity yet...</p>
        ) : (
          logs.map((log, i) => (
            <div key={i} className="flex flex-col gap-1">
              <div className="text-xs font-mono text-slate-400">
                {log.timestamp}
              </div>
              <div className="flex items-start gap-2 text-sm">
                <span className="flex-shrink-0 mt-0.5">{renderIcon(log.type)}</span>
                <div className="flex flex-col">
                  {log.type === 'user' && <span className="font-semibold text-slate-700">User:</span>}
                  <span className={`leading-relaxed ${
                    log.type === 'ai' ? 'text-slate-800' : 
                    log.type === 'tool' ? 'text-blue-600 font-mono text-xs mt-0.5' : 
                    log.type === 'success' ? 'text-green-600 font-medium' :
                    log.type === 'info' ? 'text-slate-500 italic' :
                    'text-slate-600'
                  }`}>
                    {log.content}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
