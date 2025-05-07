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
import type { CardStatus } from "@prisma/client"

interface CardProps {
  id: string
  status: CardStatus
  issueDate: string
  expiryDate: string
  household: {
    id: string
    headName: string
    phone: string
  }
  plan: {
    id: string
    name: string
  }
}

export default function CardsPage() {
  const router = useRouter()
  const [cards, setCards] = useState<CardProps[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchCards()
  }, [])

  const fetchCards = async (search?: string) => {
    setIsLoading(true)
    try {
      const queryParams = new URLSearchParams()
      if (search) {
        queryParams.append("search", search)
      }

      const response = await fetch(`/api/cards?${queryParams.toString()}`)
      if (!response.ok) throw new Error("Failed to fetch cards")

      const data = await response.json()
      setCards(data)
    } catch (error) {
      console.error("Error fetching cards:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchCards(searchQuery)
  }

  const getStatusColor = (status: CardStatus) => {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const handleViewDetails = (id: string) => {
    router.push(`/agent/cards/${id}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Cards</h2>
        <Button onClick={() => router.push("/agent/households")}>
          <Plus className="mr-2 h-4 w-4" /> Issue New Card
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Cards</CardTitle>
          <CardDescription>View and manage all health cards</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2 mb-4">
            <Input placeholder="Search cards..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            <Button type="submit">
              <Search className="h-4 w-4" />
            </Button>
          </form>

          {isLoading ? (
            <div className="text-center py-4">Loading cards...</div>
          ) : cards.length === 0 ? (
            <div className="text-center py-4">No cards found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Household</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cards.map((card) => (
                  <TableRow key={card.id}>
                    <TableCell className="font-medium">{card.household.headName}</TableCell>
                    <TableCell>{card.plan.name}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(card.status)}>{card.status}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(card.issueDate)}</TableCell>
                    <TableCell>{formatDate(card.expiryDate)}</TableCell>
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
                          <DropdownMenuItem onClick={() => handleViewDetails(card.id)}>View details</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => router.push(`/agent/cards/${card.id}/edit`)}>
                            Edit card
                          </DropdownMenuItem>
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
