
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, UtensilsCrossed, Euro, TrendingUp, ChefHat, Settings, ShieldCheck } from 'lucide-react';
import { UserProfile } from '../types';

const Sidebar: React.FC<{ user?: UserProfile | null }> = ({ user }) => {
  const location = useLocation();
  const [logo, setLogo] = useState<string>('');
  const [kitchenName, setKitchenName] = useState("Alina's Kitchen");

  useEffect(() => {
      // Check local storage for immediate update after save, or use prop
      const storedUser = localStorage.getItem('kitchen_user');
      if(storedUser) {
          const p = JSON.parse(storedUser);
          if(p.logoUrl) setLogo(p.logoUrl);
          if(p.kitchenName) setKitchenName(p.kitchenName);
      } else if (user) {
          if(user.logoUrl) setLogo(user.logoUrl);
          if(user.kitchenName) setKitchenName(user.kitchenName);
      }
  }, [user]);

  const navItems = [
    { path: '/', label: 'Home', icon: LayoutDashboard },
    { path: '/orders', label: 'Orders', icon: ChefHat },
    { path: '/finance', label: 'Finance', icon: Euro },
    { path: '/menu', label: 'Menu', icon: UtensilsCrossed },
    { path: '/strategy', label: 'Advisor', icon: TrendingUp },
    { path: '/compliance', label: 'Legal', icon: ShieldCheck },
  ];

  return (
    <>
      {/* Desktop Sidebar (Hidden on mobile) */}
      <div className="hidden md:flex w-64 bg-white h-screen shadow-lg flex-col fixed left-0 top-0 z-20">
        <div className="p-6 flex items-center gap-3 border-b border-gray-100">
          <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center overflow-hidden border border-teal-100">
             {logo ? (
                 <img src={logo} alt="Logo" className="w-full h-full object-cover" />
             ) : (
                 <img 
                    src="logo.png" 
                    alt="Logo" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.classList.add('bg-teal-600');
                        e.currentTarget.parentElement!.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chef-hat"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/><line x1="6" x2="18" y1="17" y2="17"/></svg>';
                    }}
                    />
             )}
          </div>
          <div className="overflow-hidden">
            <h1 className="font-bold text-lg text-teal-900 leading-tight truncate">{kitchenName}</h1>
            <p className="text-xs text-teal-600 font-medium">Manager</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-teal-50 text-teal-700 font-medium' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100 space-y-4">
           <Link
              to="/settings"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === '/settings'
                  ? 'bg-gray-100 text-gray-900 font-medium' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Settings size={20} />
              Settings
            </Link>
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-lg p-4 text-white shadow-md shadow-teal-200">
            <p className="text-sm font-medium opacity-90">Daily Revenue</p>
            <p className="text-2xl font-bold">€420.50</p>
            <p className="text-xs opacity-75 mt-1">+12% from yesterday</p>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation (Hidden on desktop) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 px-2 pb-safe-bottom">
        <div className="flex justify-between items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center p-3 min-w-[14%] transition-colors ${
                   isActive ? 'text-teal-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium mt-1 truncate max-w-full">{item.label}</span>
              </Link>
            );
          })}
           <Link
                to="/settings"
                className={`flex flex-col items-center justify-center p-3 min-w-[14%] transition-colors ${
                   location.pathname === '/settings' ? 'text-teal-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Settings size={22} strokeWidth={location.pathname === '/settings' ? 2.5 : 2} />
                <span className="text-[10px] font-medium mt-1">Settings</span>
            </Link>
        </div>
      </div>
    </>
  );
};

export default Sidebar;