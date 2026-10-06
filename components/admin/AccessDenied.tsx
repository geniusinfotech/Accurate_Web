"use client";

import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 bg-gold/15 rounded-full flex items-center justify-center mb-5">
        <ShieldAlert className="h-8 w-8 text-gold-deep" />
      </div>
      <h1 className="font-serif text-2xl font-semibold text-charcoal">
        No permission
      </h1>
      <p className="text-charcoal/60 mt-2 max-w-sm">
        You don&apos;t have permission to view this section. Contact an admin to
        grant you access.
      </p>
      <Link
        href="/admin"
        className="mt-6 inline-flex items-center gap-2 btn-primary"
      >
        <ArrowLeft size={18} />
        Back to Dashboard
      </Link>
    </div>
  );
}