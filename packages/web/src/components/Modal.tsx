import React from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="min-h-full flex items-start sm:items-center justify-center p-3 sm:p-4 lg:p-6">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[94vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
          <div className="flex items-center justify-between p-5 sm:p-6 border-b">
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 min-h-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
