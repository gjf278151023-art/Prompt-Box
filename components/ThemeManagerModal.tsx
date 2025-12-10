
import React, { useState } from 'react';
import { X, Tag, Edit2, Check, LayoutGrid } from 'lucide-react';

interface ThemeManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  themes: string[];
  onRenameTheme: (oldTheme: string, newTheme: string) => void;
}

const ThemeManagerModal: React.FC<ThemeManagerModalProps> = ({ isOpen, onClose, themes, onRenameTheme }) => {
  const [editingTheme, setEditingTheme] = useState<string | null>(null);
  const [newThemeName, setNewThemeName] = useState('');

  if (!isOpen) return null;

  const startEditing = (theme: string) => {
    setEditingTheme(theme);
    setNewThemeName(theme);
  };

  const saveEdit = () => {
    if (editingTheme && newThemeName.trim() && newThemeName !== editingTheme) {
      onRenameTheme(editingTheme, newThemeName.trim());
    }
    setEditingTheme(null);
    setNewThemeName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-2 text-indigo-600">
            <LayoutGrid size={18} />
            <h2 className="text-lg font-bold text-slate-800">Manage Tags</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          {themes.length === 0 ? (
            <div className="text-center text-slate-400 py-8">
              No tags created yet.
            </div>
          ) : (
            <div className="space-y-2">
              {themes.map(theme => (
                <div key={theme} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-slate-50 transition-colors">
                  {editingTheme === theme ? (
                    <div className="flex items-center gap-2 flex-grow">
                      <input
                        type="text"
                        value={newThemeName}
                        onChange={(e) => setNewThemeName(e.target.value)}
                        className="flex-grow px-3 py-1.5 border border-indigo-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                      />
                      <button 
                        onClick={saveEdit}
                        className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      >
                        <Check size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-md">
                          <Tag size={14} />
                        </div>
                        <span className="text-sm font-semibold text-slate-700">{theme}</span>
                      </div>
                      <button 
                        onClick={() => startEditing(theme)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500">
            Tip: Renaming a tag to an existing tag name will merge them.
        </div>
      </div>
    </div>
  );
};

export default ThemeManagerModal;
