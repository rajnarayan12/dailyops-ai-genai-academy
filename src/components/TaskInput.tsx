import React, { useState } from 'react';
import { Sparkles, Trash2, FileText, ArrowRight, Zap, AlertCircle } from 'lucide-react';

interface TaskInputProps {
  input: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

const PRESETS = [
  {
    title: 'P0 Incident Escalation',
    tag: 'Incident',
    content: `From: ops-oncall@enterprise.internal
Subject: URGENT: Production Payment API Latency Spike (Incident #4092)

Team, we are seeing a 400% latency spike on the /v2/charge endpoints since the 03:00 UTC canary deployment. 
Key Impacts:
- Checkout failures currently at 4.2% (SLA threshold is 0.5%).
- VP of Commerce Sarah Jenkins was notified by Tier-1 accounts.
- We need the SRE team to rollback Kubernetes deployment charge-service-v2.14 immediately.
- Lead DB architect Marcus needs to inspect the deadlock logs in Cloud SQL.
- We must provide an executive incident update to leadership by 11:30 AM EST today.
- Post-mortem review draft is required within 48 hours for the SOC2 audit compliance team.`,
  },
  {
    title: 'Enterprise Client Contract Sync',
    tag: 'Account Mgmt',
    content: `Notes from call with Apex Global (VP Technology David Miller, Legal counsel Elena Rostova):
Discussed Q4 platform renewal. They are willing to sign a 2-year expansion if we commit to:
1. 99.99% uptime guarantee with 30-minute critical response SLA.
2. Complete customer-managed encryption key (CMEK) integration by October 15th.
3. Pricing discount of 12% on the base tier.
Actions:
- Send revised Master Services Agreement (MSA) redline to Elena by Thursday 5:00 PM.
- Engineering lead Dave must confirm CMEK delivery timeline before we sign off on Section 4.
- Schedule executive sponsor check-in with CEO before end of week.`,
  },
  {
    title: 'Weekly Sprint Release Blockers',
    tag: 'Engineering',
    content: `Weekly Operations Sync - Core Platform Team
Attendees: Priya (PM), Alex (Eng Lead), Jordan (QA), Maya (Infra)
Status & Blockers:
- Release v3.8 scheduled for Thursday midnight is currently red.
- Security audit flagged unpinned container image digests in the CI pipeline; Maya must patch dockerfile configs today.
- QA found a regression in user invitation links on mobile browsers. Jordan needs frontend PR reviewed by 2 PM tomorrow.
- Priya to notify marketing that release notes need final proofing by Wednesday morning.`,
  },
];

export const TaskInput: React.FC<TaskInputProps> = ({
  input,
  onChange,
  onSubmit,
  isLoading,
  disabled,
}) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleTrigger();
    }
  };

  const handleTrigger = () => {
    if (!input.trim()) {
      setErrorMsg('Please enter an operational task, email, or meeting note.');
      return;
    }
    if (input.trim().length < 5) {
      setErrorMsg('Please enter at least 5 characters for Gemini to analyze.');
      return;
    }
    setErrorMsg(null);
    onSubmit();
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6 transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            Operational Input
          </h2>
          <p className="text-xs text-slate-500">
            Paste messy emails, incident logs, sprint notes, or task requests for automated AI synthesis.
          </p>
        </div>

        {/* Quick presets pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-slate-400 font-medium mr-1">Try example:</span>
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                onChange(p.content);
                setErrorMsg(null);
              }}
              className="text-xs px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200 font-medium"
            >
              {p.tag}
            </button>
          ))}
        </div>
      </div>

      {/* Textarea */}
      <div className="relative">
        <textarea
          id="task-input-textarea"
          value={input}
          onChange={(e) => {
            onChange(e.target.value);
            if (errorMsg) setErrorMsg(null);
          }}
          onKeyDown={handleKeyDown}
          disabled={isLoading || disabled}
          placeholder="e.g. Paste an urgent client email thread, meeting transcript, production incident alert, or bulleted operational notes..."
          rows={7}
          className="w-full text-sm text-slate-800 placeholder:text-slate-400 bg-slate-50/60 hover:bg-slate-50 focus:bg-white rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 p-4 transition-all resize-y outline-none leading-relaxed"
        />

        {input && !isLoading && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
            title="Clear text"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="mt-2.5 flex items-center space-x-2 text-xs text-rose-600">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Footer controls */}
      <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
        <div className="flex items-center space-x-3 text-xs text-slate-400">
          <span>{input.length.toLocaleString()} characters</span>
          <span>•</span>
          <span className="hidden sm:inline">Press <kbd className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200 font-mono text-[10px] text-slate-600">⌘+Enter</kbd> to run</span>
        </div>

        <button
          type="button"
          id="automate-task-btn"
          onClick={handleTrigger}
          disabled={isLoading || disabled || !input.trim()}
          className={`inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-xs ${
            isLoading || disabled || !input.trim()
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-[0.99] hover:shadow'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analyzing with Gemini...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Automate My Task</span>
              <ArrowRight className="w-4 h-4 opacity-70" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
