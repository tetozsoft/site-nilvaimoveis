import type { Metadata } from "next";
import { Suspense } from "react";
import { ImoveisClient } from "./ImoveisClient";

export const metadata: Metadata = {
  title: "Imóveis",
  description: "Explore nossa seleção completa de imóveis e encontre o lugar perfeito para você.",
};

export default function ImoveisPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ImoveisClient />
    </Suspense>
  );
}
