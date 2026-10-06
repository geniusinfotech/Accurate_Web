"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, LayoutDashboard, LogOut, Menu, Package, ShoppingBag, UserRound, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type NavbarProps = {
  onCart: () => void;
  count?: number;
};

const menuItemCls = "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950";

/** Account pill: "Sign in" when logged out; blue + green dot + name when logged in, with a hover/focus menu. */
function AccountMenu() {
  const router = useRouter();
  const { user, isAuthenticated, isManager, isLoading, logout } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <Link href="/login" className="ml-1 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-900 shadow-sm transition-all duration-300 hover:border-slate-950 hover:bg-slate-950 hover:text-white">
        <UserRound size={15} strokeWidth={2} />
        {isLoading ? "Account" : "Sign in"}
      </Link>
    );
  }

  const firstName = user.name.split(" ")[0];
  const roleLabel = user.role === "admin" ? "Administrator" : user.role === "manager" ? "Manager" : "Customer";

  return (
    <div className="group relative ml-1">
      <Link href="/profile" aria-haspopup="menu" className="inline-flex max-w-[180px] items-center gap-2 rounded-full border border-[#1f4e9e]/30 bg-[#1f4e9e]/10 px-4 py-2.5 text-[13px] font-semibold text-[#1f4e9e] transition-all duration-300 group-hover:bg-[#1f4e9e] group-hover:text-white group-focus-within:bg-[#1f4e9e] group-focus-within:text-white">
        <span className="relative flex size-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
        </span>
        <span className="truncate">{firstName}</span>
      </Link>

      <div className="invisible absolute right-0 top-full z-10 w-64 pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
        <div role="menu" className="rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-950/10">
          <div className="px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Signed in as</p>
            <p className="mt-1 truncate text-sm font-bold text-slate-950">{user.name}</p>
            {user.email && <p className="truncate text-xs text-slate-500">{user.email}</p>}
            <span className="mt-2 inline-block rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">{roleLabel}</span>
          </div>

          {isManager && (
            <Link href="/admin" role="menuitem" className="mb-1 flex items-center gap-2.5 rounded-xl bg-slate-950 px-3 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-[#1f4e9e]">
              <LayoutDashboard size={15} /> Admin dashboard
            </Link>
          )}
          <Link href="/profile" role="menuitem" className={menuItemCls}>
            <UserRound size={15} /> My profile
          </Link>
          <Link href="/orders" role="menuitem" className={menuItemCls}>
            <Package size={15} /> My orders
          </Link>
          <button type="button" role="menuitem" onClick={async () => { await logout(); router.push("/"); }} className={`${menuItemCls} w-full text-rose-600 hover:bg-rose-50 hover:text-rose-700`}>
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

export function Navbar({ onCart, count = 0 }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [bump, setBump] = useState(false);

  const { user, isAuthenticated, isManager, logout } = useAuth();
  const router = useRouter();
  const accountHref = isAuthenticated ? "/profile" : "/login";

  // Cart animation whenever item count increases
  useEffect(() => {
    if (count === 0) return;

    setBump(true);

    const timer = window.setTimeout(() => {
      setBump(false);
    }, 500);

    return () => window.clearTimeout(timer);
  }, [count]);

  // Lock body scroll + Escape key
  useEffect(() => {
    if (!menuOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  const mobileLinks = [
    {
      href: "/shop",
      label: "Shop",
      description: "Explore all products",
      number: "01",
    },
    {
      href: "/about",
      label: "Our story",
      description: "Discover our journey",
      number: "02",
    },
    {
      href: "/faq",
      label: "FAQ",
      description: "Everything you need to know",
      number: "03",
    },
    {
      href: "/contact",
      label: "Contact",
      description: "We'd love to hear from you",
      number: "04",
    },
  ];

  return (
    <>
      {/* =========================================================
          DESKTOP / MOBILE NAVBAR
      ========================================================= */}
      <header
        className="sticky top-0 z-[80] w-full border-b border-black/[0.06] bg-white/90 backdrop-blur-xl"
      >
        <div
          className="mx-auto flex h-[72px] w-full max-w-[1440px] items-center px-4 sm:px-6 lg:px-8 xl:px-10"
        >
          {/* -----------------------------------------------------
              LOGO
          ----------------------------------------------------- */}
          <Link
            href="/"
            onClick={closeMenu}
            aria-label="Accurate Liqued home"
            className="group flex shrink-0 items-center transition-transform duration-300 hover:scale-[1.02]"
          >
            <Image
              src="/logo.jpg"
              width={160}
              height={160}
              priority
              alt="Accurate Liqued"
              className="h-[58px] w-auto object-contain sm:h-[62px]"
            />
          </Link>

          {/* -----------------------------------------------------
              DESKTOP NAVIGATION
          ----------------------------------------------------- */}
          <nav
            aria-label="Primary navigation"
            className="ml-auto hidden items-center gap-1 lg:flex"
          >
            <Link
              href="/shop"
              className="rounded-full px-4 py-2.5 text-[13px] font-semibold tracking-wide text-slate-600 transition-all duration-300 hover:bg-slate-950 hover:text-white"
            >
              Shop
            </Link>

            <Link
              href="/about"
              className="rounded-full px-4 py-2.5 text-[13px] font-semibold tracking-wide text-slate-600 transition-all duration-300 hover:bg-slate-950 hover:text-white"
            >
              Our story
            </Link>

            <Link
              href="/faq"
              className="rounded-full px-4 py-2.5 text-[13px] font-semibold tracking-wide text-slate-600 transition-all duration-300 hover:bg-slate-950 hover:text-white"
            >
              FAQ
            </Link>

            <Link
              href="/contact"
              className="rounded-full px-4 py-2.5 text-[13px] font-semibold tracking-wide text-slate-600 transition-all duration-300 hover:bg-slate-950 hover:text-white"
            >
              Contact
            </Link>

            <AccountMenu />
          </nav>

          {/* -----------------------------------------------------
              CART
          ----------------------------------------------------- */}
          <button
            type="button"
            data-cart-button
            onClick={onCart}
            aria-label={`Open cart with ${count} ${
              count === 1 ? "item" : "items"
            }`}
            className={`
              group
              relative
              ml-3
              hidden
              h-11
              items-center
              gap-2
              rounded-full
              bg-slate-950
              px-4
              text-white
              shadow-lg
              shadow-slate-950/10
              transition-all duration-300
              hover:bg-[#1f4e9e]
              hover:shadow-xl
              hover:shadow-[#1f4e9e]/20
              active:scale-95
              sm:flex
              ${bump ? "animate-[cart-bump_0.5s_ease]" : ""}
            `}
          >
            <ShoppingBag
              size={17}
              strokeWidth={2}
              className="transition-transform duration-300 group-hover:-rotate-6"
            />

            <span className="text-[13px] font-bold tracking-wide">Cart</span>

            {count > 0 && (
              <span
                key={count}
                className={`
                  grid
                  h-5
                  min-w-5
                  place-items-center
                  rounded-full
                  bg-white
                  px-1
                  text-[10px]
                  font-black
                  text-slate-950
                  ${bump ? "animate-[cart-pop_0.5s_ease]" : ""}
                `}
              >
                {count}
              </span>
            )}
          </button>

          {/* -----------------------------------------------------
              MOBILE MENU BUTTON
          ----------------------------------------------------- */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            className="ml-3 grid size-11 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-slate-950 shadow-sm transition-all duration-300 hover:border-slate-950 hover:bg-slate-950 hover:text-white active:scale-95 lg:hidden"
          >
            <Menu size={21} strokeWidth={2} />
          </button>
        </div>
      </header>

      {/* =========================================================
          MOBILE FULL SCREEN MENU
      ========================================================= */}
      {menuOpen && (
        <div
          id="mobile-navigation"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          className="fixed inset-0 z-[100] flex min-h-[100dvh] flex-col bg-white lg:hidden"
        >
          {/* -----------------------------------------------------
              MOBILE MENU HEADER
          ----------------------------------------------------- */}
          <div
            className="flex h-[72px] shrink-0 items-center justify-between border-b border-slate-100 px-5 sm:px-7"
          >
            <Link
              href="/"
              onClick={closeMenu}
              aria-label="Accurate Liqued home"
              className="flex items-center"
            >
              <Image
                src="/logo.jpg"
                width={150}
                height={150}
                priority
                alt="Accurate Liqued"
                className="h-[58px] w-auto object-contain"
              />
            </Link>

            <button
              type="button"
              onClick={closeMenu}
              aria-label="Close navigation menu"
              autoFocus
              className="grid size-11 place-items-center rounded-full bg-slate-950 text-white transition-all duration-300 hover:bg-[#1f4e9e] active:scale-95"
            >
              <X size={20} />
            </button>
          </div>

          {/* -----------------------------------------------------
              MOBILE NAV LINKS
          ----------------------------------------------------- */}
          <nav
            aria-label="Mobile navigation"
            className="flex flex-1 flex-col justify-center overflow-y-auto px-5 py-8 sm:px-8"
          >
            <div className="mx-auto w-full max-w-2xl">
              <p
                className="mb-5 px-4 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400"
              >
                Navigation
              </p>

              <div className="space-y-1">
                {mobileLinks.map((link, index) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    style={{
                      animationDelay: `${index * 70}ms`,
                    }}
                    className="group flex items-center justify-between gap-5 rounded-2xl px-4 py-4 opacity-0 [animation:mobile-nav-in_0.5s_cubic-bezier(0.22,1,0.36,1)_forwards] transition-all duration-300 hover:bg-slate-50 active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className="hidden w-7 text-[10px] font-bold tracking-widest text-slate-300 sm:block"
                      >
                        {link.number}
                      </span>

                      <div>
                        <span
                          className="block text-[30px] font-extrabold leading-none tracking-[-0.04em] text-slate-950 transition-colors group-hover:text-[#1f4e9e] sm:text-[38px]"
                        >
                          {link.label}
                        </span>

                        <span
                          className="mt-1.5 block text-xs font-medium text-slate-400 sm:text-sm"
                        >
                          {link.description}
                        </span>
                      </div>
                    </div>

                    <span
                      className="grid size-11 shrink-0 place-items-center rounded-full border border-slate-200 text-slate-900 transition-all duration-300 group-hover:border-[#1f4e9e] group-hover:bg-[#1f4e9e] group-hover:text-white group-hover:rotate-45"
                    >
                      <ArrowUpRight size={18} />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </nav>

          {/* -----------------------------------------------------
              MOBILE FOOTER
          ----------------------------------------------------- */}
          <div
            className="shrink-0 border-t border-slate-100 bg-white px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-5 sm:px-8"
          >
            <div className="mx-auto w-full max-w-2xl">
              {isAuthenticated && user && (
                <div className="mb-3 flex items-center justify-between gap-3 rounded-2xl border border-[#1f4e9e]/20 bg-[#1f4e9e]/10 px-4 py-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#1f4e9e]">
                      <span className="size-2 rounded-full bg-emerald-500" /> Signed in
                    </p>
                    <p className="mt-0.5 truncate text-sm font-bold text-slate-950">{user.name}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {isManager && (
                      <Link href="/admin" onClick={closeMenu} className="rounded-full bg-slate-950 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#1f4e9e]">
                        Admin dashboard
                      </Link>
                    )}
                    <button type="button" onClick={async () => { closeMenu(); await logout(); router.push("/"); }} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-50">
                      Sign out
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {/* Account */}
                <Link
                  href={accountHref}
                  onClick={closeMenu}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 transition-all duration-300 hover:border-slate-950 hover:bg-slate-950 hover:text-white active:scale-[0.98]"
                >
                  <UserRound size={16} />
                  {isAuthenticated ? "My profile" : "Sign in"}
                </Link>

                {/* Cart */}
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    onCart();
                  }}
                  className="relative inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#1f4e9e] px-4 text-sm font-bold text-white shadow-lg shadow-[#1f4e9e]/20 transition-all duration-300 hover:bg-slate-950 active:scale-[0.98]"
                >
                  <ShoppingBag size={16} />
                  Cart
                  {count > 0 && (
                    <span
                      className="grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-[10px] font-black text-[#1f4e9e]"
                    >
                      {count}
                    </span>
                  )}
                </button>
              </div>

              <div className="mt-5 flex items-center justify-center gap-2">
                <span className="size-1.5 rounded-full bg-[#1f4e9e]" />

                <p
                  className="text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400"
                >
                  Pure clean · Certified quality · Surat, India
                </p>

                <span className="size-1.5 rounded-full bg-[#1f4e9e]" />
              </div>
            </div>
          </div>

          {/* -----------------------------------------------------
              MENU ANIMATIONS
          ----------------------------------------------------- */}
          <style jsx>{`
            @keyframes mobile-nav-in {
              from {
                opacity: 0;
                transform: translateY(18px);
              }

              to {
                opacity: 1;
                transform: translateY(0);
              }
            }

            @keyframes cart-bump {
              0% {
                transform: scale(1);
              }

              30% {
                transform: scale(1.06);
              }

              55% {
                transform: scale(0.96);
              }

              80% {
                transform: scale(1.02);
              }

              100% {
                transform: scale(1);
              }
            }

            @keyframes cart-pop {
              0% {
                transform: scale(0.5);
                opacity: 0.5;
              }

              60% {
                transform: scale(1.2);
                opacity: 1;
              }

              100% {
                transform: scale(1);
              }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
