import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return "";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
}

export function transactionTypeLabel(type: string): string {
  const map: Record<string, string> = {
    venda: "Venda",
    aluguel: "Aluguel",
    venda_aluguel: "Venda e Aluguel",
  };
  return map[type] ?? type;
}

export function socialUrl(platform: string, value: string): string {
  if (value.startsWith("http")) return value;

  const handle = value.replace(/^@/, "");
  const domainMap: Record<string, string> = {
    instagram: `https://instagram.com/${handle}`,
    tiktok: `https://tiktok.com/@${handle}`,
    facebook: `https://facebook.com/${handle.replace(/^facebook\.com\//, "")}`,
    linkedin: `https://linkedin.com/${handle.replace(/^linkedin\.com\//, "")}`,
    youtube: `https://youtube.com/${handle.replace(/^youtube\.com\//, "")}`,
  };
  return domainMap[platform] ?? value;
}

export function whatsappUrl(celular: string, text?: string): string {
  const digits = celular.replace(/\D/g, "");
  const number = digits.startsWith("55") ? digits : `55${digits}`;
  const base = `https://wa.me/${number}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
