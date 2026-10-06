"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { inputCls } from "@/lib/admin-ui";

export interface SearchSelectProps<T = any> {
  value: string;
  onValueChange: (val: string) => void;
  options: T[];
  loading?: boolean;
  onSearch: (query: string, immediate?: boolean) => void;
  onSelect: (option: T) => void;
  getPrimary: (option: T) => React.ReactNode;
  getSecondary?: (option: T) => React.ReactNode;
  placeholder?: string;
  heading?: string;
}

export function SearchSelect<T extends Record<string, any>>({
  value,
  onValueChange,
  options,
  loading = false,
  onSearch,
  onSelect,
  getPrimary,
  getSecondary,
  placeholder = "Search...",
  heading,
}: SearchSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onValueChange(e.target.value);
            onSearch(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            onSearch(value, true);
            setOpen(true);
          }}
          placeholder={placeholder}
          className={`${inputCls} pr-8`}
        />
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-charcoal/40 pointer-events-none">
          {loading ? <Loader2 size={15} className="animate-spin text-gold" /> : <Search size={15} />}
        </div>
      </div>

      {open && (options.length > 0 || loading) && (
        <div className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border border-border-gray rounded-md shadow-lg py-1 text-xs">
          {heading && <div className="px-3 py-1.5 font-semibold text-[10px] uppercase tracking-wider text-charcoal/40 bg-light-gray/50">{heading}</div>}
          {options.map((opt, idx) => (
            <button
              key={opt._id || opt.id || idx}
              type="button"
              onClick={() => {
                onSelect(opt);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-cream/60 transition-colors flex items-center justify-between gap-2 border-b border-border-gray/30 last:border-0"
            >
              <div className="font-medium text-charcoal truncate">{getPrimary(opt)}</div>
              {getSecondary && <div className="text-[11px] text-charcoal/50 shrink-0">{getSecondary(opt)}</div>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
