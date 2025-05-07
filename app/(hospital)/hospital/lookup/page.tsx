/* eslint-disable @typescript-eslint/no-unused-vars */
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

type CardStatus = "ACTIVE" | "SUSPENDED" | "EXPIRED" | "CANCELLED";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
  relation: string;
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
      // In a real app, this would be an API call
      // const response = await fetch(`/api/cards/lookup?query=${searchQuery}`)
      // if (!response.ok) throw new Error("Card not found")
      // const data = await response.json()

      // Simulating API response for demo
      setTimeout(() => {
        if (searchQuery === "123456") {
          setCardDetails({
            id: "card_123456",
            status: "ACTIVE",
            issueDate: "2023-01-01",
            expiryDate: "2024-01-01",
            household: {
              id: "household_123",
              headName: "John Doe",
              address: "123 Main St, City",
              phone: "+1234567890",
              members: [
                {
                  id: "member_1",
                  firstName: "John",
                  lastName: "Doe",
                  dob: "1980-01-01",
                  relation: "HEAD",
                },
                {
                  id: "member_2",
                  firstName: "Jane",
                  lastName: "Doe",
                  dob: "1985-05-15",
                  relation: "SPOUSE",
                },
              ],
            },
            plan: {
              id: "plan_1",
              name: "Premium Health Plan",
              description: "Comprehensive health coverage for the whole family",
            },
          });
        } else {
          setError(
            "Card not found. Please check the card number and try again."
          );
        }
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      setError("An error occurred while searching for the card.");
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
            Enter a card number to check eligibility and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="cardNumber">Card Number</Label>
              <div className="flex w-full items-center space-x-2">
                <Input
                  id="cardNumber"
                  placeholder="Enter card number"
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
                  <p>{cardDetails.id}</p>
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
                  <p>{new Date(cardDetails.issueDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Expiry Date
                  </p>
                  <p>{new Date(cardDetails.expiryDate).toLocaleDateString()}</p>
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
                          <p>{new Date(member.dob).toLocaleDateString()}</p>
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
