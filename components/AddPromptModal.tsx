
import React, { useState, useRef } from 'react';
import { X, Type, Globe, Tag, Plus, Save, Image as ImageIcon, Sparkles, Loader2, Trash2 } from 'lucide-react';
import { compressImage } from '../utils/imageUtils';
import { translatePrompt } from '../services/geminiService';

interface AddPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (original: string, translated: string, theme: string, image?: string) => void;
  existingThemes?: string[];
}

const AddPromptModal: React.FC<AddPromptModalProps> = ({ isOpen, onClose, onAdd, existingThemes = [] }) => {
  const [original, setOriginal] = useState('');
  const [translated, setTranslated] = useState('');
  const [theme, setTheme] = useState('General');
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const compressed = await compressImage(e.target.files[0]);
        setImage(compressed);
      } catch (err) {
        setError("Failed to process image.");
      }
    }
  };

  const handleAutoTranslate = async () => {
    if (!original.trim() && !translated.trim()) {
        setError("Please enter text in either field to auto-translate.");
        return;
    }

    setIsTranslating(true);
    setError(null);

    try {
        // Decide what to translate
        let sourceText = "";
        if (original.trim() && !translated.trim()) {
            sourceText = original;
        } else if (!original.trim() && translated.trim()) {
            sourceText = translated;
        } else {
            // Both exist, maybe just re-translate original? Let's default to translating original
             sourceText = original;
        }

        const result = await translatePrompt(sourceText);
        
        // Fill in the blanks
        if (!original.trim()) setOriginal(result.segments.map(s => s.original).join(' '));
        if (!translated.trim()) setTranslated(result.segments.map(s => s.translated).join(', '));

        // If we had one, update the other specifically based on the result
        if (sourceText === original) {
             setTranslated(result.segments.map(s => s.translated).join(', '));
        } else {
             setOriginal(result.segments.map(s => s.original).join(' '));
        }

    } catch (err) {
        console.error(err);
        setError("Auto-translation failed. Check your API key or connection.");
    } finally {
        setIsTranslating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!original.trim() || !translated.trim()) {
      setError("Both Original and Translated text are required.");
      return;
    }
    
    onAdd(original, translated, theme || 'General', image || undefined);
    
    // Reset and close
    setOriginal('');
    setTranslated('');
    setImage(null);
    setTheme('General');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2 text-indigo-600">
            <div className="p-1.5 bg-indigo-100 rounded-lg">
                <Plus size={18} />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Add New Prompt</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Image Upload Section */}
            <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
                    <ImageIcon size={14} /> Reference Image (Optional)
                </label>
                
                {image ? (
                    <div className="relative w-full h-48 rounded-xl overflow-hidden border border-slate-200 group">
                        <img src={image} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                            type="button"
                            onClick={() => setImage(null)}
                            className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-full transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ) : (
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-24 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-500 hover:bg-slate-50 transition-all cursor-pointer"
                    >
                        <ImageIcon size={24} className="mb-1" />
                        <span className="text-xs font-medium">Click to upload image</span>
                        <input 
                            ref={fileInputRef}
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleImageUpload}
                        />
                    </div>
                )}
            </div>

            {/* Original Text */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
                <Type size={14} /> Original Text
              </label>
              <textarea
                value={original}
                onChange={(e) => setOriginal(e.target.value)}
                className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 text-sm min-h-[80px] resize-y"
                placeholder="e.g., 一只赛博朋克风格的猫..."
              />
            </div>

            {/* Auto Translate Button */}
            <div className="flex justify-center">
                <button
                    type="button"
                    onClick={handleAutoTranslate}
                    disabled={isTranslating}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-bold rounded-full transition-colors"
                >
                    {isTranslating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    Auto-Fill / Translate
                </button>
            </div>

            {/* Translated Text */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
                <Globe size={14} /> Translated / English
              </label>
              <textarea
                value={translated}
                onChange={(e) => setTranslated(e.target.value)}
                className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 text-sm min-h-[80px] resize-y font-mono bg-slate-50/50"
                placeholder="e.g., A cyberpunk style cat..."
              />
            </div>

            {/* Theme */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
                <Tag size={14} /> Theme / Tag
              </label>
              <div className="flex flex-col gap-2">
                <input
                    type="text"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 text-sm"
                    placeholder="e.g., Character, Environment"
                />
                {existingThemes.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {existingThemes.map(t => (
                            <button
                                type="button"
                                key={t}
                                onClick={() => setTheme(t)}
                                className={`text-[10px] px-2 py-1 rounded-md border transition-colors ${theme === t ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-indigo-300'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                )}
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-500 font-medium bg-red-50 p-2 rounded-lg border border-red-100">
                {error}
              </p>
            )}

            <div className="pt-2 flex gap-3 shrink-0">
                <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl transition-all active:scale-95 shadow-sm shadow-indigo-200"
                >
                    <Save size={18} />
                    Save Prompt
                </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPromptModal;
