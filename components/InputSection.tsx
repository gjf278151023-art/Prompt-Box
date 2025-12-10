import React from 'react';
import { ArrowRightLeft, Loader2, X } from 'lucide-react';

interface InputSectionProps {
  input: string;
  setInput: (value: string) => void;
  onTranslate: () => void;
  isLoading: boolean;
  onClear: () => void;
}

const InputSection: React.FC<InputSectionProps> = ({ 
  input, 
  setInput, 
  onTranslate, 
  isLoading,
  onClear
}) => {
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      if (input.trim() && !isLoading) {
        onTranslate();
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Original Prompt</span>
        {input && (
          <button 
            onClick={onClear}
            className="text-slate-400 hover:text-red-500 transition-colors p-1"
            title="Clear input"
          >
            <X size={16} />
          </button>
        )}
      </div>
      
      <div className="relative flex-grow">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter Chinese or English prompt here..."
          className="w-full h-64 md:h-80 p-5 resize-none focus:outline-none text-slate-800 placeholder-slate-400 text-lg leading-relaxed font-mono"
          spellCheck={false}
        />
        
        <div className="absolute bottom-4 right-4">
          <button
            onClick={onTranslate}
            disabled={!input.trim() || isLoading}
            className={`
              flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold shadow-lg transition-all transform hover:scale-105 active:scale-95
              ${!input.trim() || isLoading 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
              }
            `}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Translating...</span>
              </>
            ) : (
              <>
                <ArrowRightLeft className="w-5 h-5" />
                <span>Translate</span>
              </>
            )}
          </button>
        </div>
      </div>
      
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-xs text-slate-400 text-right">
        Press Cmd+Enter to translate
      </div>
    </div>
  );
};

export default InputSection;