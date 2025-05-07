import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"

interface DashboardHeaderProps {
  title: string
}

export function DashboardHeader({ title }: DashboardHeaderProps) {
  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <h1 className="text-lg font-semibold mr-6">{title}</h1>
        <MainNav className="mx-6" />
        <div className="ml-auto flex items-center space-x-4">
          <UserNav />
        </div>
      </div>
    </div>
  )
}
