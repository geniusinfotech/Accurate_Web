"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  CheckCircle2,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type NavbarProps = {
  onCart: () => void;
  count?: number;
};

const menuItemCls =
  "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-semibold text-[#0e1117] transition-colors hover:bg-[#f1efe9] hover:text-[#0e1117]";

/** Account pill: "Sign in" when logged out; Name + circular progress ring & percentage when logged in, with interactive profile progress card. */
function AccountMenu() {
  const router = useRouter();
  const { user, profileCompletion, isAuthenticated, isManager, isLoading, logout } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <Link
        href="/login"
        className="ml-1 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-[#0e1117] shadow-sm transition-all duration-200 hover:border-[#244892] hover:bg-[#244892] hover:text-white"
      >
        <UserRound size={15} strokeWidth={2} />
        {isLoading ? "Account" : "Sign in"}
      </Link>
    );
  }

  const firstName = user.name.split(" ")[0];
  const roleLabel =
    user.role === "admin"
      ? "Administrator"
      : user.role === "manager"
        ? "Manager"
        : "Customer";

  const pct = profileCompletion.percentage;
  const isComplete = profileCompletion.isComplete || pct >= 100;
  // Circumference for r=7.5 is 2 * Math.PI * 7.5 ~= 47.12
  const strokeDashoffset = 47.12 - (47.12 * pct) / 100;

  return (
    <div className="group relative ml-1">
      <Link
        href="/profile"
        aria-haspopup="menu"
        aria-label={isComplete ? `Account of ${user.name}` : `Account of ${user.name}, profile ${pct}% complete`}
        className="inline-flex max-w-[210px] items-center gap-2 rounded-full border border-[#244892]/30 bg-[#244892]/10 px-3.5 py-2 text-[13px] font-semibold text-[#244892] shadow-2xs transition-all duration-200 group-hover:bg-[#244892] group-hover:text-white group-focus-within:bg-[#244892] group-focus-within:text-white"
      >
        <UserRound size={15} strokeWidth={2} className="shrink-0" />
        <span className="truncate">{firstName}</span>

        {/* Circular Progress Ring + Percentage (Only shown when profile is incomplete < 100%) */}
        {!isComplete && (
          <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-1.5 py-0.5 text-[11px] font-bold text-[#244892] shadow-2xs transition-colors group-hover:bg-white group-hover:text-[#244892]">
            <svg className="size-3.5 -rotate-90 shrink-0" viewBox="0 0 20 20" aria-hidden="true">
              <circle
                cx="10"
                cy="10"
                r="7.5"
                stroke="currentColor"
                strokeWidth="2.5"
                fill="none"
                opacity="0.25"
              />
              <circle
                cx="10"
                cy="10"
                r="7.5"
                stroke="currentColor"
                strokeWidth="2.5"
                fill="none"
                strokeDasharray={47.12}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-500 ease-out"
              />
            </svg>
            <span className="tabular-nums font-extrabold tracking-tight">
              {pct}%
            </span>
          </span>
        )}
      </Link>

      <div className="invisible absolute right-0 top-full z-10 w-72 pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
        <div
          role="menu"
          className="rounded-2xl border border-slate-200 bg-white p-2.5 shadow-xl shadow-[#0e1117]/8"
        >
          <div className="px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#244892]">
                Signed in
              </p>
              <span className="inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                {roleLabel}
              </span>
            </div>
            <p className="mt-1 truncate text-sm font-bold text-[#0e1117]">
              {user.name}
            </p>
            {user.email && (
              <p className="truncate text-xs text-[#244892]">{user.email}</p>
            )}
          </div>

          {/* Profile Completion Interactive Card (Only shown when profile is incomplete < 100%) */}
          {!isComplete && (
            <div className="my-2 rounded-xl border border-slate-100 bg-slate-50/90 p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Profile Details</span>
                <span className="font-black tracking-tight text-[#244892]">
                  {pct}% Complete
                </span>
              </div>

              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-[#244892] transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>

              {profileCompletion.nextIncompleteItem && (
                <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-slate-200/60 pt-2 text-[11px]">
                  <span className="truncate text-slate-500">
                    Next: <strong className="text-slate-700">{profileCompletion.nextIncompleteItem.label}</strong>
                  </span>
                  <Link
                    href={profileCompletion.nextIncompleteItem.href}
                    className="shrink-0 font-bold text-[#244892] hover:underline"
                  >
                    Complete +25% →
                  </Link>
                </div>
              )}
            </div>
          )}

          {isManager && (
            <Link
              href="/admin"
              role="menuitem"
              className="mb-1 flex items-center gap-2.5 rounded-xl bg-[#0e1117] px-3 py-2 text-[13px] font-bold text-white transition-colors hover:bg-[#244892]"
            >
              <LayoutDashboard size={15} /> Admin dashboard
            </Link>
          )}
          <Link href="/profile" role="menuitem" className={menuItemCls}>
            <UserRound size={15} /> My profile
          </Link>
          <Link href="/orders" role="menuitem" className={menuItemCls}>
            <Package size={15} /> My orders
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={async () => {
              await logout();
              router.push("/");
            }}
            className={`${menuItemCls} w-full text-rose-600 hover:bg-rose-50 hover:text-rose-700 cursor-pointer`}
          >
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

  const { user, profileCompletion, isAuthenticated, isManager, logout } = useAuth();
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
      href: "/categories",
      label: "Categories",
      description: "Shop by category",
      number: "03",
    },
    {
      href: "/faq",
      label: "FAQ",
      description: "Everything you need to know",
      number: "04",
    },
    {
      href: "/contact",
      label: "Contact",
      description: "We'd love to hear from you",
      number: "05",
    },
  ];

  return (
    <>
      {/* =========================================================
          DESKTOP / MOBILE NAVBAR
      ========================================================= */}
      <header className="limewash-panel sticky top-0 z-[80] w-full border-b border-slate-200/80 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] w-full max-w-[1440px] items-center px-4 sm:px-6 lg:px-8 xl:px-10">
          {/* -----------------------------------------------------
              LOGO
          ----------------------------------------------------- */}
          <Link
            href="/"
            onClick={closeMenu}
            aria-label="Accurate Liquid home"
            className="group flex shrink-0 items-center transition-transform duration-300 hover:scale-[1.02]"
          >
            <Image
              src="/logo.png"
              width={160}
              height={160}
              priority
              alt="Accurate Liquid"
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
              className="relative rounded-full px-4 py-2.5 text-[13px] font-medium tracking-wide text-[#244892] transition-all duration-200 hover:text-[#0e1117] after:absolute after:bottom-1 after:left-4 after:right-4 after:h-px after:scale-x-0 after:bg-[#0e1117] after:transition-transform after:duration-200 hover:after:scale-x-100"
            >
              Shop
            </Link>

            <Link
              href="/about"
              className="relative rounded-full px-4 py-2.5 text-[13px] font-medium tracking-wide text-[#244892] transition-all duration-200 hover:text-[#0e1117] after:absolute after:bottom-1 after:left-4 after:right-4 after:h-px after:scale-x-0 after:bg-[#0e1117] after:transition-transform after:duration-200 hover:after:scale-x-100"
            >
              Our story
            </Link>

            <Link
              href="/categories"
              className="relative rounded-full px-4 py-2.5 text-[13px] font-medium tracking-wide text-[#244892] transition-all duration-200 hover:text-[#0e1117] after:absolute after:bottom-1 after:left-4 after:right-4 after:h-px after:scale-x-0 after:bg-[#0e1117] after:transition-transform after:duration-200 hover:after:scale-x-100"
            >
              Categories
            </Link>

            <Link
              href="/faq"
              className="relative rounded-full px-4 py-2.5 text-[13px] font-medium tracking-wide text-[#244892] transition-all duration-200 hover:text-[#0e1117] after:absolute after:bottom-1 after:left-4 after:right-4 after:h-px after:scale-x-0 after:bg-[#0e1117] after:transition-transform after:duration-200 hover:after:scale-x-100"
            >
              FAQ
            </Link>

            <Link
              href="/contact"
              className="relative rounded-full px-4 py-2.5 text-[13px] font-medium tracking-wide text-[#244892] transition-all duration-200 hover:text-[#0e1117] after:absolute after:bottom-1 after:left-4 after:right-4 after:h-px after:scale-x-0 after:bg-[#0e1117] after:transition-transform after:duration-200 hover:after:scale-x-100"
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
              flex
              h-11
              items-center
              gap-2
              rounded-full
              bg-[#244892]
              px-3 sm:px-4
              text-white
              shadow-md
              shadow-[#244892]/20
              transition-all duration-200
              hover:bg-[#1b3773]
              hover:shadow-lg
              hover:shadow-[#244892]/25
              active:scale-95
              ${bump ? "animate-[cart-bump_0.5s_ease]" : ""}
            `}
          >
            <ShoppingBag
              size={17}
              strokeWidth={2}
              className="transition-transform duration-300 group-hover:-rotate-6"
            />

            <span className="hidden sm:inline text-[13px] font-bold tracking-wide">
              Cart
            </span>

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
            className="ml-3 grid size-11 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-[#0e1117] shadow-sm transition-all duration-200 hover:border-[#244892] hover:bg-[#244892] hover:text-white active:scale-95 lg:hidden"
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
          className="limewash-section fixed inset-0 z-[100] flex min-h-[100dvh] flex-col lg:hidden"
        >
          {/* -----------------------------------------------------
              MOBILE MENU HEADER
          ----------------------------------------------------- */}
          <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-slate-200 px-5 sm:px-7">
            <Link
              href="/"
              onClick={closeMenu}
              aria-label="Accurate Liquid home"
              className="flex items-center"
            >
              <Image
                src="/logo.png"
                width={150}
                height={150}
                priority
                alt="Accurate Liquid"
                className="h-[58px] w-auto object-contain"
              />
            </Link>

            <button
              type="button"
              onClick={closeMenu}
              aria-label="Close navigation menu"
              autoFocus
              className="grid size-11 place-items-center rounded-full bg-[#0e1117] text-white transition-all duration-200 hover:bg-[#244892] active:scale-95"
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
              <p className="mb-5 px-4 text-[10px] font-bold uppercase tracking-[0.25em] text-[#244892]">
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
                      <span className="hidden w-7 text-[10px] font-bold tracking-widest text-slate-300 sm:block">
                        {link.number}
                      </span>

                      <div>
                        <span className="block text-[30px] font-extrabold leading-none tracking-[-0.04em] text-slate-950 transition-colors group-hover:text-[#1f4e9e] sm:text-[38px]">
                          {link.label}
                        </span>

                        <span className="mt-1.5 block text-xs font-medium text-slate-400 sm:text-sm">
                          {link.description}
                        </span>
                      </div>
                    </div>

                    <span className="grid size-11 shrink-0 place-items-center rounded-full border border-slate-200 text-[#0e1117] transition-all duration-200 group-hover:border-[#244892] group-hover:bg-[#244892] group-hover:text-white group-hover:rotate-45">
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
          <div className="shrink-0 border-t border-slate-200 bg-white/60 px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-5 sm:px-8">
            <div className="mx-auto w-full max-w-2xl">
              {isAuthenticated && user && (
                <div className="mb-3 rounded-2xl border border-[#244892]/20 bg-[#244892]/10 p-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#244892]">
                        <span className="size-2 rounded-full bg-emerald-500" />{" "}
                        Signed in
                      </p>
                      <p className="mt-0.5 truncate text-sm font-bold text-[#0e1117]">
                        {user.name}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {isManager && (
                        <Link
                          href="/admin"
                          onClick={closeMenu}
                          className="rounded-full bg-[#0e1117] px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#244892]"
                        >
                          Admin
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={async () => {
                          closeMenu();
                          await logout();
                          router.push("/");
                        }}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-50 cursor-pointer"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>

                  {/* Profile Completion Bar for Mobile (Only shown when profile is incomplete < 100%) */}
                  {!profileCompletion.isComplete && profileCompletion.percentage < 100 && (
                    <div className="mt-3 rounded-xl border border-white/70 bg-white/80 p-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">Profile Details</span>
                        <span className="font-bold text-[#244892]">
                          {profileCompletion.percentage}% Complete
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-[#244892] transition-all duration-500"
                          style={{ width: `${profileCompletion.percentage}%` }}
                        />
                      </div>
                      {profileCompletion.nextIncompleteItem && (
                        <div className="mt-2 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 truncate mr-2">
                            Next: <strong className="text-slate-700">{profileCompletion.nextIncompleteItem.label}</strong>
                          </span>
                          <Link
                            href={profileCompletion.nextIncompleteItem.href}
                            onClick={closeMenu}
                            className="shrink-0 font-bold text-[#244892] hover:underline"
                          >
                            Complete +25% →
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {/* Account */}
                <Link
                  href={accountHref}
                  onClick={closeMenu}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-bold text-[#0e1117] transition-all duration-200 hover:border-[#244892] hover:bg-[#244892] hover:text-white active:scale-[0.98]"
                >
                  <UserRound size={16} />
                  {isAuthenticated
                    ? profileCompletion.isComplete || profileCompletion.percentage >= 100
                      ? "Profile"
                      : `Profile (${profileCompletion.percentage}%)`
                    : "Sign in"}
                </Link>

                {/* Cart */}
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    onCart();
                  }}
                  className="relative inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#244892] px-4 text-sm font-bold text-white shadow-md shadow-[#244892]/15 transition-all duration-200 hover:bg-[#1b3773] active:scale-[0.98]"
                >
                  <ShoppingBag size={16} />
                  Cart
                  {count > 0 && (
                    <span className="grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-[10px] font-black text-[#244892]">
                      {count}
                    </span>
                  )}
                </button>
              </div>

              <div className="mt-5 flex items-center justify-center gap-2">
                <span className="size-1.5 rounded-full bg-[#244892]" />

                <p className="text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-[#244892]">
                  Pure clean · Certified quality · Surat, India
                </p>

                <span className="size-1.5 rounded-full bg-[#244892]" />
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
