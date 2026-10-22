"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  BarChart3,
  ChevronRight,
  DollarSign,
  Eye,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Percent,
  Search,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Tags,
  Truck,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useAdminLayout } from "@/context/AdminLayoutContext";

type MenuItem = {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: string;
  permissions?: string[];
  adminOnly?: boolean;
};

type MenuSection = {
  title: string;
  items: MenuItem[];
};

const menuSections: MenuSection[] = [
  {
    title: "Overview",
    items: [
      {
        icon: LayoutDashboard,
        label: "Dashboard",
        href: "/admin",
        permissions: ["dashboard:view"],
      },
      {
        icon: Activity,
        label: "Activity Log",
        href: "/admin/activity-log",
        permissions: ["activity_log:view"],
      },
    ],
  },
  {
    title: "Store & Catalog",
    items: [
      {
        icon: ShoppingBag,
        label: "Orders & Sales",
        href: "/admin/orders",
        permissions: ["orders:view"],
      },
      {
        icon: Package,
        label: "Products",
        href: "/admin/products",
        permissions: ["products:view"],
      },
      {
        icon: Tags,
        label: "Categories",
        href: "/admin/categories",
        permissions: ["categories:view"],
      },
      {
        icon: Percent,
        label: "Offers & Deals",
        href: "/admin/offers",
        permissions: ["offers:view"],
      },
      {
        icon: Tag,
        label: "Coupons",
        href: "/admin/coupons",
        permissions: ["coupons:view"],
      },
      {
        icon: Truck,
        label: "Shipping Charges",
        href: "/admin/shipping",
        permissions: ["shipping:view"],
      },
      {
        icon: ImageIcon,
        label: "Banners",
        href: "/admin/banners",
        permissions: ["banners:view"],
      },
      {
        icon: Eye,
        label: "Testimonials",
        href: "/admin/testimonials",
        permissions: ["testimonials:view"],
      },
      {
        icon: MessageSquare,
        label: "Contact Messages",
        href: "/admin/messages",
      },
    ],
  },
  {
    title: "Operations & Access",
    items: [
      {
        icon: DollarSign,
        label: "Accounts",
        href: "/admin/accounts",
        permissions: ["accounts:view"],
      },
      {
        icon: ShieldCheck,
        label: "Managers",
        href: "/admin/managers",
        adminOnly: true,
      },
      {
        icon: Users,
        label: "Users & Roles",
        href: "/admin/users",
        adminOnly: true,
      },
    ],
  },
];

function itemVisible(
  item: MenuItem,
  role?: string,
  hasPermission?: (permission: string | string[]) => boolean,
) {
  if (item.adminOnly) return role === "admin";
  if (!item.permissions?.length) return true;
  return hasPermission ? hasPermission(item.permissions) : false;
}

function getInitials(name?: string) {
  const value = name?.trim();

  if (!value) return "A";

  return value
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, hasPermission } = useAuth();

  const {
    isCollapsed,
    toggleCollapse,
    isMobileOpen,
    setIsMobileOpen,
    setIsCommandOpen,
  } = useAdminLayout();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      router.replace("/login");
    }
  };

  const closeMobile = () => setIsMobileOpen(false);

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={closeMobile}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px] md:hidden"
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex flex-col",
          "border-r border-slate-200 bg-white",
          "shadow-[8px_0_30px_rgba(15,23,42,0.05)]",
          "transition-[width,transform] duration-300 ease-out",
          isCollapsed ? "w-[76px]" : "w-[270px]",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        ].join(" ")}
      >
        {/* Brand */}
        <div
          className={[
            "flex h-[76px] shrink-0 items-center border-b border-slate-100",
            isCollapsed ? "justify-center px-3" : "px-4",
          ].join(" ")}
        >
          <Link
            href="/admin"
            onClick={closeMobile}
            className="group flex min-w-0 items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
          >
            <div
              className={[
                "relative shrink-0 overflow-hidden rounded-xl bg-slate-50",
                "ring-1 ring-slate-200 transition group-hover:ring-slate-300",
                isCollapsed ? "h-11 w-11" : "h-11 w-11",
              ].join(" ")}
            >
              <Image
                src="/logo.png"
                alt="Accurate Liquid"
                fill
                priority
                sizes="44px"
                className="object-contain p-1.5"
              />
            </div>

            {!isCollapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-bold tracking-tight text-slate-950">
                  Accurate Liquid
                </p>
                <p className="mt-0.5 truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Admin Console
                </p>
              </div>
            )}
          </Link>

          <button
            type="button"
            onClick={closeMobile}
            aria-label="Close menu"
            className="ml-auto grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-900 md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav
          aria-label="Admin Navigation"
          className="min-h-0 flex-1 overflow-y-auto px-3 py-5 scrollbar-none"
        >
          <div className="space-y-6">
            {menuSections.map((section) => {
              const visibleItems = section.items.filter((item) =>
                itemVisible(item, user?.role, hasPermission),
              );

              if (visibleItems.length === 0) return null;

              return (
                <div key={section.title}>
                  {!isCollapsed && (
                    <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      {section.title}
                    </div>
                  )}

                  <div className="space-y-1">
                    {visibleItems.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.href);

                      return (
                        <div key={item.href} className="group relative">
                          <Link
                            href={item.href}
                            onClick={closeMobile}
                            aria-current={active ? "page" : undefined}
                            title={isCollapsed ? item.label : undefined}
                            className={[
                              "relative flex items-center rounded-xl",
                              "text-[13px] font-semibold transition-all duration-200",
                              isCollapsed
                                ? "mx-auto h-11 w-11 justify-center"
                                : "h-11 gap-3 px-3",
                              active
                                ? "bg-slate-950 text-white shadow-md shadow-slate-950/10"
                                : "text-slate-500 hover:bg-slate-100 hover:text-slate-950",
                            ].join(" ")}
                          >
                            {active && (
                              <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-blue-400" />
                            )}

                            <Icon
                              className={[
                                "shrink-0 transition-transform duration-200",
                                isCollapsed
                                  ? "h-[19px] w-[19px]"
                                  : "h-[17px] w-[17px]",
                                active
                                  ? "text-blue-300"
                                  : "text-slate-400 group-hover:text-slate-700",
                              ].join(" ")}
                            />

                            {!isCollapsed && (
                              <>
                                <span className="min-w-0 flex-1 truncate">
                                  {item.label}
                                </span>

                                {item.badge && (
                                  <span
                                    className={[
                                      "rounded-full px-1.5 py-0.5 text-[9px] font-bold",
                                      active
                                        ? "bg-white/10 text-blue-200"
                                        : "bg-slate-100 text-slate-500",
                                    ].join(" ")}
                                  >
                                    {item.badge}
                                  </span>
                                )}

                                {active && (
                                  <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                                )}
                              </>
                            )}
                          </Link>

                          {isCollapsed && (
                            <div className="pointer-events-none absolute left-full top-1/2 z-[60] ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
                              {item.label}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </nav>

        {/* User panel */}
        <div className="shrink-0 border-t border-slate-100 p-3">
          {!isCollapsed ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2.5">
              <div className="flex items-center gap-2.5">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-950 text-xs font-bold text-white">
                  {getInitials(user?.name)}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-slate-900">
                    {user?.name || "Administrator"}
                  </p>
                  <p className="mt-0.5 truncate text-[10px] font-medium uppercase tracking-wider text-slate-400">
                    {user?.role || "Manager"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  title="Sign out"
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950 text-xs font-bold text-white">
                {getInitials(user?.name)}
              </div>

              <button
                type="button"
                onClick={handleLogout}
                title="Sign out"
                className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Collapse control */}
        <div className="hidden border-t border-slate-100 p-3 md:block">
          <button
            type="button"
            onClick={toggleCollapse}
            className={[
              "flex h-10 w-full items-center rounded-xl",
              "text-xs font-semibold text-slate-400",
              "transition hover:bg-slate-100 hover:text-slate-900",
              isCollapsed ? "justify-center" : "gap-3 px-3",
            ].join(" ")}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <>
                <PanelLeftClose className="h-4 w-4" />
                <span>Collapse sidebar</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile menu trigger — useful when the parent layout does not already provide one */}
      {!isMobileOpen && (
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          aria-label="Open navigation"
          className="fixed left-4 top-4 z-30 grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-md md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}
    </>
  );
}
