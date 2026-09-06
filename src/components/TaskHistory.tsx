import React, { useState } from 'react';
import {
  History,
  Trash2,
  Search,
  ExternalLink,
  Flame,
  AlertTriangle,
  Info,
  Calendar,
  CheckCircle,
  Clock,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { SavedTaskRecord, PriorityLevel } from '../types';

interface TaskHistoryProps {
  tasks: SavedTaskRecord[];
  onSelectTask: (task: SavedTaskRecord) => void;
  onDeleteTask: (taskId: string) => Promise<void>;
  selectedTaskId: string | null;
}

export const TaskHistory: React.FC<TaskHistoryProps> = ({
  tasks,
  onSelectTask,
  onDeleteTask,
  selectedTaskId,
}) => {
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'All' | PriorityLevel>('All');
  const [taskPendingDelete, setTaskPendingDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredTasks = tasks.filter((t) => {
    const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;
    const matchesSearch =
      !search.trim() ||
      t.summary.toLowerCase().includes(search.toLowerCase()) ||
      t.originalInput.toLowerCase().includes(search.toLowerCase()) ||
      t.actionItems.some((a) => a.toLowerCase().includes(search.toLowerCase()));
    return matchesPriority && matchesSearch;
  });

  const confirmDelete = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(true);
    try {
      await onDeleteTask(taskId);
      setTaskPendingDelete(null);
    } catch (err) {
      console.error('Failed to delete task:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const getPriorityBadge = (priority: PriorityLevel) => {
    switch (priority) {
      case 'High':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Medium':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Low':
      default:
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <History className="w-4 h-4 text-blue-600" />
            <span>Task History</span>
          </h2>
          <p className="text-xs text-slate-500">
            Isolated cloud storage in Firestore. Only accessible by your account.
          </p>
        </div>

        <span className="text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md self-start sm:self-auto">
          {tasks.length} {tasks.length === 1 ? 'task saved' : 'tasks saved'}
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch gap-2.5 mb-4">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search saved tasks, summaries, or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all placeholder:text-slate-400 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/60">
          {(['All', 'High', 'Medium', 'Low'] as const).map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setPriorityFilter(lvl)}
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
                priorityFilter === lvl
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-10 px-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/60">
          <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-700 mb-0.5">
            {search || priorityFilter !== 'All' ? 'No matching tasks found' : 'No saved tasks yet'}
          </p>
          <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
            {search || priorityFilter !== 'All'
              ? 'Try changing or clearing your search filter.'
              : 'Analyze an operational request above and click "Save Plan to Firestore" to build your execution history.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
          {filteredTasks.map((t) => {
            const isSelected = selectedTaskId === t.id;
            const isConfirming = taskPendingDelete === t.id;

            return (
              <div
                key={t.id}
                onClick={() => onSelectTask(t)}
                className={`group p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/30 ring-1 ring-blue-600 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1.5 flex-wrap gap-y-1">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border uppercase tracking-wider ${getPriorityBadge(
                        t.priority
                      )}`}
                    >
                      {t.priority}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(t.createdAt)}</span>
                    </span>
                    <span className="text-[11px] text-slate-400 hidden md:inline">
                      • {t.actionItems.length} action items
                    </span>
                  </div>

                  <h3 className="text-xs font-semibold text-slate-800 line-clamp-1 group-hover:text-blue-900">
                    {t.summary}
                  </h3>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 self-end sm:self-center">
                  {isConfirming ? (
                    <div
                      className="flex items-center space-x-1 bg-rose-50 border border-rose-200 p-1 rounded-lg animate-fadeIn"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="text-[10px] font-medium text-rose-700 px-1">Delete?</span>
                      <button
                        type="button"
                        onClick={(e) => confirmDelete(t.id, e)}
                        disabled={isDeleting}
                        className="text-[11px] font-semibold bg-rose-600 hover:bg-rose-700 text-white px-2 py-0.5 rounded transition-colors"
                      >
                        {isDeleting ? '...' : 'Yes'}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTaskPendingDelete(null);
                        }}
                        className="text-[11px] text-slate-600 hover:text-slate-900 px-1.5 py-0.5"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTaskPendingDelete(t.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete from history"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
