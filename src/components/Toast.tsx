"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastContextType {
  toast: (message: string, type?: Toast["type"]) => void;
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const remove = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const icons = {
    success: <CheckCircle className="w-5 h-5" style={{ color: "#46C78A" }} />,
    error: <XCircle className="w-5 h-5" style={{ color: "#EF6A6A" }} />,
    info: <Info className="w-5 h-5" style={{ color: "#6EA8FE" }} />,
  };

  const borderLeftColors = {
    success: "#46C78A",
    error: "#EF6A6A",
    info: "#6EA8FE",
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-3 pl-4 pr-3 py-3 rounded-lg shadow-lg animate-slide-in"
            style={{ backgroundColor: "#fff", border: "1px solid #ddd", borderLeftWidth: "4px", borderLeftColor: borderLeftColors[t.type] }}
          >
            {icons[t.type]}
            <span className="text-sm flex-1" style={{ color: "#1a1a2e" }}>{t.message}</span>
            <button
              onClick={() => remove(t.id)}
              className="ml-2 hover:text-black transition-colors"
              style={{ color: "#7a6a30" }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
