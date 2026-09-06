import React, { useState, useEffect, useMemo } from 'react';
import {
  Sun,
  Flame,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Clock,
  Layers,
  ListTodo,
  ArrowRight,
  Sparkles,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { SavedTaskRecord, UserProfile } from '../types';

interface MorningPriorityDashboardProps {
  tasks: SavedTaskRecord[];
  user: UserProfile | { displayName: string | null; email: string | null; uid: string } | null;
  onSelectTask: (task: SavedTaskRecord) => void;
}

export const MorningPriorityDashboard: React.FC<MorningPriorityDashboardProps> = ({
  tasks,
  user,
  onSelectTask,
}) => {
  // Store completed action items keyed by task and index, persisted per user in localStorage
  const storageKey = user ? `dailyops_completed_actions_${user.uid}` : 'dailyops_completed_actions_guest';

  const [completedActions, setCompletedActions] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Sync to localStorage whenever completedActions updates
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(completedActions));
    } catch (e) {
      console.warn('Failed to persist action item completion state:', e);
    }
  }, [completedActions, storageKey]);

  // Priority counts
  const totalTasks = tasks.length;
  const highPriorityTasks = useMemo(() => tasks.filter((t) => t.priority === 'High'), [tasks]);
  const mediumPriorityTasks = useMemo(() => tasks.filter((t) => t.priority === 'Medium'), [tasks]);
  const lowPriorityTasks = useMemo(() => tasks.filter((t) => t.priority === 'Low'), [tasks]);

  // Aggregate all action items from all saved tasks
  const allActionItems = useMemo(() => {
    const items: Array<{
      key: string;
      taskId: string;
      taskSummary: string;
      priority: string;
      text: string;
      deadline?: string;
    }> = [];

    // Prioritize High priority tasks first, then Medium, then Low
    const sortedTasks = [...tasks].sort((a, b) => {
      const priorityOrder: Record<string, number> = { High: 0, Medium: 1, Low: 2 };
      return (priorityOrder[a.priority] ?? 3) - (priorityOrder[b.priority] ?? 3);
    });

    sortedTasks.forEach((task) => {
      if (Array.isArray(task.actionItems)) {
        task.actionItems.forEach((actionText, idx) => {
          const key = `${task.id}-${idx}`;
          const topDeadline = task.deadlines?.[0]?.timeframe;
          items.push({
            key,
            taskId: task.id,
            taskSummary: task.summary,
            priority: task.priority,
            text: actionText,
            deadline: topDeadline,
          });
        });
      }
    });

    return items;
  }, [tasks]);

  const openActionItemsCount = useMemo(() => {
    return allActionItems.filter((item) => !completedActions[item.key]).length;
  }, [allActionItems, completedActions]);

  const toggleActionItem = (key: string) => {
    setCompletedActions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Recent tasks (top 3-4 ordered by creation date)
  const recentTasks = useMemo(() => tasks.slice(0, 3), [tasks]);

  // Current formatted date for the morning greeting
  const todayFormatted = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    }).format(new Date());
  }, []);

  const userName = user?.displayName ? user.displayName.split(' ')[0] : 'Operator';

  return (
    <section
      id="morning-priority-dashboard"
      className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden"
    >
      {/* Top Header Banner */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Morning Priority Brief</span>
            </span>
            <span className="text-xs text-slate-400 flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{todayFormatted}</span>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Good morning, {userName}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Here is your real-time operational status and prioritized action items synthesized from your Cloud Firestore records.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start sm:self-center">
          <div className="text-right hidden sm:block">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">User Isolation</p>
            <p className="text-xs font-medium text-emerald-400">Authenticated & Isolated</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-y sm:divide-y-0 divide-x-0 sm:divide-x divide-slate-200/80 border-b border-slate-200/80 bg-slate-50/50">
        {/* Total Tasks */}
        <div className="p-4 sm:p-5 flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0">
            <Layers className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Tasks
            </p>
            <p className="text-2xl font-bold text-slate-900 leading-tight">{totalTasks}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Saved in Firestore</p>
          </div>
        </div>

        {/* High Priority */}
        <div className="p-4 sm:p-5 flex items-center space-x-3.5 bg-rose-50/30">
          <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center flex-shrink-0">
            <Flame className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
              <p className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider">
                High Priority
              </p>
            </div>
            <p className="text-2xl font-bold text-rose-950 leading-tight">{highPriorityTasks.length}</p>
            <p className="text-[10px] text-rose-600/80 mt-0.5">Immediate attention</p>
          </div>
        </div>

        {/* Medium Priority */}
        <div className="p-4 sm:p-5 flex items-center space-x-3.5 bg-amber-50/20">
          <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">
              Medium Priority
            </p>
            <p className="text-2xl font-bold text-amber-950 leading-tight">{mediumPriorityTasks.length}</p>
            <p className="text-[10px] text-amber-700/80 mt-0.5">In progress & sync</p>
          </div>
        </div>

        {/* Low Priority */}
        <div className="p-4 sm:p-5 flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Low Priority
            </p>
            <p className="text-2xl font-bold text-slate-900 leading-tight">{lowPriorityTasks.length}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Routine backlog</p>
          </div>
        </div>

        {/* Open Action Items */}
        <div className="p-4 sm:p-5 flex items-center space-x-3.5 col-span-2 sm:col-span-1 bg-indigo-50/20">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center flex-shrink-0">
            <ListTodo className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-indigo-900 uppercase tracking-wider">
              Open Actions
            </p>
            <p className="text-2xl font-bold text-indigo-950 leading-tight">{openActionItemsCount}</p>
            <p className="text-[10px] text-indigo-600/80 mt-0.5">
              {allActionItems.length > 0
                ? `${allActionItems.length - openActionItemsCount} of ${allActionItems.length} completed`
                : 'Pending checklist'}
            </p>
          </div>
        </div>
      </div>

      {/* Two-Column Operational Detail Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200/90">
        {/* Left Column: Today's Action Items Checklist */}
        <div className="lg:col-span-7 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <ListTodo className="w-4 h-4 text-blue-600" />
                <span>Today's Action Items</span>
              </h3>
              {openActionItemsCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-700">
                  {openActionItemsCount} pending
                </span>
              )}
            </div>
            {allActionItems.length > 0 && (
              <span className="text-[11px] text-slate-400">
                Click checkbox to check off items
              </span>
            )}
          </div>

          {allActionItems.length === 0 ? (
            <div className="p-6 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-semibold text-slate-700">No open action items</p>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                Paste an operational email, incident note, or blocker below and click "Automate My Task" to generate today's checklist.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {allActionItems.slice(0, 6).map((item, idx) => {
                const isCompleted = !!completedActions[item.key];
                return (
                  <div
                    key={item.key}
                    className={`flex items-start space-x-3 p-3 rounded-xl border transition-all text-xs ${
                      isCompleted
                        ? 'bg-slate-50 border-slate-200 text-slate-400'
                        : item.priority === 'High'
                        ? 'bg-rose-50/40 border-rose-200 text-slate-800 hover:border-rose-300'
                        : 'bg-white border-slate-200 text-slate-800 hover:border-blue-300'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleActionItem(item.key)}
                      aria-label={isCompleted ? 'Mark item incomplete' : 'Mark item completed'}
                      className="mt-0.5 text-slate-400 hover:text-blue-600 flex-shrink-0 transition-colors"
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-medium leading-relaxed ${
                          isCompleted ? 'line-through text-slate-400' : 'text-slate-800'
                        }`}
                      >
                        {idx + 1}. {item.text}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[10px]">
                        <span
                          className={`px-1.5 py-0.5 rounded font-semibold ${
                            item.priority === 'High'
                              ? 'bg-rose-100 text-rose-700'
                              : item.priority === 'Medium'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {item.priority} Priority
                        </span>
                        {item.deadline && (
                          <span className="text-slate-500 flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{item.deadline}</span>
                          </span>
                        )}
                        <span className="text-slate-400 truncate max-w-[200px]" title={item.taskSummary}>
                          from: {item.taskSummary}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {allActionItems.length > 6 && (
                <p className="text-[11px] text-center text-slate-400 pt-1">
                  + {allActionItems.length - 6} more action items in your saved tasks
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Recent Operational Tasks */}
        <div className="lg:col-span-5 p-5 sm:p-6 space-y-4 bg-slate-50/40">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Recent Operational Tasks</span>
            </h3>
            <span className="text-[11px] font-medium text-slate-400">
              {recentTasks.length} {recentTasks.length === 1 ? 'task' : 'tasks'}
            </span>
          </div>

          {recentTasks.length === 0 ? (
            <div className="p-6 rounded-xl bg-white border border-dashed border-slate-200 text-center space-y-2">
              <Layers className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-semibold text-slate-700">No saved tasks yet</p>
              <p className="text-[11px] text-slate-400">
                Any task analysis you save to Firestore will appear here in real time.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => onSelectTask(task)}
                  className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${
                          task.priority === 'High'
                            ? 'bg-rose-100 text-rose-700'
                            : task.priority === 'Medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {task.priority}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(task.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <span className="text-[11px] font-medium text-blue-600 group-hover:translate-x-0.5 transition-transform flex items-center space-x-1">
                      <span>View</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>

                  <p className="text-xs font-medium text-slate-800 line-clamp-2 mt-2 leading-relaxed">
                    {task.summary}
                  </p>

                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100 text-[10px] text-slate-500">
                    <span>
                      {task.actionItems?.length || 0} action {task.actionItems?.length === 1 ? 'item' : 'items'}
                    </span>
                    {task.deadlines?.[0]?.timeframe && (
                      <span className="text-slate-500 flex items-center space-x-1 font-medium">
                        <Clock className="w-2.5 h-2.5 text-slate-400" />
                        <span>{task.deadlines[0].timeframe}</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
