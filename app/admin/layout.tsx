"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";
import AccessDenied from "@/components/admin/AccessDenied";
import CommandPalette from "@/components/admin/CommandPalette";
import {
  AdminLayoutProvider,
  useAdminLayout,
} from "@/context/AdminLayoutContext";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import {
  hasAnyPermission,
  isAdminOnlyPath,
  permissionsForPath,
} from "@/lib/admin-permissions";

export const dynamic = "force-dynamic";

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isManager, isLoading, permissions, isAdmin } =
    useAuth();
  const { isCollapsed } = useAdminLayout();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    } else if (!isManager) {
      router.push("/");
    }
  }, [isLoading, isAuthenticated, isManager, router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen min-h-[100dvh] bg-blue-950 flex flex-col items-center justify-center gap-4">
        <div className="relative flex h-14 w-14 items-center justify-center rounded-lg border border-rose-300/50 bg-blue-900 shadow-2xl">
          <span className="font-serif text-2xl font-bold text-rose-300">
            A
          </span>
          <span className="absolute -inset-1 rounded-lg border border-rose-300/30 animate-ping" />
        </div>
        <Loader2 className="h-5 w-5 animate-spin text-rose-300" />
      </div>
    );
  }

  if (!isAuthenticated || !isManager) {
    return (
      <div className="min-h-screen min-h-[100dvh] bg-blue-950 flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-rose-300" />
      </div>
    );
  }

  const required = permissionsForPath(pathname);
  const allowed = isAdmin
    ? true
    : !isAdminOnlyPath(pathname) &&
      (required === undefined || hasAnyPermission(permissions, required));

  return (
    <div className="admin-shell flex min-h-screen min-h-[100dvh] bg-blue-50/40 font-sans antialiased text-slate-800">
      {/* Linear-grade Obsidian Sidebar */}
      <Sidebar />

      {/* Global Command Palette (⌘K) */}
      <CommandPalette />

      {/* Main App Container with Dynamic Collapsible Margin */}
      <div
        className={`flex min-h-screen min-h-[100dvh] min-w-0 flex-1 flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        {/* Sticky Frosted Topbar */}
        <Topbar />

        {/* Dynamic Route Content */}
        <main className="relative flex-1 bg-blue-50/40 p-3 sm:p-5 md:p-7 lg:p-8">

          <div
            key={pathname}
            className="relative mx-auto max-w-[1440px] animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            {allowed ? children : <AccessDenied />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminLayoutProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminLayoutProvider>
  );
}
