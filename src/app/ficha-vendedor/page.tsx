import type { Metadata } from "next";
import { FichaPage, fichaMetadata } from "@/components/FichaPage";

export const generateMetadata = (): Promise<Metadata> => fichaMetadata("vendedor");

export default function FichaVendedorPage() {
  return <FichaPage kind="vendedor" />;
}
