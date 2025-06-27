/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useSession } from "next-auth/react";

interface Household {
  id: string;
  headName: string;
  address: string;
  phone: string;
  members: any[];
  card: {
    id: string;
    status: string;
    expiryDate: string;
    plan: {
      name: string;
    };
  } | null;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface HouseholdsResponse {
  households: Household[];
  pagination: PaginationData;
}

export default function HouseholdsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [households, setHouseholds] = useState<Household[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [deleteHouseholdId, setDeleteHouseholdId] = useState<string | null>(
    null
  );

  const isAdmin = session?.user?.role === "ADMIN";
  const currentPage = parseInt(searchParams.get("page") || "1");

  useEffect(() => {
    fetchHouseholds(currentPage, searchQuery);
  }, [currentPage]);

  const fetchHouseholds = async (page: number = 1, search?: string) => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("page", page.toString());
      queryParams.append("limit", "10");
      if (search) {
        queryParams.append("search", search);
      }

      const response = await fetch(`/api/households?${queryParams.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch households");

      const data: HouseholdsResponse = await response.json();
      setHouseholds(data.households);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching households:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) {
      params.set("search", searchQuery);
    }
    params.set("page", "1"); // Reset to first page on search
    router.push(`/agent/households?${params.toString()}`);
    fetchHouseholds(1, searchQuery);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/agent/households?${params.toString()}`);
  };

  const getStatusColor = (status: string | undefined) => {
    if (!status) return "bg-gray-500";

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

  const handleViewDetails = (id: string) => {
    router.push(`/agent/households/${id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/agent/households/${id}/edit`);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/households/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete household");
      }

      await fetchHouseholds(currentPage, searchQuery);
      setDeleteHouseholdId(null);
    } catch (error) {
      console.error("Error deleting household:", error);
    }
  };

  const handleCreateCard = (id: string) => {
    router.push(`/agent/cards/new?householdId=${id}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Households</h2>
        <Button onClick={() => router.push("/agent/households/new")}>
          <Plus className="mr-2 h-4 w-4" /> New Household
        </Button>
      </div>

      <Card>
        <CardHeader hidden>
          <CardTitle>Manage Households</CardTitle>
          <CardDescription>
            View and manage all registered households
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSearch}
            className="flex w-full max-w-sm items-center space-x-2 mb-4"
          >
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
            <>
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
                      <TableCell className="font-medium">
                        {household.headName}
                      </TableCell>
                      <TableCell>{household.phone}</TableCell>
                      <TableCell>{household.members.length}</TableCell>
                      <TableCell>
                        {household.card ? (
                          <Badge
                            className={getStatusColor(household.card.status)}
                          >
                            {household.card.status}
                          </Badge>
                        ) : (
                          <Badge variant="outline">NO CARD</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {household.card?.plan.name || "N/A"}
                      </TableCell>
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
                              onClick={() => handleViewDetails(household.id)}
                            >
                              View details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEdit(household.id)}
                            >
                              Edit household
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {isAdmin && !household.card && (
                              <DropdownMenuItem
                                onClick={() => handleCreateCard(household.id)}
                              >
                                Issue card
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => setDeleteHouseholdId(household.id)}
                            >
                              Delete household
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination Controls */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {households.length} of {pagination.totalCount}{" "}
                  households
                  {searchQuery && ` for "${searchQuery}"`}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!pagination.hasPreviousPage}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <div className="flex items-center space-x-1">
                    {Array.from(
                      { length: Math.min(5, pagination.totalPages) },
                      (_, i) => {
                        let pageNumber;
                        if (pagination.totalPages <= 5) {
                          pageNumber = i + 1;
                        } else if (currentPage <= 3) {
                          pageNumber = i + 1;
                        } else if (currentPage >= pagination.totalPages - 2) {
                          pageNumber = pagination.totalPages - 4 + i;
                        } else {
                          pageNumber = currentPage - 2 + i;
                        }

                        return (
                          <Button
                            key={pageNumber}
                            variant={
                              currentPage === pageNumber ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => handlePageChange(pageNumber)}
                            className="w-8 h-8 p-0"
                          >
                            {pageNumber}
                          </Button>
                        );
                      }
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={!!deleteHouseholdId}
        onOpenChange={() => setDeleteHouseholdId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              household and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteHouseholdId && handleDelete(deleteHouseholdId)
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
