import type { Metadata } from "next";
import { Providers } from "./providers";
import { fetchConfigServer } from "@/lib/cdn";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const config = await fetchConfigServer().catch(() => null);
  return {
    title: {
      default: config?.site_name || "Imobiliária",
      template: `%s | ${config?.site_name || "Imobiliária"}`,
    },
    description: config?.seo?.description || "Encontre o imóvel dos seus sonhos",
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = await fetchConfigServer().catch(() => null);

  return (
    <html lang="pt-BR">
      <body>
        <Providers initialConfig={config}>{children}</Providers>
      </body>
    </html>
  );
}
