import { useEffect, useState } from 'react';
import { BiCheckCircle, BiErrorCircle, BiInfoCircle, BiX } from 'react-icons/bi';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastProps {
  message: ToastMessage;
  onClose: (id: string) => void;
}

function Toast({ message, onClose }: ToastProps) {
  useEffect(() => {
    if (message.duration !== 0) {
      const timer = setTimeout(() => {
        onClose(message.id);
      }, message.duration || 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  const icons = {
    success: <BiCheckCircle className="w-5 h-5 text-green-600" />,
    error: <BiErrorCircle className="w-5 h-5 text-red-600" />,
    info: <BiInfoCircle className="w-5 h-5 text-slate-600" />,
    warning: <BiErrorCircle className="w-5 h-5 text-amber-600" />,
  };

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-slate-50 border-slate-200',
    warning: 'bg-amber-50 border-amber-200',
  };

  const textColors = {
    success: 'text-green-800',
    error: 'text-red-800',
    info: 'text-slate-800',
    warning: 'text-amber-800',
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${bgColors[message.type]} ${textColors[message.type]} animate-in fade-in slide-in-from-top-2 duration-200`}
    >
      {icons[message.type]}
      <span className="flex-1 text-sm font-medium">{message.message}</span>
      <button
        onClick={() => onClose(message.id)}
        className="flex-shrink-0 hover:opacity-70 transition-opacity"
      >
        <BiX className="w-5 h-5" />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  messages: ToastMessage[];
  onClose: (id: string) => void;
}

export function ToastContainer({ messages, onClose }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {messages.map((message) => (
        <Toast key={message.id} message={message} onClose={onClose} />
      ))}
    </div>
  );
}

export function useToast() {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const addToast = (type: ToastType, message: string, duration?: number) => {
    const id = Math.random().toString(36).substr(2, 9);
    setMessages((prev) => [...prev, { id, type, message, duration }]);
  };

  const removeToast = (id: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  };

  return {
    messages,
    addToast,
    removeToast,
    success: (msg: string, duration?: number) => addToast('success', msg, duration),
    error: (msg: string, duration?: number) => addToast('error', msg, duration),
    info: (msg: string, duration?: number) => addToast('info', msg, duration),
    warning: (msg: string, duration?: number) => addToast('warning', msg, duration),
  };
}
