import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { logOut } from '../lib/firebase';
import {
  ShieldCheck,
  Sparkles,
  LogOut,
  LayoutDashboard,
  PlusCircle,
  History,
  Sun,
  Menu,
  X,
  User as UserIcon,
} from 'lucide-react';

export type NavView = 'dashboard' | 'newTask' | 'history' | 'priorityDashboard';

interface HeaderProps {
  user: User | null;
  activeView: NavView;
  onSelectView: (view: NavView) => void;
  taskCount?: number;
  onOpenSecurityModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  activeView,
  onSelectView,
  taskCount = 0,
  onOpenSecurityModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (view: NavView) => {
    onSelectView(view);
    setMobileMenuOpen(false);
  };

  const navItems: Array<{ id: NavView; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'newTask', label: 'New Task', icon: PlusCircle },
    { id: 'history', label: 'History', icon: History },
    { id: 'priorityDashboard', label: 'Priority Dashboard', icon: Sun },
  ];

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-xs sticky top-0 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Desktop Navigation */}
        <div className="flex items-center space-x-6">
          <button
            type="button"
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center space-x-3 text-left group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs group-hover:bg-blue-700 transition-colors">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-slate-800">DailyOps AI</span>
                <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  GCP Enterprise
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden xl:block">
                Operational Task Automation with Gemini & Cloud Firestore
              </p>
            </div>
          </button>

          {/* Desktop Nav Items */}
          {user && (
            <nav id="desktop-nav" aria-label="Main Navigation" className="hidden md:flex items-center space-x-1 pl-4 border-l border-slate-200">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-${item.id}`}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 shadow-2xs border border-blue-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                    {item.id === 'history' && taskCount > 0 && (
                      <span
                        className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                          isActive ? 'bg-blue-200/70 text-blue-800' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {taskCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          )}
        </div>

        {/* Right Actions: Security Spec, Profile & Logout */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={onOpenSecurityModal}
            id="security-architecture-btn"
            className="hidden lg:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200"
            title="View Security & Cloud Architecture"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Security Spec</span>
          </button>

          {user && (
            <div className="flex items-center space-x-2 sm:space-x-3 pl-2 sm:pl-3 border-l border-slate-200">
              <div className="flex items-center space-x-2 text-right">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-8 h-8 rounded-full border border-slate-300 shadow-2xs"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-600 text-xs font-bold">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                  </div>
                )}
                <div className="hidden xl:block text-left">
                  <div className="text-xs font-semibold text-slate-800 truncate max-w-[120px]">
                    {user.displayName || user.email?.split('@')[0]}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                    {user.email}
                  </div>
                </div>
              </div>

              {/* Explicit Logout button */}
              <button
                onClick={() => logOut()}
                id="logout-btn"
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 hover:text-rose-800 transition-colors border border-rose-200"
                title="Logout of DailyOps AI"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
                <span>Logout</span>
              </button>

              {/* Mobile Menu Toggle */}
              <button
                type="button"
                id="mobile-nav-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle Navigation Menu"
                className="md:hidden p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {user && mobileMenuOpen && (
        <div id="mobile-nav-menu" className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-md">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            DailyOps AI Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-nav-${item.id}`}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.id === 'history' && taskCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                    {taskCount}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={onOpenSecurityModal}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center space-x-1 py-1"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Security Spec</span>
            </button>

            <button
              onClick={() => logOut()}
              id="mobile-logout-btn"
              className="text-xs font-semibold text-rose-700 hover:text-rose-800 flex items-center space-x-1 py-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

