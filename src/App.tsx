import React, { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { AuthProvider, useAuth } from '@/features/auth/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { FinanceProvider } from '@/contexts/FinanceContext';

import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import TransactionList from '@/components/TransactionList';
import Goals from '@/components/Goals';
import Login from '@/components/Login';
import NotificationToast from '@/components/NotificationToast';
import DebtDashboard from '@/components/DebtDashboard';
import { Loader2 } from 'lucide-react';

// Page Imports
import Reports from '@/components/Reports';
import Automations from '@/components/Automations';
import BankSync from '@/components/BankSync';
import FixedExpenses from '@/components/FixedExpenses';
import NotificationsPage from '@/components/NotificationsPage';
import Settings from '@/components/Settings';
import AccountsPage from '@/components/AccountsPage';
import SubscriptionsPage from '@/components/SubscriptionsPage';
import BudgetsPage from '@/components/BudgetsPage';
import CoachingPage from '@/components/CoachingPage';
import InvestmentsPage from '@/components/InvestmentsPage';
import NetWorthPage from '@/components/NetWorthPage';
import SharedFinances from '@/components/SharedFinances';
import LandingPage from '@/components/LandingPage';
import BankCallback from '@/components/BankCallback';
import SimulatorPage from '@/components/SimulatorPage';
import ReconcilePage from '@/components/ReconcilePage';
import FinancialCalendar from '@/components/FinancialCalendar';
import BadgesPage from '@/components/BadgesPage';
import NotificationPreferencesPage from '@/components/NotificationPreferencesPage';
import DeveloperPage from '@/components/DeveloperPage';
import WorkspaceSettingsPage from '@/components/WorkspaceSettingsPage';

const MainLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showLanding, setShowLanding] = useState(true);
  const [loginPlan, setLoginPlan] = useState<any>('starter');

  if (window.location.pathname === '/bank-callback') {
      return <BankCallback />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="text-primary animate-spin" size={40} />
      </div>
    );
  }

  if (!isAuthenticated) {
    if (showLanding) {
        return <LandingPage onLogin={(plan) => { setLoginPlan(plan); setShowLanding(false); }} />;
    }
    return <Login onBack={() => setShowLanding(true)} selectedPlan={loginPlan} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'transactions': return <TransactionList />;
      case 'goals': return <Goals />;
      case 'reports': return <Reports />;
      case 'automations': return <Automations />;
      case 'banks': return <BankSync />;
      case 'accounts': return <AccountsPage />;
      case 'fixed': return <FixedExpenses />;
      case 'notifications': return <NotificationsPage />;
      case 'settings': return <Settings />;
      case 'subscriptions': return <SubscriptionsPage />;
      case 'budgets': return <BudgetsPage />;
      case 'coaching': return <CoachingPage />;
      case 'investments': return <InvestmentsPage />;
      case 'networth': return <NetWorthPage />;
      case 'shared': return <SharedFinances />;
      case 'simulator': return <SimulatorPage />;
      case 'reconcile': return <ReconcilePage />;
      case 'calendar': return <FinancialCalendar />;
      case 'badges': return <BadgesPage />;
      case 'notification-prefs': return <NotificationPreferencesPage />;
      case 'developer': return <DeveloperPage />;
      case 'workspace-settings': return <WorkspaceSettingsPage />;
      case 'debts': return <DebtDashboard />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-background text-white overflow-hidden font-sans">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-y-auto bg-background relative">
        {renderContent()}
      </main>
      <NotificationToast />
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <FinanceProvider>
            <MainLayout />
          </FinanceProvider>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;