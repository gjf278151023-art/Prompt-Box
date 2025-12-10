
import React, { useState } from 'react';
import { X, Tag, Check, Save } from 'lucide-react';
import { FavoriteItem } from '../types';

interface EditItemThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: FavoriteItem | null | undefined;
  existingThemes: string[];
  onUpdateTheme: (id: string, theme: string) => void;
}

const EditItemThemeModal: React.FC<EditItemThemeModalProps> = ({ isOpen, onClose, item, existingThemes, onUpdateTheme }) => {
  const [selectedTheme, setSelectedTheme] = useState(item?.theme || '');
  
  if (!isOpen || !item) return null;

  const handleSave = () => {
    if (selectedTheme.trim()) {
      onUpdateTheme(item.id, selectedTheme.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
        <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Tag size={16} className="text-indigo-600" />
            Categorize Prompt
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
           <div className="mb-4">
               <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Selected Tag</label>
               <input
                 type="text"
                 value={selectedTheme}
                 onChange={(e) => setSelectedTheme(e.target.value)}
                 className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                 placeholder="Type or select a tag..."
                 autoFocus
                 onKeyDown={(e) => e.key === 'Enter' && handleSave()}
               />
           </div>

           <div className="space-y-2">
               <label className="block text-xs font-semibold text-slate-500 uppercase">Quick Select</label>
               <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
                   {existingThemes.map(theme => (
                       <button
                         key={theme}
                         onClick={() => setSelectedTheme(theme)}
                         className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                             selectedTheme === theme 
                             ? 'bg-indigo-600 text-white border-indigo-600' 
                             : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                         }`}
                       >
                           {theme}
                       </button>
                   ))}
               </div>
           </div>

           <div className="mt-6 flex justify-end">
               <button
                 onClick={handleSave}
                 className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
               >
                   <Save size={16} />
                   Save Changes
               </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default EditItemThemeModal;
