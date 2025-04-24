"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function MainNav() {
  const items = [
    {
      title: "Home",
      href: "/",
    },
    {
      title: "Mensagens",
      href: "/mensagens",
    },
    {
      title: "Emails",
      href: "/emails",
    },
    {
      title: "Usuários",
      href: "/usuarios",
    },
  ]
  
  const pathname = usePathname()

  return (
    <div className="flex items-center space-x-6">
      <Link
        href="/"
        className="hidden items-center space-x-2 md:flex"
      >
        <span className="hidden font-bold sm:inline-block">
          DispararGao
        </span>
      </Link>
      <nav className="flex items-center space-x-6 text-sm font-medium">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "transition-colors hover:text-foreground/80",
              pathname === item.href
                ? "text-foreground font-semibold"
                : "text-foreground/60"
            )}
          >
            {item.title}
          </Link>
        ))}
      </nav>
    </div>
  )
}
