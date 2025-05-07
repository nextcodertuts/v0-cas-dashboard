"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useSession } from "next-auth/react"

export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname()
  const { data: session } = useSession()

  if (!session?.user) {
    return null
  }

  const { role } = session.user

  const isAdmin = role === "ADMIN"
  const isOfficeAgent = role === "OFFICE_AGENT" || isAdmin
  const isHospitalUser = role === "HOSPITAL_USER" || isOfficeAgent

  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)} {...props}>
      {isAdmin && (
        <Link
          href="/admin/dashboard"
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname.startsWith("/admin") ? "text-primary" : "text-muted-foreground",
          )}
        >
          Admin Dashboard
        </Link>
      )}

      {isOfficeAgent && (
        <Link
          href="/agent/dashboard"
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname.startsWith("/agent") ? "text-primary" : "text-muted-foreground",
          )}
        >
          Office Dashboard
        </Link>
      )}

      {isHospitalUser && (
        <Link
          href="/hospital/lookup"
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname.startsWith("/hospital") ? "text-primary" : "text-muted-foreground",
          )}
        >
          Hospital Lookup
        </Link>
      )}

      {isAdmin && (
        <>
          <Link
            href="/admin/users"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/admin/users" ? "text-primary" : "text-muted-foreground",
            )}
          >
            Users
          </Link>
          <Link
            href="/admin/audit-logs"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/admin/audit-logs" ? "text-primary" : "text-muted-foreground",
            )}
          >
            Audit Logs
          </Link>
        </>
      )}

      {isOfficeAgent && (
        <>
          <Link
            href="/agent/households"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/agent/households" ? "text-primary" : "text-muted-foreground",
            )}
          >
            Households
          </Link>
          <Link
            href="/agent/members"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/agent/members" ? "text-primary" : "text-muted-foreground",
            )}
          >
            Members
          </Link>
          <Link
            href="/agent/cards"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/agent/cards" ? "text-primary" : "text-muted-foreground",
            )}
          >
            Cards
          </Link>
          {isAdmin && (
            <Link
              href="/admin/plans"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === "/admin/plans" ? "text-primary" : "text-muted-foreground",
              )}
            >
              Plans
            </Link>
          )}
        </>
      )}
    </nav>
  )
}
