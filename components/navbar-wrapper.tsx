"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";

export function NavbarWrapper() {
  const pathname = usePathname();
  if (pathname === "/" || pathname === "/auth") return null;
  return <Navbar />;
}
