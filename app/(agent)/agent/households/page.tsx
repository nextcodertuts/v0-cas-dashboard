"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Plus, MoreHorizontal, Search } from "lucide-react"

interface Household {
  id: string
  headName: string
  address: string
  phone: string
  members: any[]
  card: {
    id: string
    status: string
    expiryDate: string
    plan: {
      name: string
    }
  } | null
}

export default function HouseholdsPage() {
  const router = useRouter()
  const [households, setHouseholds] = useState<Household[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchHouseholds()
  }, [])

  const fetchHouseholds = async (search?: string) => {
    setIsLoading(true)
    try {
      const queryParams = new URLSearchParams()
      if (search) {
        queryParams.append("search", search)
      }

      const response = await fetch(`/api/households?${queryParams.toString()}`)
      if (!response.ok) throw new Error("Failed to fetch households")

      const data = await response.json()
      setHouseholds(data)
    } catch (error) {
      console.error("Error fetching households:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchHouseholds(searchQuery)
  }

  const getStatusColor = (status: string | undefined) => {
    if (!status) return "bg-gray-500"

    switch (status) {
      case "ACTIVE":
        return "bg-green-500"
      case "SUSPENDED":
        return "bg-yellow-500"
      case "EXPIRED":
        return "bg-red-500"
      case "CANCELLED":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const handleViewDetails = (id: string) => {
    router.push(`/agent/households/${id}`)
  }

  const handleCreateCard = (id: string) => {
    router.push(`/agent/cards/new?householdId=${id}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Households</h2>
        <Button onClick={() => router.push("/agent/households/new")}>
          <Plus className="mr-2 h-4 w-4" /> New Household
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Households</CardTitle>
          <CardDescription>View and manage all registered households</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2 mb-4">
            <Input
              placeholder="Search households..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit">
              <Search className="h-4 w-4" />
            </Button>
          </form>

          {isLoading ? (
            <div className="text-center py-4">Loading households...</div>
          ) : households.length === 0 ? (
            <div className="text-center py-4">No households found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Head Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Card Status</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {households.map((household) => (
                  <TableRow key={household.id}>
                    <TableCell className="font-medium">{household.headName}</TableCell>
                    <TableCell>{household.phone}</TableCell>
                    <TableCell>{household.members.length}</TableCell>
                    <TableCell>
                      {household.card ? (
                        <Badge className={getStatusColor(household.card.status)}>{household.card.status}</Badge>
                      ) : (
                        <Badge variant="outline">NO CARD</Badge>
                      )}
                    </TableCell>
                    <TableCell>{household.card?.plan.name || "N/A"}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleViewDetails(household.id)}>
                            View details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {!household.card && (
                            <DropdownMenuItem onClick={() => handleCreateCard(household.id)}>
                              Issue card
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
