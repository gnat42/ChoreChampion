import React from 'react';
import { Home, Users, CheckSquare, Gift } from 'lucide-react';
import { Tab } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const navItems = [
    { id: Tab.DASHBOARD, label: 'Home', icon: Home },
    { id: Tab.CHORES, label: 'Chores', icon: CheckSquare },
    { id: Tab.REDEEM, label: 'Rewards', icon: Gift },
    { id: Tab.FAMILY, label: 'Family', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-24 md:pb-0 relative overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
         <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-blue-100 rounded-full blur-3xl opacity-60"></div>
         <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-purple-100 rounded-full blur-3xl opacity-60"></div>
         <div className="absolute -bottom-[10%] left-[20%] w-[60%] h-[60%] bg-green-50 rounded-full blur-3xl opacity-60"></div>
      </div>

      <main className="max-w-2xl mx-auto min-h-screen relative flex flex-col">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-50 md:hidden pb-safe">
        <div className="flex justify-around items-center px-2 py-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 ${
                  isActive ? 'text-blue-600 bg-blue-50 scale-105' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-[10px] mt-1 font-medium ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop Sidebar (Optional - keeps it centered on desktop like mobile) */}
      <div className="hidden md:block fixed left-0 top-0 h-full w-64 p-6 border-r border-gray-200 bg-white/80 backdrop-blur-xl">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-8">
          ChoreChampion
        </h1>
        <nav className="space-y-2">
          {navItems.map((item) => {
             const Icon = item.icon;
             const isActive = activeTab === item.id;
             return (
               <button
                 key={item.id}
                 onClick={() => onTabChange(item.id)}
                 className={`flex items-center w-full px-4 py-3 rounded-xl transition-all ${
                   isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-600 hover:bg-gray-100'
                 }`}
               >
                 <Icon size={20} className="mr-3" />
                 <span className="font-medium">{item.label}</span>
               </button>
             );
          })}
        </nav>
      </div>
    </div>
  );
};
