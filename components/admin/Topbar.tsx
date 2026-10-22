"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  ChevronRight,
  Search,
  ExternalLink,
  LogOut,
  Sparkles,
  Command,
  LayoutDashboard,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useAdminLayout } from "@/context/AdminLayoutContext";
import { breadcrumbFor } from "@/lib/admin-ui";

export default function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { toggleMobileOpen, setIsCommandOpen } = useAdminLayout();

  const crumbs = breadcrumbFor(pathname || "");

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      router.replace("/login");
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-blue-100 bg-white/95 px-3 sm:px-4 md:px-7 backdrop-blur-md">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile menu hamburger button */}
        <button
          type="button"
          onClick={toggleMobileOpen}
          className="flex md:hidden h-9 w-9 items-center justify-center rounded-lg border border-blue-200 bg-white text-blue-800 shadow-sm transition hover:bg-blue-50 active:scale-95"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="min-w-0">
          <ol className="flex items-center gap-1.5 text-xs sm:text-sm">
            <li className="flex items-center">
              <span className="flex items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors">
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span className="hidden sm:inline font-medium">Console</span>
              </span>
            </li>

            {crumbs.map((crumb, idx) => {
              const isLast = idx === crumbs.length - 1;
              return (
                <li key={idx} className="flex items-center gap-1.5 min-w-0">
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                  {isLast ? (
                    <span className="truncate rounded-md bg-rose-50 px-2 py-0.5 font-semibold text-rose-700 border border-rose-200">
                      {crumb}
                    </span>
                  ) : (
                    <span className="hidden sm:inline truncate font-medium text-slate-500 hover:text-slate-800 transition-colors">
                      {crumb}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      {/* Center: Command Palette Trigger Bar */}
      <div className="hidden lg:flex items-center max-w-sm w-full mx-6">
        <button
          type="button"
          onClick={() => setIsCommandOpen(true)}
          className="flex w-full items-center justify-between rounded-lg border border-blue-100 bg-blue-50/70 px-3.5 py-1.5 text-xs text-slate-400 shadow-inner transition-all hover:border-blue-300 hover:bg-white hover:text-slate-600 hover:shadow-sm"
        >
          <span className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-slate-400" />
            <span>Search or jump to...</span>
          </span>
          <kbd className="flex items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-500 shadow-2xs">
            <Command className="h-3 w-3" />K
          </kbd>
        </button>
      </div>

      {/* Right: Actions, Live Store, & User Profile */}
      <div className="flex shrink-0 items-center gap-3">
        {/* Mobile Search Button */}
        <button
          type="button"
          onClick={() => setIsCommandOpen(true)}
          className="flex lg:hidden h-8 w-8 items-center justify-center rounded-lg border border-blue-100 text-slate-500 hover:bg-blue-50"
          title="Search (⌘K)"
        >
          <Search className="h-4 w-4" />
        </button>

        {/* Live Storefront Link */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-blue-100 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800"
        >
          <span>View Store</span>
          <ExternalLink className="h-3 w-3 text-slate-400" />
        </a>
      </div>
    </header>
  );
}
