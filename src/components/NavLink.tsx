"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavLinkProps extends Omit<React.ComponentProps<typeof Link>, "className"> {
  className?: string;
  activeClassName?: string;
  ref?: React.Ref<HTMLAnchorElement>;
}

function NavLink({ className, activeClassName, href, ref, ...props }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname === href.toString();

  return (
    <Link
      ref={ref}
      href={href}
      className={cn(className, isActive && activeClassName)}
      {...props}
    />
  );
}

export { NavLink };
