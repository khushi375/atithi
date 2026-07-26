import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  isArchiving?: boolean; // If true, custom styling for archiving completed booking
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Delete",
  message = "Are you sure you want to delete this item?",
  isArchiving = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-luxury-900 border border-slate-200 dark:border-luxury-800 rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden relative animate-slide-up">
        
        {/* Close icon */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 text-center">
          {/* Warning Icon */}
          <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
            isArchiving 
              ? 'bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800' 
              : 'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800'
          }`}>
            <AlertTriangle className={`w-6 h-6 ${isArchiving ? 'text-indigo-600 dark:text-indigo-400' : 'text-red-650 dark:text-red-400'}`} />
          </div>

          {/* Title & Message */}
          <h3 className="font-serif text-lg font-bold text-slate-800 dark:text-white mb-2">
            {isArchiving ? "Confirm Archive" : title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed px-2 mb-6">
            {isArchiving ? "This completed booking is a business record. It will be archived instead of deleted." : message}
          </p>

          {/* Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-luxury-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-luxury-850 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold text-white shadow transition ${
                isArchiving 
                  ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700' 
                  : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-650 hover:to-red-700'
              }`}
            >
              {isArchiving ? "Archive" : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
