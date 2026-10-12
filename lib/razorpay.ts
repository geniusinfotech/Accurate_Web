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

/**
 * Opens Razorpay checkout.
 * If in test/development mode with an order_test_ order ID, opens the
 * interactive Razorpay Sandbox simulator so checkout and payments can be
 * verified end-to-end even without live merchant credentials.
 */
export async function openRazorpayCheckout(args: OpenRazorpayArgs): Promise<void> {
  if (args.orderId.startsWith("order_test_")) {
    return openRazorpaySandboxModal(args);
  }

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
      theme: { color: "#1f4e9e" },
      handler: args.onSuccess,
      modal: { ondismiss: args.onDismiss },
    });
    rzp.open();
  } catch (err) {
    // If external Razorpay script fails or rejects keys in development,
    // fallback gracefully to sandbox simulator so developer is not blocked.
    if (process.env.NODE_ENV !== "production") {
      console.warn("Falling back to Razorpay sandbox modal:", err);
      return openRazorpaySandboxModal(args);
    }
    throw err;
  }
}

/**
 * Built-in Razorpay Sandbox Simulator modal.
 * Renders an accessible, responsive Razorpay-styled payment modal.
 */
function openRazorpaySandboxModal(args: OpenRazorpayArgs): Promise<void> {
  return new Promise<void>((resolve) => {
    const existing = document.getElementById("rzp-sandbox-backdrop");
    if (existing) existing.remove();

    const formattedAmount = `₹${Math.round(args.amount / 100).toLocaleString("en-IN")}`;

    const backdrop = document.createElement("div");
    backdrop.id = "rzp-sandbox-backdrop";
    backdrop.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.7);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      animation: rzpFadeIn 0.2s ease-out;
    `;

    const style = document.createElement("style");
    style.textContent = `
      @keyframes rzpFadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes rzpPopIn { from { transform: scale(0.96); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      .rzp-method-btn {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        padding: 12px 14px;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        background: #fff;
        font-size: 14px;
        font-weight: 500;
        color: #1e293b;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .rzp-method-btn:hover {
        border-color: #1f4e9e;
        background: #f8fafc;
      }
      .rzp-method-btn.active {
        border-color: #1f4e9e;
        background: #f0f6ff;
        font-weight: 600;
        color: #1f4e9e;
      }
    `;
    backdrop.appendChild(style);

    const card = document.createElement("div");
    card.style.cssText = `
      width: 100%;
      max-width: 440px;
      background: #ffffff;
      border-radius: 18px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
      animation: rzpPopIn 0.2s ease-out;
      display: flex;
      flex-direction: column;
    `;

    card.innerHTML = `
      <div style="background: linear-gradient(135deg, #0c2340 0%, #1f4e9e 100%); color: #fff; padding: 20px; position: relative;">
        <button id="rzp-btn-close" type="button" aria-label="Close" style="position: absolute; top: 16px; right: 16px; background: rgba(255,255,255,0.15); border: none; color: #fff; width: 28px; height: 28px; border-radius: 50%; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; line-height: 1;">✕</button>
        <div style="display: flex; align-items: center; gap: 8px;">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L3 7V12C3 17.52 6.84 22.74 12 24C17.16 22.74 21 17.52 21 12V7L12 2Z" fill="#38bdf8"/>
            <path d="M10 15.5L6.5 12L7.91 10.59L10 12.67L16.09 6.59L17.5 8L10 15.5Z" fill="#0c2340"/>
          </svg>
          <span style="font-weight: 800; letter-spacing: 0.5px; font-size: 15px;">RAZORPAY</span>
          <span style="background: #38bdf8; color: #0c2340; font-size: 10px; font-weight: 800; padding: 2px 7px; border-radius: 999px; text-transform: uppercase;">SANDBOX</span>
        </div>
        <div style="margin-top: 14px; display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <div style="font-size: 12px; opacity: 0.85;">Accurate Liquids Store</div>
            <div style="font-size: 11px; opacity: 0.7; margin-top: 2px;">Order: ${args.orderId}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">${formattedAmount}</div>
            <div style="font-size: 11px; opacity: 0.8;">${args.currency || "INR"}</div>
          </div>
        </div>
      </div>

      <div style="padding: 20px; display: flex; flex-direction: column; gap: 14px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 14px; font-size: 13px; color: #334155;">
          <div style="font-weight: 600; color: #0f172a; margin-bottom: 2px;">Simulating Razorpay Payment</div>
          <div style="font-size: 12px; color: #64748b;">
            Customer: <strong>${args.customerName || "Customer"}</strong> ${args.phone ? `• ${args.phone}` : ""}
          </div>
        </div>

        <div style="font-size: 12px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;">
          Choose Payment Mode
        </div>

        <div style="display: grid; gap: 8px;">
          <button type="button" class="rzp-method-btn active" data-method="upi">
            <span style="font-size: 18px;">📱</span>
            <div style="flex: 1; text-align: left;">
              <div>UPI (Google Pay, PhonePe, Paytm, BHIM)</div>
              <div style="font-size: 11px; color: #64748b;">Fastest checkout with instant approval</div>
            </div>
            <span style="color: #10b981; font-weight: 700; font-size: 11px;">POPULAR</span>
          </button>

          <button type="button" class="rzp-method-btn" data-method="card">
            <span style="font-size: 18px;">💳</span>
            <div style="flex: 1; text-align: left;">
              <div>Credit / Debit Cards</div>
              <div style="font-size: 11px; color: #64748b;">Visa, MasterCard, RuPay, Maestro</div>
            </div>
          </button>

          <button type="button" class="rzp-method-btn" data-method="netbanking">
            <span style="font-size: 18px;">🏦</span>
            <div style="flex: 1; text-align: left;">
              <div>Net Banking</div>
              <div style="font-size: 11px; color: #64748b;">HDFC, ICICI, SBI, Axis &amp; 50+ Banks</div>
            </div>
          </button>
        </div>

        <div id="rzp-method-details" style="background: #f1f5f9; border-radius: 10px; padding: 10px 12px; font-size: 12px; color: #475569;">
          Selected: <strong>UPI Simulation</strong> (Instant authorization)
        </div>

        <div id="rzp-error-box" style="display: none; background: #fee2e2; border: 1px solid #f87171; color: #991b1b; padding: 10px 12px; border-radius: 10px; font-size: 12px;"></div>

        <div style="margin-top: 4px; display: flex; flex-direction: column; gap: 10px;">
          <button id="rzp-btn-pay" type="button" style="
            width: 100%;
            background: #1f4e9e;
            color: #fff;
            border: none;
            border-radius: 12px;
            padding: 14px;
            font-size: 15px;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(31, 78, 158, 0.35);
            transition: all 0.15s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          ">
            <span>Pay ${formattedAmount}</span>
            <span style="font-size: 16px;">→</span>
          </button>

          <button id="rzp-btn-cancel" type="button" style="
            width: 100%;
            background: transparent;
            color: #64748b;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 10px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
          ">
            Cancel &amp; return to checkout
          </button>
        </div>

        <div style="text-align: center; font-size: 11px; color: #94a3b8; display: flex; align-items: center; justify-content: center; gap: 6px;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
          </svg>
          Secured with 256-bit encryption • Razorpay Certified
        </div>
      </div>
    `;

    backdrop.appendChild(card);
    document.body.appendChild(backdrop);

    const close = () => {
      window.removeEventListener("keydown", handleKeyDown);
      backdrop.remove();
      if (args.onDismiss) args.onDismiss();
      resolve();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handleKeyDown);

    // Method tab selection
    const methodBtns = card.querySelectorAll<HTMLButtonElement>(".rzp-method-btn");
    const detailsBox = card.querySelector<HTMLDivElement>("#rzp-method-details");
    methodBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        methodBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const m = btn.getAttribute("data-method");
        if (detailsBox) {
          if (m === "upi") detailsBox.innerHTML = `Selected: <strong>UPI Simulation</strong> (Instant test authorization)`;
          if (m === "card") detailsBox.innerHTML = `Selected: <strong>Test Card</strong> (•••• 4111 Visa)`;
          if (m === "netbanking") detailsBox.innerHTML = `Selected: <strong>Net Banking</strong> (HDFC / ICICI / SBI)`;
        }
      });
    });

    // Close and Cancel buttons
    const btnClose = card.querySelector<HTMLButtonElement>("#rzp-btn-close");
    const btnCancel = card.querySelector<HTMLButtonElement>("#rzp-btn-cancel");
    if (btnClose) btnClose.addEventListener("click", close);
    if (btnCancel) btnCancel.addEventListener("click", close);

    // Pay button
    const btnPay = card.querySelector<HTMLButtonElement>("#rzp-btn-pay");
    const errBox = card.querySelector<HTMLDivElement>("#rzp-error-box");

    if (btnPay) {
      btnPay.addEventListener("click", async () => {
        btnPay.disabled = true;
        btnPay.style.opacity = "0.7";
        btnPay.innerHTML = `<span>Processing with Razorpay…</span>`;
        if (errBox) errBox.style.display = "none";

        try {
          const testPaymentId = `pay_test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          const res = await apiRequest<{
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }>("/payment/dev-sign-test", {
            method: "POST",
            body: JSON.stringify({
              razorpay_order_id: args.orderId,
              razorpay_payment_id: testPaymentId,
            }),
          });

          window.removeEventListener("keydown", handleKeyDown);
          backdrop.remove();

          args.onSuccess({
            razorpay_order_id: res.razorpay_order_id,
            razorpay_payment_id: res.razorpay_payment_id,
            razorpay_signature: res.razorpay_signature,
          });
          resolve();
        } catch (e: any) {
          btnPay.disabled = false;
          btnPay.style.opacity = "1";
          btnPay.innerHTML = `<span>Pay ${formattedAmount}</span><span>→</span>`;
          if (errBox) {
            errBox.textContent = e?.message || "Could not sign the test payment. Check backend connection.";
            errBox.style.display = "block";
          }
        }
      });
    }
  });
}
