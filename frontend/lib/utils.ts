import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | null | undefined, code: string = "INR") {
  if (amount === null || amount === undefined) return "—";
  
  const symbols: Record<string, string> = {
    "INR": "₹",
    "USD": "$",
    "EUR": "€",
    "GBP": "£",
  };

  const symbol = symbols[code.toUpperCase()] || code;
  
  return `${symbol}${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
