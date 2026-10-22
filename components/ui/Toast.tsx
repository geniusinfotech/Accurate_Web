'use client'

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react'
import { CheckCircle, AlertCircle, X, Loader2, Info } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info' | 'loading'

interface Toast {
  id: string
  type: ToastType
  title?: string
  message: string
  duration?: number
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, title?: string, duration?: number) => string
  success: (message: string, title?: string, duration?: number) => string
  error: (message: string, title?: string, duration?: number) => string
  info: (message: string, title?: string, duration?: number) => string
  loading: (message: string, title?: string) => string
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

const ICONS: Record<ToastType, { Icon: any; color: string; bg: string }> = {
  success: { Icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  error: { Icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-100' },
  info: { Icon: Info, color: 'text-blue-600', bg: 'bg-blue-100' },
  loading: { Icon: Loader2, color: 'text-charcoal/70', bg: 'bg-charcoal/10' },
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast
  onDismiss: (id: string) => void
}) {
  const { Icon, color, bg } = ICONS[toast.type]
  const isLoading = toast.type === 'loading'

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg animate-in slide-in-from-right-full duration-300 ${isLoading ? 'bg-white' : ''}`}
      role="alert"
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
    >
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${bg} ${color}`}>
        {isLoading ? <Icon size={18} className="animate-spin" /> : <Icon size={18} />}
      </div>
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="font-semibold text-charcoal">{toast.title}</p>
        )}
        <p className="text-charcoal/80 text-sm mt-0.5">{toast.message}</p>
      </div>
      {!isLoading && (
        <button
          onClick={() => onDismiss(toast.id)}
          className="flex-shrink-0 p-1 text-charcoal/40 hover:text-charcoal transition-colors"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      )}
    </div>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', title?: string, duration = 4000) => {
      const id = Math.random().toString(36).substring(2, 9)
      const newToast: Toast = { id, type, title, message, duration }
      setToasts((prev) => [...prev, newToast])

      if (duration > 0 && type !== 'loading') {
        setTimeout(() => dismiss(id), duration)
      }
      return id
    },
    [dismiss]
  )

  const success = useCallback(
    (message: string, title?: string, duration?: number) => showToast(message, 'success', title, duration),
    [showToast]
  )
  const error = useCallback(
    (message: string, title?: string, duration?: number) => showToast(message, 'error', title, duration),
    [showToast]
  )
  const info = useCallback(
    (message: string, title?: string, duration?: number) => showToast(message, 'info', title, duration),
    [showToast]
  )
  const loading = useCallback(
    (message: string, title?: string) => showToast(message, 'loading', title, 0),
    [showToast]
  )

  // Without this memo the context value is a fresh object on every provider
  // render, so any `useEffect(..., [toast])` that fires a toast re-triggers
  // itself forever — the provider re-renders to show the toast, which changes
  // the `toast` identity, which re-runs the effect.
  const value = useMemo(
    () => ({ toast: showToast, success, error, info, loading, dismiss }),
    [showToast, success, error, info, loading, dismiss]
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 w-[360px] max-w-[90vw] pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}