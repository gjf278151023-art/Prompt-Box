
import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import InputSection from './components/InputSection';
import OutputSection from './components/OutputSection';
import FavoritesView from './components/FavoritesView';
import AuthModal from './components/AuthModal';
import { translatePrompt } from './services/geminiService';
import { TranslationResult, LoadingState, ViewType, FavoriteItem, TranslationSegment, User } from './types';
import { AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<ViewType>('translator');
  const [input, setInput] = useState<string>('');
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Favorites State
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  
  // CRITICAL: Ref to track which user's data is currently loaded in the state.
  // This prevents the 'Save' effect from overwriting data before the 'Load' effect completes.
  const loadedUserIdRef = useRef<string | null>(null);

  // 1. Initialize Session on Mount
  useEffect(() => {
    const storedUser = localStorage.getItem('promptflip_session_user');
    if (storedUser) {
        try {
            setUser(JSON.parse(storedUser));
        } catch(e) { console.error(e); }
    }
  }, []);

  // 2. Load Favorites whenever User changes
  useEffect(() => {
    const currentUserId = user ? user.id : 'guest';
    const storageKey = user ? `promptflip_favorites_${user.id}` : 'promptflip_favorites_guest';
    
    // Attempt to load
    const storedFavs = localStorage.getItem(storageKey);
    let loadedData: FavoriteItem[] = [];
    
    if (storedFavs) {
      try {
        loadedData = JSON.parse(storedFavs);
      } catch (e) {
        console.error("Failed to parse favorites", e);
        // Fallback: don't overwrite corrupt data immediately, maybe backup? 
        // For simplicity, we assume empty if corrupt, but real app might want safeguard.
      }
    }

    // Update state
    setFavorites(loadedData);
    
    // Mark this user as fully loaded
    loadedUserIdRef.current = currentUserId;
    
  }, [user]);

  // 3. Save Favorites whenever Favorites state changes
  useEffect(() => {
    const currentUserId = user ? user.id : 'guest';
    
    // GUARD: Only save if the data in state actually belongs to the current user
    if (loadedUserIdRef.current !== currentUserId) {
        return; 
    }

    const storageKey = user ? `promptflip_favorites_${user.id}` : 'promptflip_favorites_guest';
    
    try {
        localStorage.setItem(storageKey, JSON.stringify(favorites));
    } catch (e) {
        console.error("Storage limit reached?", e);
        setError("Storage limit reached. Try deleting some items or using smaller images.");
    }
  }, [favorites, user]);

  // Auth Handlers
  const handleLogin = async (username: string) => {
    // Mock login logic
    const mockUser: User = {
        id: `user-${username.toLowerCase().replace(/\s+/g, '-')}`,
        username: username
    };
    
    // Save session
    localStorage.setItem('promptflip_session_user', JSON.stringify(mockUser));
    setUser(mockUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('promptflip_session_user');
    setUser(null);
    setView('translator');
    // We don't need to manually clear favorites here, the useEffect[user] will handle switching to guest data
  };

  // Translation Handlers
  const handleTranslate = async () => {
    if (!input.trim()) return;

    setLoadingState(LoadingState.LOADING);
    setError(null);
    setResult(null);

    try {
      const data = await translatePrompt(input);
      setResult(data);
      setLoadingState(LoadingState.SUCCESS);
    } catch (err) {
      console.error(err);
      setError("Failed to translate. Please check your connection or API key and try again.");
      setLoadingState(LoadingState.ERROR);
    }
  };

  const handleClear = () => {
    setInput('');
    setResult(null);
    setError(null);
    setLoadingState(LoadingState.IDLE);
  };

  // Favorites Handlers
  const handleToggleFavorite = (segment: TranslationSegment) => {
    const exists = favorites.find(f => f.translated === segment.translated);
    
    if (exists) {
      // Remove
      setFavorites(prev => prev.filter(f => f.translated !== segment.translated));
    } else {
      // Add
      const newItem: FavoriteItem = {
        id: `fav-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        original: segment.original,
        translated: segment.translated,
        timestamp: Date.now(),
        theme: 'General'
      };
      setFavorites(prev => [newItem, ...prev]);
    }
  };

  // Add Manual Favorite with optional image
  const handleManualAddFavorite = (original: string, translated: string, theme: string, image?: string) => {
    const newItem: FavoriteItem = {
        id: `manual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        original,
        translated,
        timestamp: Date.now(),
        theme,
        image
    };
    setFavorites(prev => [newItem, ...prev]);
  };

  const handleRemoveFavorite = (id: string) => {
    setFavorites(prev => prev.filter(f => f.id !== id));
  };

  const handleUpdateTheme = (id: string, theme: string) => {
    setFavorites(prev => prev.map(f => f.id === id ? { ...f, theme } : f));
  };

  // Bulk rename theme
  const handleRenameTheme = (oldTheme: string, newTheme: string) => {
    setFavorites(prev => prev.map(f => f.theme === oldTheme ? { ...f, theme: newTheme } : f));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Header 
            currentView={view} 
            setView={setView} 
            user={user}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onLogout={handleLogout}
        />

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-2 max-w-4xl mx-auto">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* View Switcher */}
        {view === 'translator' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-auto lg:h-[600px]">
            {/* Left Column: Input */}
            <div className="h-[400px] lg:h-full">
              <InputSection 
                input={input}
                setInput={setInput}
                onTranslate={handleTranslate}
                isLoading={loadingState === LoadingState.LOADING}
                onClear={handleClear}
              />
            </div>

            {/* Right Column: Output */}
            <div className="h-[400px] lg:h-full">
              <OutputSection 
                result={result} 
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
              />
            </div>
          </div>
        ) : (
          <div className="h-[700px]">
            <FavoritesView 
              favorites={favorites}
              onRemove={handleRemoveFavorite}
              onUpdateTheme={handleUpdateTheme}
              onRenameTheme={handleRenameTheme}
              onAdd={handleManualAddFavorite}
            />
          </div>
        )}
        
        <div className="mt-12 text-center">
            <p className="text-slate-400 text-sm">
                Powered by Gemini 2.5 Flash • Optimized for Prompt Engineering
            </p>
        </div>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onLogin={handleLogin}
      />
    </div>
  );
};

export default App;
