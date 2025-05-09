"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import type { CardStatus } from "@prisma/client";
import { format } from "date-fns";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
  relation: string;
  aadhaarNo: string;
}

interface CardDetails {
  id: string;
  status: CardStatus;
  issueDate: string;
  expiryDate: string;
  household: {
    id: string;
    headName: string;
    address: string;
    phone: string;
    members: Member[];
  };
  plan: {
    id: string;
    name: string;
    description: string;
  };
}

export default function HospitalLookup() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardDetails, setCardDetails] = useState<CardDetails | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);
    setCardDetails(null);

    try {
      const response = await fetch(`/api/cards/lookup?query=${searchQuery}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to find card");
      }

      const data = await response.json();

      setCardDetails(data[0]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred while searching"
      );
    } finally {
      setIsLoading(false);
    }
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

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Card Lookup</CardTitle>
          <CardDescription>
            Enter a mobile number or Aadhaar number to check eligibility and
            status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="searchQuery">
                Mobile Number or Aadhaar Number
              </Label>
              <div className="flex w-full items-center space-x-2">
                <Input
                  id="searchQuery"
                  placeholder="Enter mobile or Aadhaar number"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Searching..." : <Search className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </form>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {cardDetails && (
            <div className="mt-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Card Information</h3>
                <Badge className={getStatusColor(cardDetails.status)}>
                  {cardDetails.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Card ID
                  </p>
                  <p className="uppercase">{cardDetails.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Plan
                  </p>
                  <p>{cardDetails.plan.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Issue Date
                  </p>
                  <p>{format(cardDetails.issueDate, "dd/MM/yyyy")}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Expiry Date
                  </p>
                  <p>{format(cardDetails.expiryDate, "dd/MM/yyyy")}</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold mb-4">
                  Household Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Head Name
                    </p>
                    <p>{cardDetails.household.headName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Phone
                    </p>
                    <p>{cardDetails.household.phone}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Address
                    </p>
                    <p>{cardDetails.household.address}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold mb-4">Members</h3>
                <div className="space-y-4">
                  {cardDetails.household.members.map((member) => (
                    <div key={member.id} className="p-4 border rounded-md">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Name
                          </p>
                          <p>
                            {member.firstName} {member.lastName}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Relation
                          </p>
                          <p>{member.relation}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Date of Birth
                          </p>
                          <p>{format(member.dob, "dd/MM/yyyy")}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Aadhaar Number
                          </p>
                          <p>{member.aadhaarNo}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">
            For assistance, please contact the office.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
