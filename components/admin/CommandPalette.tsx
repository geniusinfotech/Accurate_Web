"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  ShoppingBag,
  Package,
  Tags,
  ImageIcon,
  Percent,
  Tag,
  Truck,
  Eye,
  DollarSign,
  Activity,
  BarChart3,
  ShieldCheck,
  Users,
  ExternalLink,
  LogOut,
  PanelLeftClose,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useAdminLayout } from "@/context/AdminLayoutContext";
import { useAuth } from "@/context/AuthContext";

type CommandItem = {
  id: string;
  title: string;
  category: "Navigation" | "Quick Actions" | "System";
  icon: React.ElementType;
  shortcut?: string;
  href?: string;
  action?: () => void;
  adminOnly?: boolean;
};

export default function CommandPalette() {
  const router = useRouter();
  const { isCommandOpen, setIsCommandOpen, toggleCollapse } = useAdminLayout();
  const { user, logout, isAdmin } = useAuth();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const allItems: CommandItem[] = useMemo(
    () => [
      {
        id: "nav-dashboard",
        title: "Dashboard",
        category: "Navigation",
        icon: LayoutDashboard,
        href: "/admin",
        shortcut: "G D",
      },
      {
        id: "nav-orders",
        title: "Orders & Web Sales",
        category: "Navigation",
        icon: ShoppingBag,
        href: "/admin/orders",
        shortcut: "G O",
      },
      {
        id: "nav-products",
        title: "Products & Inventory",
        category: "Navigation",
        icon: Package,
        href: "/admin/products",
        shortcut: "G P",
      },
      {
        id: "nav-categories",
        title: "Categories",
        category: "Navigation",
        icon: Tags,
        href: "/admin/categories",
      },
      {
        id: "nav-banners",
        title: "Store Banners",
        category: "Navigation",
        icon: ImageIcon,
        href: "/admin/banners",
      },
      {
        id: "nav-offers",
        title: "Offers & Deals",
        category: "Navigation",
        icon: Percent,
        href: "/admin/offers",
      },
      {
        id: "nav-coupons",
        title: "Coupons & Discounts",
        category: "Navigation",
        icon: Tag,
        href: "/admin/coupons",
      },
      {
        id: "nav-shipping",
        title: "Shipping Charges",
        category: "Navigation",
        icon: Truck,
        href: "/admin/shipping",
      },
      {
        id: "nav-testimonials",
        title: "Testimonials",
        category: "Navigation",
        icon: Eye,
        href: "/admin/testimonials",
      },
      {
        id: "nav-accounts",
        title: "Accounts & Financials",
        category: "Navigation",
        icon: DollarSign,
        href: "/admin/accounts",
      },
      {
        id: "nav-activity",
        title: "Activity Log",
        category: "Navigation",
        icon: Activity,
        href: "/admin/activity-log",
      },
      {
        id: "nav-reports",
        title: "Reports & Analytics",
        category: "Navigation",
        icon: BarChart3,
        href: "/admin/reports",
        shortcut: "Alt+R",
      },
      {
        id: "nav-managers",
        title: "Managers & Permissions",
        category: "Navigation",
        icon: ShieldCheck,
        href: "/admin/managers",
        adminOnly: true,
      },
      {
        id: "nav-users",
        title: "Users / Roles",
        category: "Navigation",
        icon: Users,
        href: "/admin/users",
        adminOnly: true,
      },
      // Quick Actions
      {
        id: "act-storefront",
        title: "View Live Storefront",
        category: "Quick Actions",
        icon: ExternalLink,
        action: () => window.open("/", "_blank"),
      },
      {
        id: "act-pending",
        title: "Check Pending Shipments",
        category: "Quick Actions",
        icon: Truck,
        href: "/admin/orders",
      },
      {
        id: "act-toggle-sidebar",
        title: "Toggle Sidebar Width",
        category: "Quick Actions",
        icon: PanelLeftClose,
        shortcut: "⌘B",
        action: () => toggleCollapse(),
      },
      // System
      {
        id: "sys-logout",
        title: "Sign Out of Admin Console",
        category: "System",
        icon: LogOut,
        action: async () => {
          await logout();
          router.replace("/login");
        },
      },
    ],
    [logout, router, toggleCollapse],
  );

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      if (item.adminOnly && !isAdmin) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    });
  }, [allItems, isAdmin, query]);

  useEffect(() => {
    if (isCommandOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector(
        `[data-index="${selectedIndex}"]`,
      ) as HTMLElement | null;
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  if (!isCommandOpen) return null;

  const handleSelect = (item: CommandItem) => {
    setIsCommandOpen(false);
    if (item.action) {
      item.action();
    } else if (item.href) {
      router.push(item.href);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredItems.length - 1 ? prev + 1 : 0,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredItems.length - 1,
      );
    } else if (e.key === "Enter" && filteredItems[selectedIndex]) {
      e.preventDefault();
      handleSelect(filteredItems[selectedIndex]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsCommandOpen(false);
    }
  };

  // Group by category
  const categories = Array.from(
    new Set(filteredItems.map((item) => item.category)),
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command Menu"
      className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-[10vh] sm:pt-[14vh]"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={() => setIsCommandOpen(false)}
      />

      {/* Modal Dialog */}
      <div
        onKeyDown={handleKeyDown}
        className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a]/95 text-slate-100 shadow-[0_25px_70px_rgba(0,0,0,0.6)] backdrop-blur-2xl transition-all animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center border-b border-white/[0.08] px-4 py-3.5">
          <Search className="h-5 w-5 shrink-0 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search sections..."
            className="w-full bg-transparent px-3 text-base text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded bg-white/[0.08] px-2 py-0.5 text-[11px] font-medium text-slate-400">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="max-h-[380px] overflow-y-auto p-2 scrollbar-none"
        >
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              <Sparkles className="mx-auto mb-2 h-6 w-6 text-slate-600" />
              No matching pages or actions found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            categories.map((category) => {
              const items = filteredItems.filter((i) => i.category === category);
              return (
                <div key={category} className="mb-2">
                  <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400/70">
                    {category}
                  </div>
                  {items.map((item) => {
                    const globalIdx = filteredItems.findIndex(
                      (i) => i.id === item.id,
                    );
                    const isSelected = globalIdx === selectedIndex;
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.id}
                        data-index={globalIdx}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                        className={`group flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-all duration-150 ${
                          isSelected
                            ? "bg-blue-400/15 text-blue-200 shadow-sm"
                            : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`grid h-8 w-8 place-items-center rounded-lg border transition-colors ${
                              isSelected
                                ? "border-blue-400/40 bg-blue-400/20 text-blue-300"
                                : "border-white/[0.08] bg-white/[0.04] text-slate-400 group-hover:text-slate-200"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="font-medium">{item.title}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {item.shortcut && (
                            <kbd className="rounded border border-white/10 bg-white/[0.05] px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
                              {item.shortcut}
                            </kbd>
                          )}
                          <ArrowRight
                            className={`h-4 w-4 transition-transform ${
                              isSelected
                                ? "translate-x-0.5 text-blue-300 opacity-100"
                                : "opacity-0"
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="flex items-center justify-between border-t border-white/[0.08] bg-slate-950/60 px-4 py-2.5 text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-white/[0.08] px-1.5 py-0.5 font-mono text-[10px]">
                ↑
              </kbd>
              <kbd className="rounded bg-white/[0.08] px-1.5 py-0.5 font-mono text-[10px]">
                ↓
              </kbd>{" "}
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-white/[0.08] px-1.5 py-0.5 font-mono text-[10px]">
                ↵
              </kbd>{" "}
              select
            </span>
          </div>
          <span className="text-slate-500 font-mono text-[10px]">
            {user?.name || "Admin"} • {user?.role || "Staff"}
          </span>
        </div>
      </div>
    </div>
  );
}
