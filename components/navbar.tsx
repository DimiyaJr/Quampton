"use client";

import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarBrand,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
} from "@nextui-org/navbar";
import { Input } from "@nextui-org/input";
import { link as linkStyles } from "@nextui-org/theme";
import NextLink from "next/link";
import clsx from "clsx";
import logo2 from "../public/logo2.jpg";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";

import { siteConfig } from "@/config/site";
import { SearchIcon } from "@/components/icons";
import { useAuth } from "@/lib/auth-context";

export const Navbar = () => {
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchInput = (
    <Input
      aria-label="Search"
      classNames={{
        inputWrapper: "bg-default-100",
        input: "text-sm",
      }}
      placeholder="Search..."
      startContent={
        <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
      }
      type="search"
    />
  );

  const menuItems = siteConfig.navMenuItems;

  return (
    <NextUINavbar maxWidth="xl" position="sticky">
      {/* Left Side Navigation */}
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/home">
            <Image
              src={logo2}
              alt="Logo"
              height={60}
              width={200}
              style={{ objectFit: "contain" }}
            />
          </NextLink>
        </NavbarBrand>
        <ul className="hidden lg:flex gap-4 justify-start ml-2">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <NextLink
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  "data-[active=true]:text-primary data-[active=true]:font-medium",
                )}
                href={item.href}
              >
                {item.label}
              </NextLink>
            </NavbarItem>
          ))}
        </ul>
      </NavbarContent>

      {/* Right Side Navigation */}
      <NavbarContent className="hidden sm:flex basis-1/5 sm:basis-full" justify="end">
        <NavbarItem className="hidden lg:flex">{searchInput}</NavbarItem>
        <NavbarItem className="hidden lg:flex">
          <div ref={dropdownRef} style={{ position: "relative" }}>
            <button
              onClick={() => setOpen((v) => !v)}
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: open ? "#dbeafe" : "#e0f2fe",
                border: "none",
                outline: "none",
                transition: "background 0.15s",
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0369a1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </button>

            {open && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  background: "#fff",
                  borderRadius: "12px",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
                  minWidth: "180px",
                  zIndex: 9999,
                  border: "1px solid #f1f5f9",
                  overflow: "hidden",
                  padding: "6px",
                }}
              >
                {menuItems.map((item, index) => {
                  if (item.label === "Logout") {
                    return (
                      <button
                        key={index}
                        onClick={() => { setOpen(false); logout(); }}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "9px 14px",
                          borderRadius: "8px",
                          background: "none",
                          border: "none",
                          fontSize: "14px",
                          fontWeight: 600,
                          color: "#dc2626",
                          cursor: "pointer",
                          display: "block",
                          transition: "background 0.12s",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#fef2f2")}
                        onMouseLeave={e => (e.currentTarget.style.background = "none")}
                      >
                        Logout
                      </button>
                    );
                  }
                  return (
                    <NextLink
                      key={index}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      style={{
                        display: "block",
                        padding: "9px 14px",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#1e293b",
                        textDecoration: "none",
                        transition: "background 0.12s",
                      }}
                      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "#f0f9ff")}
                      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "none")}
                    >
                      {item.label}
                    </NextLink>
                  );
                })}
              </div>
            )}
          </div>
        </NavbarItem>
      </NavbarContent>

      {/* Mobile Menu Toggle */}
      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu className="pt-4">
        <div className="px-2 mb-3">{searchInput}</div>
        <div className="mx-2 flex flex-col gap-1">
          {[...siteConfig.navItems, ...siteConfig.navMenuItems].map((item, index) => {
            if (item.label === "Logout") {
              return (
                <NavbarMenuItem key={`${item.label}-${index}`}>
                  <button
                    onClick={logout}
                    className="w-full text-left text-lg py-2 block text-red-600 font-medium"
                  >
                    Logout
                  </button>
                </NavbarMenuItem>
              );
            }
            return (
              <NavbarMenuItem key={`${item.label}-${index}`}>
                <NextLink
                  className={clsx(
                    linkStyles({ color: "foreground" }),
                    "data-[active=true]:text-primary data-[active=true]:font-medium text-lg py-2 block",
                  )}
                  href={item.href}
                >
                  {item.label}
                </NextLink>
              </NavbarMenuItem>
            );
          })}
        </div>
      </NavbarMenu>
    </NextUINavbar>
  );
};
