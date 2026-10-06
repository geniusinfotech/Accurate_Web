'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { AlertTriangle, CheckCircle, Info, XCircle, X } from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

type DialogType = 'info' | 'success' | 'error' | 'warning' | 'confirm'

interface DialogOptions {
  type?: DialogType
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
}

interface DialogContextType {
  alert: (message: string, type?: Omit<DialogType, 'confirm'>) => Promise<void>
  confirm: (message: string, title?: string) => Promise<boolean>
}

// ─── Context ─────────────────────────────────────────────────────────────────

const DialogContext = createContext<DialogContextType | null>(null)

// ─── Provider ────────────────────────────────────────────────────────────────

interface ActiveDialog extends DialogOptions {
  resolve: (value: boolean) => void
}

export function DialogProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<ActiveDialog | null>(null)

  const showDialog = useCallback((opts: DialogOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialog({ ...opts, resolve })
    })
  }, [])

  const handleClose = (result: boolean) => {
    dialog?.resolve(result)
    setDialog(null)
  }

  const alert = useCallback(
    (message: string, type: Omit<DialogType, 'confirm'> = 'info') =>
      showDialog({ type: type as DialogType, message, confirmLabel: 'OK' }).then(() => {}),
    [showDialog],
  )

  const confirm = useCallback(
    (message: string, title?: string) =>
      showDialog({ type: 'confirm', message, title, confirmLabel: 'Confirm', cancelLabel: 'Cancel' }),
    [showDialog],
  )

  return (
    <DialogContext.Provider value={{ alert, confirm }}>
      {children}
      {dialog && <DialogModal dialog={dialog} onClose={handleClose} />}
    </DialogContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useDialog() {
  const ctx = useContext(DialogContext)
  if (!ctx) throw new Error('useDialog must be used within a DialogProvider')
  return ctx
}

// ─── Modal UI ─────────────────────────────────────────────────────────────────

const iconMap: Record<DialogType, { Icon: any; color: string; bg: string }> = {
  info:    { Icon: Info,          color: 'text-burgundy',  bg: 'bg-burgundy/10' },
  success: { Icon: CheckCircle,   color: 'text-emerald',   bg: 'bg-emerald/10' },
  error:   { Icon: XCircle,       color: 'text-rose-gold', bg: 'bg-rose-gold/10' },
  warning: { Icon: AlertTriangle, color: 'text-gold-deep', bg: 'bg-gold/15' },
  confirm: { Icon: AlertTriangle, color: 'text-gold-deep', bg: 'bg-gold/15' },
}

function DialogModal({
  dialog,
  onClose,
}: {
  dialog: ActiveDialog
  onClose: (result: boolean) => void
}) {
  const type = dialog.type ?? 'info'
  const { Icon, color, bg } = iconMap[type]
  const isConfirm = type === 'confirm'

  const confirmBtnClass = isConfirm
    ? 'bg-burgundy hover:bg-burgundy/90 text-white'
    : 'bg-gold hover:bg-gold/90 text-brand-950 font-semibold'

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 safe-pb"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
        onClick={() => !isConfirm && onClose(false)}
      />

      {/* Card */}
      <div data-lenis-prevent className="relative z-10 w-full max-w-md md:max-w-lg bg-white rounded-2xl shadow-2xl border border-border-gray overflow-hidden animate-in zoom-in-95 fade-in duration-200 max-h-[90dvh] overflow-y-auto">
        {/* Close btn (non-confirm) */}
        {!isConfirm && (
          <button
            onClick={() => onClose(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full text-charcoal/40 hover:text-charcoal hover:bg-light-gray transition-colors"
          >
            <X size={16} />
          </button>
        )}

        <div className="p-8">
          {/* Icon */}
          <div className={`w-14 h-14 rounded-full ${bg} flex items-center justify-center mx-auto mb-5`}>
            <Icon size={26} className={color} />
          </div>

          {/* Title */}
          {dialog.title && (
            <h3 className="font-serif text-xl font-semibold text-charcoal text-center mb-2">
              {dialog.title}
            </h3>
          )}

          {/* Message */}
          <p className="text-charcoal/70 text-sm text-center leading-relaxed">
            {dialog.message}
          </p>
        </div>

        {/* Actions */}
        <div className={`px-8 pb-7 flex gap-3 ${isConfirm ? 'flex-row-reverse' : 'justify-center'}`}>
          <button
            autoFocus
            onClick={() => onClose(true)}
            className={`flex-1 py-2.5 px-6 rounded-lg text-sm font-semibold transition-all duration-200 ${confirmBtnClass}`}
          >
            {dialog.confirmLabel ?? 'OK'}
          </button>
          {isConfirm && (
            <button
              onClick={() => onClose(false)}
              className="flex-1 py-2.5 px-6 rounded-lg text-sm font-semibold border border-border-gray text-charcoal hover:bg-light-gray transition-colors"
            >
              {dialog.cancelLabel ?? 'Cancel'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
