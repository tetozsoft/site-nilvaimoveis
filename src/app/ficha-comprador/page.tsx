import type { Metadata } from "next";
import { FichaPage, fichaMetadata } from "@/components/FichaPage";

export const generateMetadata = (): Promise<Metadata> => fichaMetadata("comprador");

export default function FichaCompradorPage() {
  return <FichaPage kind="comprador" />;
}
