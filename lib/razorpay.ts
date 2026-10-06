"use client";

export interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name?: string;
  description?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  handler: (response: RazorpaySuccessResponse) => void;
  modal?: { ondismiss?: () => void };
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

const CHECKOUT_JS = "https://checkout.razorpay.com/v1/checkout.js";

let scriptPromise: Promise<void> | null = null;

/** Load Razorpay checkout.js once (singleton). */
export function loadRazorpayScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("No window"));
  if (window.Razorpay) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = CHECKOUT_JS;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("Failed to load Razorpay checkout. Check connection and retry."));
    };
    document.body.appendChild(script);
  });
  return scriptPromise;
}

export async function openRazorpayCheckout(args: {
  key: string;
  amount: number;
  currency: string;
  orderId: string;
  customerName?: string;
  email?: string;
  phone?: string;
  onSuccess: (r: RazorpaySuccessResponse) => void;
  onDismiss?: () => void;
}): Promise<void> {
  await loadRazorpayScript();
  if (!window.Razorpay) throw new Error("Razorpay failed to initialise.");
  const rzp = new window.Razorpay({
    key: args.key,
    amount: args.amount,
    currency: args.currency,
    order_id: args.orderId,
    name: "Accurate",
    description: "Order payment",
    prefill: {
      ...(args.customerName ? { name: args.customerName } : {}),
      ...(args.email ? { email: args.email } : {}),
      ...(args.phone ? { contact: args.phone } : {}),
    },
    theme: { color: "#1f4e9e" },
    handler: args.onSuccess,
    modal: { ondismiss: args.onDismiss },
  });
  rzp.open();
}
