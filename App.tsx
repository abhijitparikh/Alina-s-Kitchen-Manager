
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import StrategyAdvisor from './components/StrategyAdvisor';
import FinanceManager from './components/FinanceManager';
import OrderManager from './components/OrderManager';
import MenuManager from './components/MenuManager';
import ComplianceManager from './components/ComplianceManager';
import Settings from './components/Settings';
import Login from './components/Login';
import { UserProfile } from './types';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('kitchen_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (profile: UserProfile) => {
    setUser(profile);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('kitchen_user');
    setUser(null);
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar acts as Top/Bottom nav on mobile and Side nav on Desktop */}
        <Sidebar user={user} />
        
        {/* 
          Main Content Area 
          md:ml-64 -> Left margin for desktop sidebar
          mb-20 -> Bottom margin for mobile nav bar
          md:mb-0 -> Reset bottom margin on desktop
        */}
        <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto h-screen mb-20 md:mb-0">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/orders" element={<OrderManager />} />
              <Route path="/finance" element={<FinanceManager />} />
              <Route path="/strategy" element={<StrategyAdvisor />} />
              <Route path="/menu" element={<MenuManager />} />
              <Route path="/compliance" element={<ComplianceManager user={user} />} />
              <Route path="/settings" element={<Settings onLogout={handleLogout} user={user} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
};

export default App;