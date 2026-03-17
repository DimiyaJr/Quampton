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

import { siteConfig } from "@/config/site";
import { SearchIcon } from "@/components/icons";
import { useAuth } from "@/lib/auth-context";

export const Navbar = () => {
  const { logout } = useAuth();

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

  const renderMenuLink = (item: { label: string; href: string }, index: number) => {
    if (item.label === "Logout") {
      return (
        <li key={`${item.label}-${index}`} className="p-2 hover:bg-gray-100 rounded">
          <button
            onClick={logout}
            className="w-full text-left text-sm text-red-600 font-medium hover:text-red-700"
          >
            Logout
          </button>
        </li>
      );
    }
    return (
      <li key={`${item.label}-${index}`} className="p-2 hover:bg-gray-100 rounded">
        <NextLink
          className={clsx(linkStyles({ color: "foreground" }), "data-[active=true]:text-primary data-[active=true]:font-medium")}
          href={item.href}
        >
          {item.label}
        </NextLink>
      </li>
    );
  };

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
        <NavbarItem className="relative group hidden lg:flex">
          <span className="cursor-pointer flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 hover:bg-primary-200 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#380556" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </span>
          <ul className="absolute hidden group-hover:flex flex-col bg-white shadow-lg mt-2 p-2 rounded right-0 z-50 min-w-[160px] top-full">
            {siteConfig.navMenuItems.map((item, index) => renderMenuLink(item, index))}
          </ul>
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
