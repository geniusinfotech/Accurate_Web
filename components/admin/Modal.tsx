"use client";

import { ReactNode, useEffect, useRef } from "react";
import { X, Loader2 } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  title: string;
  /** Small muted line under the title. */
  subtitle?: string;
  onClose: () => void;
  onSubmit?: () => void;
  children: ReactNode;
  submitLabel?: string;
  cancelLabel?: string;
  /** Disables the submit button (validation not met). */
  disabled?: boolean;
  /** Shows a spinner in the submit button and blocks re-entry. */
  submitting?: boolean;
  maxWidth?: string;
  /** Replaces the default Cancel/Submit footer entirely. */
  footer?: ReactNode;
}

/**
 * The one modal used across the admin. Matches the Sales Invoice dialogs and
 * adds the keyboard behaviour that page relies on:
 *
 *   Esc          close
 *   Enter        submit (except in textareas, buttons and the entry grid)
 *   Ctrl/⌘+Enter submit from anywhere, including textareas
 *   Tab          stays inside the dialog
 *
 * The first focusable field is focused on open, and focus returns to whatever
 * was focused before when the dialog closes.
 */
export default function Modal({
  isOpen,
  title,
  subtitle,
  onClose,
  onSubmit,
  children,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  disabled = false,
  submitting = false,
  maxWidth = "max-w-md md:max-w-2xl lg:max-w-3xl",
  footer,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  // Lock background scroll while open so wheel/trackpad only moves the dialog.
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // Focus the first field on open; restore the previous focus on close.
  useEffect(() => {
    if (!isOpen) return;
    restoreFocusRef.current = document.activeElement as HTMLElement;

    const t = setTimeout(() => {
      const first = panelRef.current?.querySelector<HTMLElement>(
        'input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled])',
      );
      first?.focus();
      if (first instanceof HTMLInputElement && first.type === "text")
        first.select();
    }, 40);

    return () => {
      clearTimeout(t);
      restoreFocusRef.current?.focus?.();
    };
  }, [isOpen]);

  // Esc to close, Ctrl/⌘+Enter to submit, Tab trapped inside the dialog.
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
        return;
      }

      if (
        e.key === "Enter" &&
        (e.ctrlKey || e.metaKey) &&
        onSubmit &&
        !disabled &&
        !submitting
      ) {
        e.preventDefault();
        onSubmit();
        return;
      }

      if (e.key === "Tab" && panelRef.current) {
        const focusable = Array.from(
          panelRef.current.querySelectorAll<HTMLElement>(
            'input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),button:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])',
          ),
        ).filter((el) => el.offsetParent !== null);
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    // Capture phase so the dialog wins over page-level Esc/Enter handlers.
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [isOpen, onClose, onSubmit, disabled, submitting]);

  if (!isOpen) return null;

  const busy = submitting || disabled;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-brand-950/55 backdrop-blur-[3px] animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden
      />

      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div
          ref={panelRef}
          className={`edge-gold mx-auto flex w-full flex-col overflow-hidden rounded-lg bg-white shadow-deep
                      ring-1 ring-brand-950/5 ${maxWidth} max-h-[90vh] max-h-[90dvh] safe-pb
                      animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-300`}
        >
          {/* Header */}
          <div className="relative flex flex-shrink-0 items-start justify-between gap-3 border-b border-border-gray bg-gradient-to-b from-cream/60 to-white p-6">
            <div className="min-w-0">
              <h2 className="truncate font-serif text-xl font-semibold text-charcoal">
                {title}
              </h2>
              {subtitle && (
                <p className="mt-0.5 text-sm text-charcoal/50">{subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="flex min-h-11 min-w-11 shrink-0 touch-manipulation items-center justify-center rounded-sm
                         p-3 text-charcoal/50 transition-all duration-200
                         hover:rotate-90 hover:bg-light-gray hover:text-charcoal active:scale-90"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div
            data-lenis-prevent
            className="flex-1 overflow-y-auto overscroll-contain p-6 min-h-0"
            onKeyDown={(e) => {
              if (e.key !== "Enter" || !onSubmit || busy) return;
              if (e.ctrlKey || e.metaKey) return; // handled globally above
              const el = e.target as HTMLElement;
              const tag = el.tagName.toLowerCase();
              // Enter inserts a newline in textareas and clicks buttons.
              if (tag === "textarea" || tag === "button") return;
              // The entry grid owns its own Enter handling.
              if (el.closest("[data-admin-grid]")) return;
              // Autocompletes consume Enter to pick a row.
              if (el.getAttribute("role") === "combobox") return;
              e.preventDefault();
              onSubmit();
            }}
          >
            {children}
          </div>

          {/* Footer */}
          <div className="flex flex-shrink-0 flex-col-reverse gap-3 border-t border-border-gray bg-cream/40 p-6 sm:flex-row">
            {footer ?? (
              <>
                <button
                  onClick={onClose}
                  className="flex-1 btn-secondary py-2.5"
                >
                  {cancelLabel}
                </button>
                {onSubmit && (
                  <button
                    onClick={onSubmit}
                    disabled={busy}
                    className="flex-1 btn-primary py-2.5 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="animate-spin w-4 h-4" /> Saving…
                      </>
                    ) : (
                      submitLabel
                    )}
                  </button>
                )}
              </>
            )}
          </div>

          {onSubmit && !footer && (
            <p className="-mt-3 hidden bg-cream/40 pb-3 text-center text-[11px] text-charcoal/40 sm:block">
              <kbd className="rounded-xs border border-border-gray bg-white px-1 font-sans">
                Enter
              </kbd>
              to save
              {" · "}
              <kbd className="rounded-xs border border-border-gray bg-white px-1 font-sans">
                Esc
              </kbd>
              to cancel
            </p>
          )}
        </div>
      </div>
    </>
  );
}
