/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  MoreHorizontal,
  Search,
  Printer,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import type { CardStatus } from "@prisma/client";

interface CardProps {
  id: string;
  status: CardStatus;
  issueDate: string;
  expiryDate: string;
  cardNumber: string;
  household: {
    id: string;
    headName: string;
    phone: string;
  };
  plan: {
    id: string;
    name: string;
  };
}

interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface CardsResponse {
  cards: CardProps[];
  pagination: PaginationInfo;
}

export default function CardsPage() {
  const router = useRouter();
  const [cards, setCards] = useState<CardProps[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchCards(currentPage, searchQuery);
  }, [currentPage]);

  const fetchCards = async (page: number = 1, search?: string) => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("page", page.toString());
      queryParams.append("limit", "10");

      if (search) {
        queryParams.append("search", search);
      }

      const response = await fetch(`/api/cards?${queryParams.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch cards");

      const data: CardsResponse = await response.json();
      setCards(data.cards);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching cards:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCards(1, searchQuery);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const getStatusColor = (status: CardStatus) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-500";
      case "SUSPENDED":
        return "bg-yellow-500";
      case "EXPIRED":
        return "bg-red-500";
      case "CANCELLED":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleViewDetails = (id: string) => {
    router.push(`/agent/cards/${id}`);
  };

  const handlePrintCard = (id: string) => {
    router.push(`/agent/cards/${id}/print`);
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const { page, totalPages } = pagination;

    // First page button
    buttons.push(
      <Button
        key="first"
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(1)}
        disabled={page === 1}
      >
        <ChevronsLeft className="h-4 w-4" />
      </Button>
    );

    // Previous page button
    buttons.push(
      <Button
        key="prev"
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(page - 1)}
        disabled={!pagination.hasPreviousPage}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
    );

    // Page number buttons
    const startPage = Math.max(1, page - 2);
    const endPage = Math.min(totalPages, page + 2);

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Button
          key={i}
          variant={i === page ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Button>
      );
    }

    // Next page button
    buttons.push(
      <Button
        key="next"
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(page + 1)}
        disabled={!pagination.hasNextPage}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    );

    // Last page button
    buttons.push(
      <Button
        key="last"
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(totalPages)}
        disabled={page === totalPages}
      >
        <ChevronsRight className="h-4 w-4" />
      </Button>
    );

    return buttons;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Cards</h2>
        <Button onClick={() => router.push("/agent/households")}>
          <Plus className="mr-2 h-4 w-4" /> Issue New Card
        </Button>
      </div>

      <Card>
        <CardHeader hidden>
          <CardTitle>Manage Cards</CardTitle>
          <CardDescription>View and manage all health cards</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSearch}
            className="flex w-full max-w-sm items-center space-x-2 mb-4"
          >
            <Input
              placeholder="Search cards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit">
              <Search className="h-4 w-4" />
            </Button>
          </form>

          {isLoading ? (
            <div className="text-center py-4">Loading cards...</div>
          ) : cards.length === 0 ? (
            <div className="text-center py-4">No cards found</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Head</TableHead>
                    <TableHead>Card Number</TableHead>
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
                      <TableCell className="font-medium">
                        {card.household.headName}
                      </TableCell>
                      <TableCell>{card.cardNumber}</TableCell>
                      <TableCell>{card.plan.name}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(card.status)}>
                          {card.status}
                        </Badge>
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
                            <DropdownMenuItem
                              onClick={() => handleViewDetails(card.id)}
                            >
                              View details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handlePrintCard(card.id)}
                            >
                              <Printer className="h-4 w-4 mr-2" />
                              Print card
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`/agent/cards/${card.id}/edit`)
                              }
                            >
                              Edit card
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination Controls */}
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.totalCount
                  )}{" "}
                  of {pagination.totalCount} cards
                </div>

                <div className="flex items-center space-x-2">
                  {renderPaginationButtons()}
                </div>
              </div>

              {/* Page size info */}
              <div className="text-xs text-muted-foreground mt-2 text-center">
                Page {pagination.page} of {pagination.totalPages}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
