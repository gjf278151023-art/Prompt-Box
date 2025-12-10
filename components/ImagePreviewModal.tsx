
import React from 'react';
import { X, ZoomIn } from 'lucide-react';

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ isOpen, onClose, imageUrl }) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <div 
        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
    >
      <div className="relative max-w-[90vw] max-h-[90vh] flex flex-col items-center justify-center p-2">
        <button 
            onClick={onClose}
            className="absolute -top-12 right-0 md:-right-12 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
        >
            <X size={24} />
        </button>
        
        <img 
            src={imageUrl} 
            alt="Full size preview" 
            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()} 
        />
        
        <div className="mt-4 text-white/50 text-xs flex items-center gap-2">
            Click outside to close
        </div>
      </div>
    </div>
  );
};

export default ImagePreviewModal;
