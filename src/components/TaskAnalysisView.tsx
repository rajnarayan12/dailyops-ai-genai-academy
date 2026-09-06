import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  Users,
  Calendar,
  Send,
  Copy,
  Check,
  Bookmark,
  AlertTriangle,
  Flame,
  Info,
  ListOrdered,
  Sparkles,
} from 'lucide-react';
import { OperationalAnalysis, PriorityLevel, UrgencyLevel } from '../types';

interface TaskAnalysisViewProps {
  analysis: OperationalAnalysis;
  onSave: () => void;
  isSaving: boolean;
  isSaved: boolean;
}

export const TaskAnalysisView: React.FC<TaskAnalysisViewProps> = ({
  analysis,
  onSave,
  isSaving,
  isSaved,
}) => {
  const [copiedResponse, setCopiedResponse] = useState(false);
  const [completedItems, setCompletedItems] = useState<Record<number, boolean>>({});

  const toggleItem = (idx: number) => {
    setCompletedItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleCopyResponse = () => {
    if (!analysis.suggestedResponse) return;
    navigator.clipboard.writeText(analysis.suggestedResponse);
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 2200);
  };

  const getPriorityBadge = (priority: PriorityLevel) => {
    switch (priority) {
      case 'High':
        return {
          bg: 'bg-rose-50 border-rose-200 text-rose-700',
          icon: <Flame className="w-4 h-4 text-rose-600" />,
          dot: 'bg-rose-500',
        };
      case 'Medium':
        return {
          bg: 'bg-amber-50 border-amber-200 text-amber-800',
          icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
          dot: 'bg-amber-500',
        };
      case 'Low':
      default:
        return {
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
          icon: <Info className="w-4 h-4 text-emerald-600" />,
          dot: 'bg-emerald-500',
        };
    }
  };

  const getUrgencyBadge = (urgency: UrgencyLevel) => {
    switch (urgency) {
      case 'Immediate':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'This Week':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Upcoming':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const badge = getPriorityBadge(analysis.priority);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner: Priority, Summary & Save CTA */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2.5 mb-2">
              <span
                className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badge.bg}`}
              >
                {badge.icon}
                <span>{analysis.priority} Priority</span>
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {analysis.priorityReason}
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Executive Operational Synthesis
            </h2>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              id="save-task-btn"
              onClick={onSave}
              disabled={isSaving || isSaved}
              className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                isSaved
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                  : isSaving
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-wait'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs hover:shadow'
              }`}
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Saved in Firestore</span>
                </>
              ) : isSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-blue-600 rounded-full animate-spin" />
                  <span>Persisting to Cloud...</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4 text-amber-300" />
                  <span>Save Plan to Firestore</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="mt-4">
          <p className="text-sm text-slate-700 leading-relaxed font-normal bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
            {analysis.summary}
          </p>
        </div>
      </div>

      {/* Grid: Action Items & Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Action Items (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Action Items</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              {Object.values(completedItems).filter(Boolean).length} / {analysis.actionItems.length} resolved
            </span>
          </div>

          <div className="space-y-2.5">
            {analysis.actionItems.map((item, idx) => {
              const isDone = !!completedItems[idx];
              return (
                <div
                  key={idx}
                  onClick={() => toggleItem(idx)}
                  className={`flex items-start space-x-3 p-3 rounded-lg border transition-all cursor-pointer ${
                    isDone
                      ? 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <button
                    type="button"
                    className="mt-0.5 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                  <span className="text-sm leading-snug select-none">{item}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Deadlines & Key Milestones (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Deadlines & Milestones</span>
            </h3>
            <span className="text-xs text-slate-400">{analysis.deadlines.length} extracted</span>
          </div>

          <div className="space-y-2.5">
            {analysis.deadlines.map((dl, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 flex flex-col space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-900 truncate">
                    {dl.timeframe}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border uppercase tracking-wider ${getUrgencyBadge(
                      dl.urgency
                    )}`}
                  >
                    {dl.urgency}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-snug">{dl.item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Phased Daily Action Plan */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <ListOrdered className="w-4 h-4 text-blue-600" />
              <span>Phased Daily Action Plan</span>
            </h3>
            <p className="text-xs text-slate-500">
              Chronological operational sequencing for team dispatch.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {analysis.actionPlan.map((step) => (
            <div
              key={step.step}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                    {step.step}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {step.phase}
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-900 leading-snug mb-1">
                  {step.action}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Deliverable
                </span>
                <span className="text-xs text-slate-700">{step.expectedOutcome}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stakeholders & Suggested Professional Response */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Stakeholders (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Key Stakeholders</span>
            </h3>
          </div>

          <div className="space-y-3">
            {analysis.stakeholders.map((sh, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-900">{sh.nameOrRole}</span>
                  {sh.department && (
                    <span className="text-[11px] text-slate-600 bg-slate-200/70 px-2 py-0.5 rounded font-medium">
                      {sh.department}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-snug">{sh.responsibilities}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Response (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Send className="w-4 h-4 text-blue-600" />
                <span>Suggested Professional Response</span>
              </h3>
              <p className="text-xs text-slate-500">
                Ready-to-send draft addressing all stakeholders and next steps.
              </p>
            </div>

            <button
              type="button"
              id="copy-response-btn"
              onClick={handleCopyResponse}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                copiedResponse
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              {copiedResponse ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Response</span>
                </>
              )}
            </button>
          </div>

          <div className="relative">
            <pre className="text-xs text-slate-800 bg-slate-50 rounded-xl border border-slate-200 p-4 font-sans whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
              {analysis.suggestedResponse}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
