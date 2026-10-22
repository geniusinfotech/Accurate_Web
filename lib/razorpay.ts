"use client";

import { apiRequest } from "./api-client";

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
    Razorpay?: new (options: RazorpayOptions) => {
      open: () => void;
      on?: (event: string, callback: (data: any) => void) => void;
    };
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

export interface OpenRazorpayArgs {
  key: string;
  amount: number;
  currency: string;
  orderId: string;
  customerName?: string;
  email?: string;
  phone?: string;
  onSuccess: (r: RazorpaySuccessResponse) => void;
  onDismiss?: () => void;
}

/** Opens the real Razorpay checkout. (Use rzp_test_ keys on the server to test without real money.) */
export async function openRazorpayCheckout(args: OpenRazorpayArgs): Promise<void> {
  try {
    await loadRazorpayScript();
    if (!window.Razorpay) {
      throw new Error("Razorpay script not available");
    }

    const rzp = new window.Razorpay({
      key: args.key,
      amount: args.amount,
      currency: args.currency,
      order_id: args.orderId,
      name: "Accurate Liquids",
      description: "Order Payment",
      prefill: {
        ...(args.customerName ? { name: args.customerName } : {}),
        ...(args.email ? { email: args.email } : {}),
        ...(args.phone ? { contact: args.phone } : {}),
      },
      theme: { color: "#244892" },
      modal: {
        ondismiss: () => {
          if (args.onDismiss) args.onDismiss();
        },
      },
      handler: args.onSuccess,
    });

    if (typeof rzp.on === "function") {
      rzp.on("payment.failed", (response: any) => {
        console.warn("Razorpay payment failed:", response?.error);
      });
    }

    rzp.open();
  } catch (err) {
    throw err;
  }
}
