import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ℰralibros - Catálogo Digital de Libros en Español",
  description:
    "Explorad un catálogo curado de libros en español. Encuentrad clasificaciones temáticas, detalles completos y acceso directo a las herramientas de consulta y análisis.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}