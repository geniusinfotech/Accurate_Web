"use client";

export interface ShortcutKey {
  combo: string;
  label: string;
}

export const LIST_SHORTCUTS: ShortcutKey[] = [
  { combo: "/", label: "Search" },
  { combo: "↑ ↓", label: "Navigate" },
];

export function ShortcutHint({ keys = LIST_SHORTCUTS }: { keys?: ShortcutKey[] }) {
  if (!keys || keys.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-end gap-3 pt-2 text-[11px] text-charcoal/45">
      {keys.map((k, idx) => (
        <div key={idx} className="flex items-center gap-1">
          <kbd className="font-mono text-[10px] bg-charcoal/5 border border-border-gray rounded px-1.5 py-0.5 text-charcoal/70">
            {k.combo}
          </kbd>
          <span>{k.label}</span>
        </div>
      ))}
    </div>
  );
}
