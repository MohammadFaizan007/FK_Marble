export const mainNavigation = [
  { label: "Home", href: "/", id: "home" },
  { label: "Collections", href: "/products", id: "collections" },
  { label: "About Us", href: "/#about", id: "about" },
  { label: "Gallery", href: "/#gallery", id: "gallery" },
  { label: "Contact Us", href: "/#contact", id: "contact" },
] as const;

export type MainNavItem = (typeof mainNavigation)[number];
