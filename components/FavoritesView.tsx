
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { FavoriteItem } from '../types';
import { Copy, Trash2, Tag, Search, Check, X, Plus, Download, Settings, Maximize2, FileSpreadsheet, FileCode, ChevronDown } from 'lucide-react';
import AddPromptModal from './AddPromptModal';
import ThemeManagerModal from './ThemeManagerModal';
import EditItemThemeModal from './EditItemThemeModal';
import ImagePreviewModal from './ImagePreviewModal';

interface FavoritesViewProps {
  favorites: FavoriteItem[];
  onRemove: (id: string) => void;
  onUpdateTheme: (id: string, theme: string) => void;
  onRenameTheme: (oldTheme: string, newTheme: string) => void;
  onAdd: (original: string, translated: string, theme: string, image?: string) => void;
}

type SortType = 'time_desc' | 'time_asc' | 'az';

const FavoritesView: React.FC<FavoritesViewProps> = ({ favorites, onRemove, onUpdateTheme, onRenameTheme, onAdd }) => {
  const [sortType, setSortType] = useState<SortType>('time_desc');
  const [selectedTheme, setSelectedTheme] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isThemeManagerOpen, setIsThemeManagerOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  
  // Image Preview State
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Export Menu State
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Click outside to close export menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Extract unique themes
  const themes = useMemo(() => {
    const allThemes = favorites.map(f => f.theme);
    return ['All', ...Array.from(new Set(allThemes))].filter(Boolean);
  }, [favorites]);

  const uniqueThemesOnly = useMemo(() => {
     return Array.from(new Set(favorites.map(f => f.theme)));
  }, [favorites]);

  // Filter and Sort
  const processedFavorites = useMemo(() => {
    let result = [...favorites];

    // Search Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(f => 
        f.original.toLowerCase().includes(query) || 
        f.translated.toLowerCase().includes(query) ||
        f.theme.toLowerCase().includes(query)
      );
    }

    // Theme Filter
    if (selectedTheme !== 'All') {
      result = result.filter(f => f.theme === selectedTheme);
    }

    // Sort
    result.sort((a, b) => {
      if (sortType === 'time_desc') return b.timestamp - a.timestamp;
      if (sortType === 'time_asc') return a.timestamp - b.timestamp;
      if (sortType === 'az') return a.translated.localeCompare(b.translated);
      return 0;
    });

    return result;
  }, [favorites, selectedTheme, sortType, searchQuery]);

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportCSV = () => {
    if (favorites.length === 0) {
        alert("No favorites to export.");
        return;
    }

    const headers = ['Date', 'Time', 'Theme', 'Original Text', 'Translated Text', 'Has Image'];
    const rows = favorites.map(item => {
        const dateObj = new Date(item.timestamp);
        const date = dateObj.toLocaleDateString();
        const time = dateObj.toLocaleTimeString();
        const escape = (text: string) => text ? `"${text.replace(/"/g, '""')}"` : '""';
        
        return [
            escape(date),
            escape(time),
            escape(item.theme),
            escape(item.original),
            escape(item.translated),
            item.image ? "Yes" : "No"
        ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `promptflip_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  const handleExportHTML = () => {
    if (favorites.length === 0) {
      alert("No favorites to export.");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>PromptFlip Collection Export</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; background-color: #f8fafc; color: #334155; }
          .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
          h1 { margin-bottom: 10px; color: #0f172a; }
          .meta { margin-bottom: 30px; color: #64748b; font-size: 0.9em; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; table-layout: fixed; }
          th, td { border-bottom: 1px solid #e2e8f0; padding: 16px; text-align: left; vertical-align: top; }
          th { background-color: #f1f5f9; color: #475569; font-weight: 600; font-size: 0.85em; text-transform: uppercase; letter-spacing: 0.05em; }
          tr:hover { background-color: #f8fafc; }
          .col-img { width: 120px; }
          .col-theme { width: 120px; }
          .col-date { width: 120px; }
          img { width: 100px; height: 100px; object-fit: cover; border-radius: 8px; border: 1px solid #cbd5e1; }
          .theme-tag { display: inline-block; padding: 4px 10px; border-radius: 20px; background: #e0e7ff; color: #4338ca; font-size: 11px; font-weight: 700; text-transform: uppercase; }
          .original { font-style: italic; color: #64748b; margin-bottom: 6px; font-size: 0.9em; }
          .translated { font-weight: 600; color: #1e293b; }
          .timestamp { color: #94a3b8; font-size: 0.85em; }
          .no-img { display: flex; align-items: center; justify-content: center; width: 100px; height: 100px; background: #f1f5f9; border-radius: 8px; color: #cbd5e1; font-size: 0.8em; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>PromptFlip Collection</h1>
          <p class="meta">Generated on ${new Date().toLocaleString()} • ${favorites.length} items</p>
          <table>
            <thead>
              <tr>
                <th class="col-img">Image</th>
                <th class="col-theme">Theme</th>
                <th>Content</th>
                <th class="col-date">Date</th>
              </tr>
            </thead>
            <tbody>
              ${favorites.map(f => `
                <tr>
                  <td>
                    ${f.image 
                      ? `<img src="${f.image}" alt="Reference"/>` 
                      : '<div class="no-img">No Image</div>'
                    }
                  </td>
                  <td><span class="theme-tag">${f.theme}</span></td>
                  <td>
                    <div class="original">${f.original}</div>
                    <div class="translated">${f.translated}</div>
                  </td>
                  <td class="timestamp">${new Date(f.timestamp).toLocaleDateString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `promptflip_report_${new Date().toISOString().slice(0,10)}.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  const getEditingItem = () => {
    if (!editingItemId) return null;
    return favorites.find(f => f.id === editingItemId);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
      {/* Controls Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50 space-y-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 flex-shrink-0">
                    My Collection 
                    <span className="text-xs font-normal text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                    {processedFavorites.length}
                    </span>
                </h2>
                
                <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setIsAddModalOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-full shadow-sm shadow-indigo-200 transition-all active:scale-95"
                    >
                        <Plus size={14} />
                        Add New
                    </button>
                    <button 
                      onClick={() => setIsThemeManagerOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-full transition-all active:scale-95"
                      title="Manage Tags"
                    >
                        <Settings size={14} />
                        Tags
                    </button>
                    
                    {/* Export Dropdown */}
                    <div className="relative" ref={exportMenuRef}>
                      <button 
                        onClick={() => setShowExportMenu(!showExportMenu)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-600 text-xs font-bold rounded-full transition-all active:scale-95 ${showExportMenu ? 'bg-slate-100' : 'bg-white hover:bg-slate-50 hover:text-green-600'}`}
                      >
                          <Download size={14} />
                          Export
                          <ChevronDown size={12} className={`transition-transform duration-200 ${showExportMenu ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {showExportMenu && (
                        <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-30 animate-in fade-in zoom-in duration-200 overflow-hidden">
                          <button 
                            onClick={handleExportCSV}
                            className="w-full text-left px-4 py-3 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2 border-b border-slate-50 transition-colors"
                          >
                            <FileSpreadsheet size={14} className="text-green-600" />
                            CSV File (Excel Data)
                          </button>
                          <button 
                            onClick={handleExportHTML}
                            className="w-full text-left px-4 py-3 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2 transition-colors"
                          >
                            <FileCode size={14} className="text-orange-500" />
                            HTML Report (With Images)
                          </button>
                        </div>
                      )}
                    </div>

                </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
                <div className="relative group w-full sm:w-56">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search prompts..."
                    className="block w-full pl-10 pr-8 py-1.5 border border-slate-200 rounded-lg leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 sm:text-xs transition-all"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                <select 
                    value={sortType}
                    onChange={(e) => setSortType(e.target.value as SortType)}
                    className="text-xs border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-600 focus:ring-2 focus:ring-indigo-100 outline-none border hover:border-slate-300 transition-colors cursor-pointer"
                >
                    <option value="time_desc">Newest First</option>
                    <option value="time_asc">Oldest First</option>
                    <option value="az">A-Z</option>
                </select>
            </div>
        </div>

        <div className="flex flex-wrap gap-2">
            {themes.map(theme => (
                <button
                    key={theme}
                    onClick={() => setSelectedTheme(theme)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide transition-colors border ${
                        selectedTheme === theme 
                        ? 'bg-rose-500 text-white border-rose-500' 
                        : 'bg-white text-slate-500 border-slate-200 hover:border-rose-200 hover:text-rose-500'
                    }`}
                >
                    {theme}
                </button>
            ))}
        </div>
      </div>

      {/* Favorites Grid */}
      <div className="flex-grow overflow-y-auto p-4 custom-scrollbar bg-slate-50/30">
        {processedFavorites.length === 0 ? (
           <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8">
              {searchQuery ? (
                <>
                  <Search className="w-8 h-8 mb-2 opacity-50" />
                  <p>No matches found for "{searchQuery}"</p>
                </>
              ) : (
                <>
                  <Tag className="w-8 h-8 mb-2 opacity-50" />
                  <p>No favorites yet.</p>
                  <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="mt-4 text-indigo-600 font-semibold hover:underline"
                  >
                    Add your first prompt
                  </button>
                </>
              )}
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {processedFavorites.map((item) => (
                  <div key={item.id} className="group bg-white rounded-lg border border-slate-200 hover:shadow-md hover:border-indigo-300 transition-all duration-200 flex flex-col overflow-hidden">
                      
                      {/* Image Preview (Compact) with Zoom Interaction */}
                      {item.image && (
                          <div 
                            className="relative w-full h-32 bg-slate-100 overflow-hidden border-b border-slate-100 cursor-zoom-in group/image"
                            onClick={() => setPreviewImage(item.image!)}
                          >
                              <img src={item.image} alt="Ref" className="w-full h-full object-cover transition-transform duration-500 group-hover/image:scale-105" />
                              <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/20 transition-colors flex items-center justify-center">
                                  <Maximize2 className="text-white opacity-0 group-hover/image:opacity-100 transition-opacity drop-shadow-md" size={20} />
                              </div>
                          </div>
                      )}

                      <div className="p-3 flex flex-col flex-grow">
                        {/* Header: Theme & Date */}
                        <div className="flex justify-between items-start mb-2">
                            <button 
                                onClick={() => setEditingItemId(item.id)}
                                className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md hover:bg-indigo-100 transition-colors"
                            >
                                <Tag size={10} />
                                {item.theme}
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-grow mb-2 space-y-1">
                            <div className="text-slate-400 text-[10px] line-clamp-1 italic">{item.original}</div>
                            <div className="text-slate-800 font-semibold text-xs leading-snug break-words line-clamp-4">{item.translated}</div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-50 mt-auto">
                            <span className="text-[9px] text-slate-300">
                                {new Date(item.timestamp).toLocaleDateString()}
                            </span>
                            <div className="flex items-center gap-1">
                              <button 
                                  onClick={() => handleCopy(`${item.translated} ${item.original}`, item.id)}
                                  className={`p-1.5 rounded-md text-[10px] font-medium flex items-center gap-1 transition-colors ${copiedId === item.id ? 'text-green-600 bg-green-50' : 'text-slate-400 hover:bg-slate-100 hover:text-indigo-600'}`}
                                  title="Copy Prompt"
                              >
                                  {copiedId === item.id ? <Check size={12} /> : <Copy size={12} />}
                              </button>
                              <button 
                                  onClick={() => onRemove(item.id)}
                                  className="p-1.5 rounded-md text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                                  title="Remove"
                              >
                                  <Trash2 size={12} />
                              </button>
                            </div>
                        </div>
                      </div>
                  </div>
              ))}
          </div>
        )}
      </div>
      
      {/* Add Modal */}
      <AddPromptModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={onAdd}
        existingThemes={uniqueThemesOnly}
      />

      {/* Theme Manager Modal */}
      <ThemeManagerModal 
        isOpen={isThemeManagerOpen}
        onClose={() => setIsThemeManagerOpen(false)}
        themes={uniqueThemesOnly}
        onRenameTheme={onRenameTheme}
      />

      {/* Edit Item Theme Modal */}
      {editingItemId && (
        <EditItemThemeModal
          isOpen={true}
          onClose={() => setEditingItemId(null)}
          item={getEditingItem()}
          existingThemes={uniqueThemesOnly}
          onUpdateTheme={onUpdateTheme}
        />
      )}

      {/* Full Screen Image Modal */}
      <ImagePreviewModal 
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
        imageUrl={previewImage}
      />
    </div>
  );
};

export default FavoritesView;
