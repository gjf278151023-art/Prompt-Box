import React, { useState } from 'react';
import { TranslationResult, TranslationSegment, FavoriteItem } from '../types';
import { Copy, Check, Sparkles, Layers, Type, FileText, Heart } from 'lucide-react';

interface OutputSectionProps {
  result: TranslationResult | null;
  favorites: FavoriteItem[];
  onToggleFavorite: (segment: TranslationSegment) => void;
}

const OutputSection: React.FC<OutputSectionProps> = ({ result, favorites, onToggleFavorite }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copyMode, setCopyMode] = useState<'translated' | 'both'>('both');

  if (!result) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 min-h-[300px]">
        <Sparkles className="w-12 h-12 mb-4 text-slate-300" />
        <h3 className="text-lg font-medium text-slate-500 mb-1">Ready to Translate</h3>
        <p className="max-w-xs text-sm">Enter your prompt on the left. AI will align Chinese and English segments for easy selection.</p>
      </div>
    );
  }

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSegmentClick = (segment: TranslationSegment, e: React.MouseEvent) => {
    // Prevent copy if clicking buttons inside
    if ((e.target as HTMLElement).closest('button.action-btn')) return;

    if (copyMode === 'translated') {
      handleCopy(segment.translated, segment.id);
    } else {
      handleCopy(`${segment.translated} ${segment.original}`, segment.id);
    }
  };

  const handleCopyTranslatedOnly = () => {
    const allText = result.segments.map(s => s.translated).join(', ');
    handleCopy(allText, 'all-translated');
  };

  const handleCopyBilingual = () => {
    const allText = result.segments.map(s => `${s.translated} ${s.original}`).join('\n');
    handleCopy(allText, 'all-bilingual');
  };

  const isFavorite = (segment: TranslationSegment) => {
    return favorites.some(f => f.translated === segment.translated);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header / Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
             {result.sourceLanguage} <span className="text-slate-400">↔</span> {result.targetLanguage}
          </span>
        </div>

        {/* Chip Interaction Mode Toggle */}
        <div className="flex items-center gap-1 bg-slate-200/50 p-1 rounded-lg">
           <button
             onClick={() => setCopyMode('translated')}
             className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${copyMode === 'translated' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             title="Clicking a segment copies only the translation"
           >
             <Type className="w-3.5 h-3.5" />
             Translation
           </button>
           <button
             onClick={() => setCopyMode('both')}
             className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${copyMode === 'both' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             title="Clicking a segment copies both languages"
           >
             <Layers className="w-3.5 h-3.5" />
             Pair
           </button>
        </div>
      </div>

      {/* Grid of Prompt Chips */}
      <div className="flex-grow overflow-y-auto p-4 custom-scrollbar bg-slate-50/30">
        <div className="flex flex-wrap content-start gap-3">
          {result.segments.map((segment: TranslationSegment) => {
            const favorited = isFavorite(segment);
            return (
              <div
                key={segment.id}
                onClick={(e) => handleSegmentClick(segment, e)}
                className={`
                  group relative flex flex-col items-start text-left cursor-pointer
                  p-3 pr-8 rounded-xl border transition-all duration-200
                  max-w-full md:max-w-[48%] lg:max-w-full xl:max-w-[48%] flex-grow
                  ${copiedId === segment.id 
                    ? 'bg-green-50 border-green-200 ring-2 ring-green-100' 
                    : 'bg-white border-slate-200 hover:border-indigo-300 hover:ring-2 hover:ring-indigo-100 hover:shadow-md'
                  }
                `}
              >
                <span className="text-slate-400 text-xs font-medium mb-1 line-clamp-1 select-none">
                  {segment.original}
                </span>
                <span className="text-slate-800 text-base font-semibold leading-tight break-words w-full">
                  {segment.translated}
                </span>
                
                {/* Action Buttons */}
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                   {/* Favorite Button */}
                   <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(segment);
                    }}
                    className={`action-btn p-1 rounded-full transition-all duration-200 hover:scale-110 ${favorited ? 'text-rose-500 bg-rose-50' : 'text-slate-300 hover:text-rose-400 bg-transparent'}`}
                    title={favorited ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Heart size={16} className={favorited ? "fill-current" : ""} />
                  </button>

                  {/* Copy Feedback Icon */}
                  <div className={`
                    p-1 rounded-full transition-all duration-200 flex items-center justify-center
                    ${copiedId === segment.id ? 'opacity-100 text-green-600' : 'opacity-0'}
                  `}>
                    <Check size={16} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Footer Actions - Bulk Copy */}
      <div className="px-4 py-3 bg-white border-t border-slate-100 flex gap-3">
        <button
          onClick={handleCopyTranslatedOnly}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors active:scale-95"
        >
          {copiedId === 'all-translated' ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
          {copiedId === 'all-translated' ? 'Copied!' : 'Copy AI Prompt'}
        </button>
        
        <button
          onClick={handleCopyBilingual}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg border border-slate-200 transition-colors active:scale-95"
        >
          {copiedId === 'all-bilingual' ? <Check className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
          {copiedId === 'all-bilingual' ? 'Copied!' : 'Copy Bilingual'}
        </button>
      </div>
    </div>
  );
};

export default OutputSection;