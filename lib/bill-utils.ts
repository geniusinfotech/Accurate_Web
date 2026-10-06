export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-IN").format(n);
}

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export function parseCurrency(str: string): number {
  return parseFloat(str.replace(/[^0-9.-]/g, "")) || 0;
}

export function roundToTwo(n: number): number {
  return Math.round(n * 100) / 100;
}