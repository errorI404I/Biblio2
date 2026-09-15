import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Biblio2 | Control de presencia",
  description:
    "Consultá tus nodos, horarios, rankings y administrá tu comunidad.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
