import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { PageFrame } from "@/components/storefront";
import { FadeIn } from "@/components/motion/FadeIn";

export default function NotFound() {
  return (
    <PageFrame>
      <main className="flex min-h-[75vh] flex-col items-center justify-center px-6 py-24 sm:py-32 lg:px-8 bg-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#f4f2ef] rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-64 h-64 bg-[#e8f0fe] rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>

        <FadeIn className="text-center max-w-2xl mx-auto relative z-10">
          <div className="flex justify-center mb-8">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#edf2fe] text-[#244892] shadow-sm">
              <Sparkles size={36} strokeWidth={1.5} />
            </div>
          </div>

          <div className="mb-6 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-[#244892]" />
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#244892]">
              Error 404
            </p>
            <span className="h-px w-10 bg-[#244892]" />
          </div>

          <h1 className="font-serif text-5xl font-normal tracking-tight text-[#0e1117] sm:text-6xl lg:text-7xl">
            Out of <em className="italic text-[#244892]">place.</em>
          </h1>

          <p className="mt-8 text-base leading-7 text-[#244892] sm:text-lg max-w-lg mx-auto">
            The page you're looking for seems to have vanished. It might have
            been moved, deleted, or perhaps never existed. Let's get you back to
            something familiar.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <Link
              href="/"
              className="group flex w-full sm:w-auto items-center justify-center gap-3 rounded-full bg-[#0e1117] px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-white shadow-sm transition-all duration-300 hover:bg-[#244892]"
            >
              Return Home
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
            <Link
              href="/shop"
              className="group flex w-full sm:w-auto items-center justify-center gap-3 rounded-full border border-slate-200 bg-white px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-[#0e1117] shadow-sm transition-all duration-300 hover:border-[#244892] hover:bg-[#244892] hover:text-white"
            >
              Explore Shop
            </Link>
          </div>
        </FadeIn>
      </main>
    </PageFrame>
  );
}
