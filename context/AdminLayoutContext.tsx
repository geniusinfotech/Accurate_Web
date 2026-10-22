"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface AdminLayoutContextType {
  isCollapsed: boolean;
  toggleCollapse: () => void;
  setCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  toggleMobileOpen: () => void;
  isCommandOpen: boolean;
  setIsCommandOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
}

const AdminLayoutContext = createContext<AdminLayoutContextType | undefined>(
  undefined,
);

const STORAGE_KEY = "accurate_admin_sidebar_collapsed";

export function AdminLayoutProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const [isCommandOpen, setIsCommandOpen] = useState<boolean>(false);

  // Load persisted collapse state
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      }
    } catch {
      // Ignore local storage errors in private browsing
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  const setCollapsed = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
    try {
      localStorage.setItem(STORAGE_KEY, String(collapsed));
    } catch {
      // Ignore
    }
  };

  const toggleMobileOpen = () => {
    setIsMobileOpen((prev) => !prev);
  };

  const toggleCommandPalette = () => {
    setIsCommandOpen((prev) => !prev);
  };

  // Global keyboard shortcuts (Cmd+K / Ctrl+K, Cmd+B / Ctrl+B for collapse)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command / Ctrl + K -> Open Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
      // Command / Ctrl + B -> Toggle Sidebar
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleCollapse();
      }
      // Escape closes dialogs
      if (e.key === "Escape") {
        if (isCommandOpen) setIsCommandOpen(false);
        if (isMobileOpen) setIsMobileOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCommandOpen, isMobileOpen]);

  return (
    <AdminLayoutContext.Provider
      value={{
        isCollapsed,
        toggleCollapse,
        setCollapsed,
        isMobileOpen,
        setIsMobileOpen,
        toggleMobileOpen,
        isCommandOpen,
        setIsCommandOpen,
        toggleCommandPalette,
      }}
    >
      {children}
    </AdminLayoutContext.Provider>
  );
}

export function useAdminLayout() {
  const context = useContext(AdminLayoutContext);
  if (!context) {
    throw new Error(
      "useAdminLayout must be used within an AdminLayoutProvider",
    );
  }
  return context;
}
