
import React, { useState } from 'react';
import { LayoutDashboard, ArrowLeftRight, PieChart, Target, LogOut, Wallet, X, Zap, CreditCard, CalendarClock, Bell, Settings, CreditCard as SubsIcon, TrendingUp, Users, GraduationCap, FlaskConical, LineChart, Scale, Wifi, WifiOff, RefreshCw, Trophy, Crown, Calendar as CalendarIcon, Menu, Terminal, Briefcase, ShieldAlert } from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';
import { t } from '../utils';
import WorkspaceSelector from './WorkspaceSelector';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  const { user, logout, language, isOnline, isSyncing, pendingInvites, currentWorkspace } = useFinance();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuGroups = [
    {
      title: 'group_general',
      items: [
        { id: 'dashboard', label: 'dashboard', icon: LayoutDashboard },
      ]
    },
    {
      title: 'group_daily',
      items: [
        { id: 'transactions', label: 'transactions', icon: ArrowLeftRight },
        { id: 'calendar', label: 'calendar_title', icon: CalendarIcon },
        { id: 'accounts', label: 'banks_title', icon: CreditCard },
        { id: 'reconcile', label: 'reconcile_title', icon: Scale },
      ]
    },
    {
      title: 'group_planning',
      items: [
        { id: 'goals', label: 'goals_title', icon: Target },
        { id: 'budgets', label: 'budgets_title', icon: Wallet },
        { id: 'subscriptions', label: 'subscriptions_title', icon: SubsIcon },
        { id: 'fixed', label: 'fixed_expenses_title', icon: CalendarClock },
        { id: 'debts', label: 'Gestão Dívidas', icon: ShieldAlert },
      ]
    },
    {
      title: 'group_wealth',
      items: [
        { id: 'networth', label: 'net_worth_title', icon: TrendingUp },
        { id: 'investments', label: 'investments_title', icon: LineChart },
      ]
    },
    {
      title: 'group_analysis',
      items: [
        { id: 'reports', label: 'reports_title', icon: PieChart },
        { id: 'coaching', label: 'coaching_title', icon: GraduationCap },
        { id: 'simulator', label: 'simulator_title', icon: FlaskConical },
        { id: 'automations', label: 'automations_title', icon: Zap },
      ]
    },
    {
      title: 'group_settings',
      items: [
        // Conditionally render workspace settings if inside a workspace
        ...(currentWorkspace ? [{ id: 'workspace-settings', label: 'workspace_settings', icon: Briefcase }] : []),
        { id: 'notifications', label: 'notifications', icon: Bell, hasIndicator: pendingInvites.length > 0 },
        { id: 'notification-prefs', label: 'notifications_prefs', icon: Settings },
        { id: 'shared', label: 'shared_finances', icon: Users },
        { id: 'developer', label: 'developer_title', icon: Terminal },
        { id: 'badges', label: 'achievements', icon: Trophy },
        { id: 'settings', label: 'settings_title', icon: Settings },
      ]
    }
  ];

  const handleTabClick = (id: string) => {
    onTabChange(id);
    setIsMobileOpen(false);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-surface border-r border-border">
      {/* Header */}
      <div className="p-6 flex items-center gap-3">
        <div className="bg-primary/20 p-2 rounded-xl">
          <Wallet className="text-primary w-6 h-6" />
        </div>
        <span className="text-xl font-bold text-white tracking-tight">FinanceFlow</span>
      </div>

      {/* Workspace Selector */}
      <WorkspaceSelector />

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 space-y-6 pb-6">
        {menuGroups.map((group, idx) => (
          <div key={idx}>
            {group.title && (
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3 px-2">
                {t(group.title, language) === group.title && group.title === 'Gestão Dívidas' ? 'Gestão Dívidas' : t(group.title, language)}
              </h3>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all group ${
                      isActive 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-text-muted hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} className={isActive ? 'text-primary' : 'text-text-muted group-hover:text-white'} />
                      <span className="text-sm font-medium">{t(item.label, language) === item.label ? item.label : t(item.label, language)}</span>
                    </div>
                    {item.hasIndicator && (
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Status Bar */}
      <div className="px-6 py-2 bg-black/20 border-t border-border flex justify-between items-center text-[10px] uppercase font-bold tracking-wider text-text-muted">
          <div className="flex items-center gap-1">
              {isOnline ? <Wifi size={12} className="text-green-500" /> : <WifiOff size={12} className="text-red-500" />}
              {isOnline ? 'Online' : 'Offline'}
          </div>
          <div className="flex items-center gap-1">
              <RefreshCw size={12} className={isSyncing ? "text-blue-500 animate-spin" : "text-zinc-600"} />
              {isSyncing ? 'Syncing...' : 'Synced'}
          </div>
      </div>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-border bg-black/20">
          {user ? (
              <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-white font-bold border border-border shrink-0">
                      {user.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full rounded-full" /> : user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                          <p className="text-sm font-bold text-white truncate">{user.name}</p>
                          {user.plan === 'pro' && <Crown size={12} className="text-yellow-500 fill-yellow-500" />}
                      </div>
                      <p className="text-xs text-text-muted truncate">{user.email}</p>
                  </div>
                  <button 
                      onClick={logout}
                      className="p-2 hover:bg-white/10 rounded-lg text-text-muted hover:text-red-500 transition-colors"
                      title={t('logout_button', language)}
                  >
                      <LogOut size={16} />
                  </button>
              </div>
          ) : (
              <button onClick={logout} className="flex items-center gap-2 text-sm text-text-muted hover:text-white transition-colors w-full justify-center">
                  <LogOut size={16} /> {t('logout_button', language)}
              </button>
          )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <div className="md:hidden fixed top-4 right-4 z-50 bg-surface p-2 rounded-lg border border-border shadow-lg">
        <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="text-white">
          {isMobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar Desktop */}
      <aside className="hidden md:block w-64 h-screen flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Sidebar Mobile */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-3/4 max-w-xs bg-surface z-50 md:hidden border-r border-border"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
