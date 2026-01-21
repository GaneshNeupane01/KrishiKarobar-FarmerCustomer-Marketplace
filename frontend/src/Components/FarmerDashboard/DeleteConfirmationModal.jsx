import React from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';

export default function DeleteConfirmationModal({ open, onClose, onConfirm, count, productName }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 animate-fade-in-up">
      <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-rose-200 w-full max-w-md p-8 animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-rose-100 transition-colors"><X className="w-6 h-6 text-rose-500" /></button>
        <div className="flex flex-col items-center text-center">
          <AlertTriangle className="w-12 h-12 text-rose-500 mb-2" />
          <h2 className="text-xl font-bold text-rose-700 mb-2">Confirm Delete</h2>
          <div className="text-gray-700 mb-4">
            {count ? (
              <>Are you sure you want to delete <span className="font-semibold text-rose-600">{count} products</span>? This action cannot be undone.</>
            ) : (
              <>Are you sure you want to delete <span className="font-semibold text-rose-600">{productName}</span>? This action cannot be undone.</>
            )}
          </div>
          <div className="flex gap-4 justify-center mt-2">
            <button onClick={onClose} className="px-4 py-2 rounded-full bg-gray-100 text-gray-600 font-semibold hover:bg-gray-200 transition-all">Cancel</button>
            <button onClick={async () => { await onConfirm(); }} className="px-6 py-2 rounded-full bg-gradient-to-r from-rose-500 to-rose-700 text-white font-semibold shadow hover:scale-105 transition-all flex items-center gap-2">
              <Trash2 className="w-5 h-5" /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 