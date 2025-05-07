import type React from "react"
import { DashboardHeader } from "@/components/dashboard-header"

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader title="Office Agent Dashboard" />
      <div className="flex-1 p-8">{children}</div>
    </div>
  )
}
