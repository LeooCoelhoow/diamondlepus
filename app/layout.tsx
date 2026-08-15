import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Diamond Lepus | Impressão 3D com Identidade",
  description:
    "Diamond Lepus — produtos de impressão 3D premium com personalização exclusiva. Descubra o DISUP e outros produtos únicos feitos sob medida.",
  keywords: ["impressão 3D", "Diamond Lepus", "personalização", "DISUP", "suporte de lata 3D"],
  openGraph: {
    title: "Diamond Lepus | Impressão 3D com Identidade",
    description:
      "Produtos de impressão 3D premium com personalização exclusiva.",
    siteName: "Diamond Lepus",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
