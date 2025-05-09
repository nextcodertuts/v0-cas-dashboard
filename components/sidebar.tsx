"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { UserNav } from "@/components/user-nav";
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  Home,
  Search,
  Settings,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  HospitalIcon,
  Users,
  Heart,
  Activity,
} from "lucide-react";
import { Button } from "./ui/button";

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!session?.user) {
    return null;
  }

  const { role } = session.user;

  const isAdmin = role === "ADMIN";
  const isOfficeAgent = role === "OFFICE_AGENT";
  const isHospitalUser = role === "HOSPITAL_USER" || isOfficeAgent || isAdmin;

  return (
    <div
      className={cn(
        "flex h-screen flex-col border-r bg-card transition-all duration-300 sticky",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-14 items-center justify-between border-b px-4">
        {!isCollapsed && <span className="font-bold text-2xl">CAS</span>}
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          {isAdmin && (
            <>
              <Link
                href="/admin/dashboard"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                  pathname.startsWith("/admin/dashboard")
                    ? "bg-accent"
                    : "transparent"
                )}
                title="Dashboard"
              >
                <LayoutDashboard className="h-4 w-4" />
                {!isCollapsed && "Dashboard"}
              </Link>
              <Link
                href="/admin/hospitals"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                  pathname.startsWith("/admin/hospitals")
                    ? "bg-accent"
                    : "transparent"
                )}
              >
                <HospitalIcon className="h-4 w-4 text-green-400" />
                {!isCollapsed && "Hospitals"}
              </Link>
              <Link
                href="/admin/agents"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                  pathname.startsWith("/admin/agents")
                    ? "bg-accent"
                    : "transparent"
                )}
              >
                <Users className="h-4 w-4" />
                {!isCollapsed && "Agents"}
              </Link>
              <Link
                href="/admin/donations"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                  pathname.startsWith("/admin/donations")
                    ? "bg-accent"
                    : "transparent"
                )}
              >
                <Heart className="h-5 w-5 text-white" fill="red" />
                {!isCollapsed && "Donations"}
              </Link>
              <Link
                href="/agent/cards"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                  pathname.startsWith("/agent/cards")
                    ? "bg-accent"
                    : "transparent"
                )}
                title="Cards"
              >
                <CreditCard className="h-4 w-4 text-orange-400" />
                {!isCollapsed && "Cards"}
              </Link>
            </>
          )}

          {isOfficeAgent && (
            <Link
              href="/agent/dashboard"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                pathname.startsWith("/agent/dashboard")
                  ? "bg-accent"
                  : "transparent"
              )}
              title="Dashboard"
            >
              <LayoutDashboard className="h-4 w-4" />
              {!isCollapsed && "Dashboard"}
            </Link>
          )}

          {isHospitalUser && (
            <>
              <Link
                href="/hospital/lookup"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                  pathname.startsWith("/hospital/lookup")
                    ? "bg-accent"
                    : "transparent"
                )}
                title="Card Lookup"
              >
                <Search className="h-4 w-4" />
                {!isCollapsed && "Card Lookup"}
              </Link>
              <Link
                href="/hospital/beneficiaries"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                  pathname.startsWith("/hospital/beneficiaries")
                    ? "bg-accent"
                    : "transparent"
                )}
                title="Beneficiaries"
              >
                <Activity className="h-4 w-4 text-blue-400" />
                {!isCollapsed && "Beneficiaries"}
              </Link>
            </>
          )}

          {(isOfficeAgent || isAdmin) && (
            <>
              <Link
                href="/agent/households"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                  pathname.startsWith("/agent/households")
                    ? "bg-accent"
                    : "transparent"
                )}
                title="Households"
              >
                <Home className="h-4 w-4" />
                {!isCollapsed && "Households"}
              </Link>
            </>
          )}

          {isAdmin && (
            <>
              <Link
                href="/admin/plans"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                  pathname.startsWith("/admin/plans")
                    ? "bg-accent"
                    : "transparent"
                )}
                title="Plans"
              >
                <ClipboardList className="h-4 w-4" />
                {!isCollapsed && "Plans"}
              </Link>

              <Link
                href="/admin/audit-logs"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                  pathname === "/admin/audit-logs" ? "bg-accent" : "transparent"
                )}
                title="Audit Logs"
              >
                <FileText className="h-4 w-4" />
                {!isCollapsed && "Audit Logs"}
              </Link>

              <Link
                href="/admin/settings"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                  pathname === "/admin/settings" ? "bg-accent" : "transparent"
                )}
                title="Settings"
              >
                <Settings className="h-4 w-4" />
                {!isCollapsed && "Settings"}
              </Link>
            </>
          )}
        </nav>
      </div>

      <div className="border-t p-4">
        <UserNav isCollapsed={isCollapsed} />
      </div>
    </div>
  );
}
