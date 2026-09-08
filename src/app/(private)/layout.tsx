import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/AppShell";

type PrivateLayoutProps = {
  children: ReactNode;
};

export default function PrivateLayout({
  children,
}: PrivateLayoutProps) {
  return <AppShell>{children}</AppShell>;
}