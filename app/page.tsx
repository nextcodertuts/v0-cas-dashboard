"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === "authenticated") {
      switch (session.user.role) {
        case "ADMIN":
          router.push("/admin/dashboard")
          break
        case "OFFICE_AGENT":
          router.push("/agent/dashboard")
          break
        case "HOSPITAL_USER":
          router.push("/hospital/lookup")
          break
      }
    }
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  if (status === "authenticated") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Redirecting to dashboard...</p>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Health-Member Card Management System</CardTitle>
          <CardDescription>Manage health cards, members, and plans</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          <Button asChild>
            <Link href="/auth/signin">Sign In</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
