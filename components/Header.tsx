import React from 'react';
import { Languages, Sparkles, Heart, LayoutGrid, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { ViewType, User } from '../types';

interface HeaderProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setView, user, onOpenAuth, onLogout }) => {
  return (
    <header className="mb-8 flex flex-col items-center relative">
      {/* Auth Controls (Absolute Top Right) */}
      <div className="absolute top-0 right-0 hidden md:flex items-center gap-3">
         {user ? (
            <div className="flex items-center gap-3 bg-white pl-4 pr-2 py-1.5 rounded-full border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                        <UserIcon size={14} />
                    </div>
                    <span className="text-sm font-semibold text-slate-700">{user.username}</span>
                </div>
                <button 
                    onClick={onLogout}
                    className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    title="Sign Out"
                >
                    <LogOut size={16} />
                </button>
            </div>
         ) : (
            <button
                onClick={onOpenAuth}
                className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 text-sm font-semibold rounded-full border border-slate-200 shadow-sm hover:bg-slate-50 hover:text-slate-900 transition-all"
            >
                <LogIn size={16} />
                Sign In
            </button>
         )}
      </div>

      <div className="text-center mb-6 pt-8 md:pt-0">
        <div className="inline-flex items-center justify-center p-3 mb-4 bg-indigo-100 rounded-full text-indigo-600 shadow-sm">
          <Languages className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl mb-2">
          PromptFlip
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Bidirectional AI Prompt Translator.
          <span className="block text-sm mt-1 text-slate-500 font-medium">
            <Sparkles className="w-4 h-4 inline mr-1 text-amber-500" />
            Intelligent English/Chinese Detection & Segmentation
          </span>
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 inline-flex">
            <button
            onClick={() => setView('translator')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                currentView === 'translator'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
            >
            <LayoutGrid className="w-4 h-4" />
            Translator
            </button>
            <button
            onClick={() => setView('favorites')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                currentView === 'favorites'
                ? 'bg-rose-500 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
            >
            <Heart className={`w-4 h-4 ${currentView === 'favorites' ? 'fill-current' : ''}`} />
            My Favorites
            </button>
        </div>

        {/* Mobile Auth Button (Visible only on small screens) */}
        <div className="md:hidden">
            {user ? (
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-600">Hi, {user.username}</span>
                    <button onClick={onLogout} className="text-xs bg-slate-200 px-2 py-1 rounded">Logout</button>
                </div>
            ) : (
                <button onClick={onOpenAuth} className="text-sm font-semibold text-indigo-600 hover:underline">
                    Sign In / Register
                </button>
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;