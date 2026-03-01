import { BiX } from 'react-icons/bi';

interface DialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function Dialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
  onConfirm,
  onCancel,
}: DialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-lg shadow-lg max-w-sm w-full mx-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-notion-text">{title}</h2>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-notion-bg-darker rounded transition-colors"
          >
            <BiX className="w-5 h-5 text-notion-text-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 bg-slate-100">
          <p className="text-notion-text-secondary">{message}</p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-500">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-notion-text bg-notion-bg-darker rounded-lg hover:bg-notion-border transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-light text-white rounded-lg transition-colors ${
              isDangerous
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-notion-accent hover:bg-notion-text'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
