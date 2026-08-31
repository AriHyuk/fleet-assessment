import { useEffect, useRef, ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
}

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }: ModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onMouseDown={(e: React.MouseEvent) => { if (e.target === backdropRef.current) onClose(); }}
    >
      <div className={`animate-modal w-full ${maxWidth} bg-[#111827] border border-white/8 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/8">
          <h2 className="text-[#f0f6ff] font-bold text-base">{title}</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/5 text-[#8b9bb4] hover:bg-red-500/15 hover:text-red-400 transition-all flex items-center justify-center cursor-pointer border-none"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
