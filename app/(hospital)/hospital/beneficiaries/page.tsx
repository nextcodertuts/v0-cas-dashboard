"use client";

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
import { Plus, MoreHorizontal, Search } from "lucide-react";
import type { BenefitStatus, BenefitType } from "@prisma/client";

interface Beneficiary {
  id: string;
  benefitType: BenefitType;
  status: BenefitStatus;
  amount: number;
  description: string;
  startDate: string;
  endDate: string | null;
  household: {
    headName: string;
    phone: string;
  };
  card: {
    id: string;
    status: string;
    plan: {
      name: string;
    };
  };
  members: Array<{
    firstName: string;
    lastName: string;
    relation: string;
  }>;
}

export default function BeneficiariesPage() {
  const router = useRouter();
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  const fetchBeneficiaries = async (search?: string) => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) {
        queryParams.append("search", search);
      }

      const response = await fetch(
        `/api/beneficiaries?${queryParams.toString()}`
      );
      if (!response.ok) throw new Error("Failed to fetch beneficiaries");

      const data = await response.json();
      setBeneficiaries(data);
    } catch (error) {
      console.error("Error fetching beneficiaries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBeneficiaries(searchQuery);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: BenefitStatus) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-500";
      case "PENDING":
        return "bg-yellow-500";
      case "REJECTED":
        return "bg-red-500";
      case "COMPLETED":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Beneficiaries</h2>
        <Button onClick={() => router.push("/hospital/beneficiaries/new")}>
          <Plus className="mr-2 h-4 w-4" /> New Beneficiary
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Beneficiaries</CardTitle>
          <CardDescription>View and manage all beneficiaries</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSearch}
            className="flex w-full max-w-sm items-center space-x-2 mb-4"
          >
            <Input
              placeholder="Search beneficiaries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit">
              <Search className="h-4 w-4" />
            </Button>
          </form>

          {isLoading ? (
            <div className="text-center py-4">Loading beneficiaries...</div>
          ) : beneficiaries.length === 0 ? (
            <div className="text-center py-4">No beneficiaries found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Household</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {beneficiaries.map((beneficiary) => (
                  <TableRow key={beneficiary.id}>
                    <TableCell className="font-medium">
                      {beneficiary.household.headName}
                    </TableCell>
                    <TableCell>{beneficiary.benefitType}</TableCell>
                    <TableCell>{formatAmount(beneficiary.amount)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(beneficiary.status)}>
                        {beneficiary.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(beneficiary.startDate)}</TableCell>
                    <TableCell>
                      {beneficiary.endDate
                        ? formatDate(beneficiary.endDate)
                        : "N/A"}
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
                            onClick={() =>
                              router.push(
                                `/hospital/beneficiaries/${beneficiary.id}`
                              )
                            }
                          >
                            View details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(
                                `/hospital/beneficiaries/${beneficiary.id}/edit`
                              )
                            }
                          >
                            Edit beneficiary
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
  );
}
