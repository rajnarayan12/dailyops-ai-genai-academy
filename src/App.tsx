import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import {
  auth,
  signInWithGoogle,
  saveTaskToFirestore,
  subscribeUserTasks,
  deleteTaskFromFirestore,
} from './lib/firebase';
import { analyzeOperationalTask } from './lib/api';
import { Header, NavView } from './components/Header';
import { TaskInput } from './components/TaskInput';
import { TaskAnalysisView } from './components/TaskAnalysisView';
import { TaskHistory } from './components/TaskHistory';
import { MorningPriorityDashboard } from './components/MorningPriorityDashboard';
import { SecurityArchitectureModal } from './components/SecurityArchitectureModal';
import { OperationalAnalysis, SavedTaskRecord } from './types';
import {
  Sparkles,
  ShieldCheck,
  Lock,
  Database,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Cpu,
  LogIn,
  Layers,
  Terminal,
  LayoutDashboard,
  PlusCircle,
  History,
  Sun,
  LogOut,
} from 'lucide-react';
import { logOut } from './lib/firebase';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Active navigation view (Dashboard, New Task, History, Priority Dashboard)
  const [activeView, setActiveView] = useState<NavView>('dashboard');

  // Operational task state
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [activeAnalysis, setActiveAnalysis] = useState<OperationalAnalysis | null>(null);
  const [activeOriginalInput, setActiveOriginalInput] = useState<string>('');

  // Firestore task history
  const [tasks, setTasks] = useState<SavedTaskRecord[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Security modal
  const [securityModalOpen, setSecurityModalOpen] = useState(false);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Listen to user's tasks in Firestore (strictly user-isolated)
  useEffect(() => {
    if (!user) {
      setTasks([]);
      return;
    }

    const unsubscribe = subscribeUserTasks(
      user.uid,
      (fetchedTasks) => {
        setTasks(fetchedTasks);
      },
      (err) => {
        console.error('Firestore subscription error:', err);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Handle Google Sign-In
  const handleSignIn = async () => {
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setAuthError(err.message || 'Failed to sign in with Google.');
    }
  };

  // Run Gemini analysis via secure server proxy
  const handleAutomateTask = async () => {
    if (!input.trim() || !user) return;
    setIsAnalyzing(true);
    setAnalysisError(null);
    setIsSaved(false);
    setSelectedTaskId(null);

    try {
      const result = await analyzeOperationalTask(input);
      setActiveAnalysis(result);
      setActiveOriginalInput(input);
    } catch (err: any) {
      setAnalysisError(err.message || 'Failed to process task. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Save current analysis to Cloud Firestore
  const handleSaveToFirestore = async () => {
    if (!user || !activeAnalysis) return;
    setIsSaving(true);
    try {
      const docId = await saveTaskToFirestore(user.uid, {
        ...activeAnalysis,
        originalInput: activeOriginalInput,
        createdAt: new Date().toISOString(),
      });
      setIsSaved(true);
      setSelectedTaskId(docId);
    } catch (err: any) {
      console.error('Failed to save to Firestore:', err);
      alert(err.message || 'Failed to persist task in Firestore.');
    } finally {
      setIsSaving(false);
    }
  };

  // Select task from history to load into view
  const handleSelectHistoryTask = (task: SavedTaskRecord) => {
    setSelectedTaskId(task.id);
    setActiveAnalysis({
      summary: task.summary,
      priority: task.priority,
      priorityReason: task.priorityReason || '',
      actionItems: task.actionItems,
      deadlines: task.deadlines,
      stakeholders: task.stakeholders,
      actionPlan: task.actionPlan,
      suggestedResponse: task.suggestedResponse,
    });
    setActiveOriginalInput(task.originalInput);
    setInput(task.originalInput);
    setIsSaved(true);
  };

  // Delete task from Firestore
  const handleDeleteTask = async (taskId: string) => {
    if (!user) return;
    await deleteTaskFromFirestore(user.uid, taskId);
    if (selectedTaskId === taskId) {
      setSelectedTaskId(null);
      setIsSaved(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-600 tracking-wide uppercase">
            Initializing DailyOps AI & Firebase...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <Header
        user={user}
        activeView={activeView}
        onSelectView={setActiveView}
        taskCount={tasks.length}
        onOpenSecurityModal={() => setSecurityModalOpen(true)}
      />

      {/* Main Content Area */}
      {!user ? (
        // Unauthenticated Welcome & Google Sign-In Card
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8 text-center space-y-6">
            <div className="w-14 h-14 rounded-xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-sm">
              <Sparkles className="w-7 h-7 text-amber-300" />
            </div>

            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Google Cloud Enterprise Ready</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Welcome to DailyOps AI
              </h1>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Transform messy emails, incident reports, and meeting notes into structured daily action plans powered by Gemini 3.8 Flash and Cloud Firestore.
              </p>
            </div>

            {/* Security Guarantee Pills */}
            <div className="grid grid-cols-2 gap-2.5 text-left pt-2">
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/70">
                <div className="flex items-center space-x-1.5 text-slate-800 text-[11px] font-semibold">
                  <Lock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Firebase Auth</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">Google OAuth token validation</p>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/70">
                <div className="flex items-center space-x-1.5 text-slate-800 text-[11px] font-semibold">
                  <Database className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Isolated Data</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">Secure users/{'{userId}'} rules</p>
              </div>
            </div>

            {authError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start space-x-2 text-left">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {/* Google Sign-In Button */}
            <button
              id="google-signin-btn"
              onClick={handleSignIn}
              className="w-full flex items-center justify-center space-x-3 py-2.5 px-4 rounded-lg font-semibold text-sm text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-xs hover:shadow transition-all active:scale-[0.99]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>

            <p className="text-[11px] text-slate-400">
              Only authenticated users can analyze operations or view their saved data.
            </p>
          </div>
        </main>
      ) : (
        // Authenticated Dashboard
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
          {/* Dashboard In-Page Navigation Bar */}
          <nav
            id="dashboard-subnav"
            aria-label="Dashboard Views"
            className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200 shadow-2xs"
          >
            <div className="flex items-center space-x-1.5 overflow-x-auto">
              <button
                type="button"
                id="subnav-dashboard"
                onClick={() => setActiveView('dashboard')}
                className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeView === 'dashboard'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>

              <button
                type="button"
                id="subnav-new-task"
                onClick={() => setActiveView('newTask')}
                className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeView === 'newTask'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>New Task</span>
              </button>

              <button
                type="button"
                id="subnav-history"
                onClick={() => setActiveView('history')}
                className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeView === 'history'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>History</span>
                {tasks.length > 0 && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      activeView === 'history' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tasks.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                id="subnav-priority-dashboard"
                onClick={() => setActiveView('priorityDashboard')}
                className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeView === 'priorityDashboard'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Priority Dashboard</span>
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => logOut()}
                id="subnav-logout-btn"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-50 hover:text-rose-800 transition-colors border border-rose-200"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
                <span>Logout</span>
              </button>
            </div>
          </nav>

          {/* VIEW: Priority Dashboard (Focus Mode) */}
          {activeView === 'priorityDashboard' && (
            <div className="space-y-6">
              <MorningPriorityDashboard
                tasks={tasks}
                user={user}
                onSelectTask={handleSelectHistoryTask}
              />

              {activeAnalysis && (
                <section className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-bold tracking-wider uppercase text-slate-500">
                      Active Operational Brief
                    </h2>
                    {selectedTaskId && (
                      <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-medium">
                        Selected Task: {selectedTaskId.slice(0, 8)}...
                      </span>
                    )}
                  </div>
                  <TaskAnalysisView
                    analysis={activeAnalysis}
                    onSave={handleSaveToFirestore}
                    isSaving={isSaving}
                    isSaved={isSaved}
                  />
                </section>
              )}
            </div>
          )}

          {/* VIEW: New Task Mode */}
          {activeView === 'newTask' && (
            <div className="space-y-6">
              <TaskInput
                input={input}
                onChange={setInput}
                onSubmit={handleAutomateTask}
                isLoading={isAnalyzing}
              />

              {analysisError && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700 flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
                  <div>
                    <p className="font-semibold text-xs text-rose-800">Operational Analysis Error</p>
                    <p className="text-xs text-rose-700 mt-0.5">{analysisError}</p>
                  </div>
                </div>
              )}

              {activeAnalysis && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-bold tracking-wider uppercase text-slate-500">
                      Synthesized Operational Brief
                    </h2>
                    {selectedTaskId && (
                      <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-medium">
                        Loaded from Firestore ID: {selectedTaskId.slice(0, 8)}...
                      </span>
                    )}
                  </div>

                  <TaskAnalysisView
                    analysis={activeAnalysis}
                    onSave={handleSaveToFirestore}
                    isSaving={isSaving}
                    isSaved={isSaved}
                  />
                </section>
              )}
            </div>
          )}

          {/* VIEW: History Mode */}
          {activeView === 'history' && (
            <div className="space-y-6">
              {activeAnalysis && (
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-bold tracking-wider uppercase text-slate-500">
                      Inspecting Selected Task Brief
                    </h2>
                    <button
                      onClick={() => setSelectedTaskId(null)}
                      className="text-xs text-slate-500 hover:text-slate-800 underline"
                    >
                      Collapse Inspection
                    </button>
                  </div>
                  <TaskAnalysisView
                    analysis={activeAnalysis}
                    onSave={handleSaveToFirestore}
                    isSaving={isSaving}
                    isSaved={isSaved}
                  />
                </section>
              )}

              <TaskHistory
                tasks={tasks}
                onSelectTask={handleSelectHistoryTask}
                onDeleteTask={handleDeleteTask}
                selectedTaskId={selectedTaskId}
              />
            </div>
          )}

          {/* VIEW: Combined Dashboard (Default Overview) */}
          {activeView === 'dashboard' && (
            <div className="space-y-8">
              {/* Morning Priority Dashboard */}
              <MorningPriorityDashboard
                tasks={tasks}
                user={user}
                onSelectTask={handleSelectHistoryTask}
              />

              {/* Operational Task Input */}
              <TaskInput
                input={input}
                onChange={setInput}
                onSubmit={handleAutomateTask}
                isLoading={isAnalyzing}
              />

              {analysisError && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700 flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
                  <div>
                    <p className="font-semibold text-xs text-rose-800">Operational Analysis Error</p>
                    <p className="text-xs text-rose-700 mt-0.5">{analysisError}</p>
                  </div>
                </div>
              )}

              {/* Active AI Synthesis Result */}
              {activeAnalysis && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-bold tracking-wider uppercase text-slate-500">
                      Synthesized Operational Brief
                    </h2>
                    {selectedTaskId && (
                      <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-medium">
                        Loaded from Firestore ID: {selectedTaskId.slice(0, 8)}...
                      </span>
                    )}
                  </div>

                  <TaskAnalysisView
                    analysis={activeAnalysis}
                    onSave={handleSaveToFirestore}
                    isSaving={isSaving}
                    isSaved={isSaved}
                  />
                </section>
              )}

              {/* User Isolated Task History */}
              <section className="pt-2">
                <TaskHistory
                  tasks={tasks}
                  onSelectTask={handleSelectHistoryTask}
                  onDeleteTask={handleDeleteTask}
                  selectedTaskId={selectedTaskId}
                />
              </section>
            </div>
          )}
        </main>
      )}

      {/* Security Architecture Modal */}
      <SecurityArchitectureModal
        isOpen={securityModalOpen}
        onClose={() => setSecurityModalOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-900">DailyOps AI</span>
            <span>•</span>
            <span>Google Cloud & Gemini Operations Suite</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSecurityModalOpen(true)}
              className="text-slate-600 hover:text-slate-900 hover:underline"
            >
              Security Spec
            </button>
            <span>•</span>
            <span className="text-slate-400">Isolated Firestore Security Rules Enforced</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
