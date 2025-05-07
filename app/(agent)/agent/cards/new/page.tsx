/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
//@ts-nocheck
"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { CardStatus } from "@prisma/client";

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  durationDays: number;
}

interface Household {
  id: string;
  headName: string;
  address: string;
  phone: string;
  members: any[];
}

export default function NewCardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const householdId = searchParams.get("householdId");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [household, setHousehold] = useState<Household | null>(null);
  const [loadingHousehold, setLoadingHousehold] = useState(false);

  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [status, setStatus] = useState<CardStatus>("ACTIVE");
  const [issueDate, setIssueDate] = useState<Date>(new Date());

  useEffect(() => {
    fetchPlans();
    if (householdId) {
      fetchHousehold(householdId);
    }
  }, [householdId]);

  const fetchPlans = async () => {
    try {
      const response = await fetch("/api/plans");
      if (!response.ok) throw new Error("Failed to fetch plans");

      const data = await response.json();
      setPlans(data);
    } catch (error) {
      console.error("Error fetching plans:", error);
      setError("Failed to load plans. Please try again.");
    }
  };

  const fetchHousehold = async (id: string) => {
    setLoadingHousehold(true);
    try {
      const response = await fetch(`/api/households?id=${id}`);
      if (!response.ok) throw new Error("Failed to fetch household");

      const data = await response.json();

      setHousehold(data);
    } catch (error) {
      console.error("Error fetching household:", error);
      setError("Failed to load household information. Please try again.");
    } finally {
      setLoadingHousehold(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!householdId || !selectedPlanId || !issueDate) {
      setError("Please fill in all required fields");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/cards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          householdId,
          planId: selectedPlanId,
          status,
          issueDate,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create card");
      }

      router.push("/agent/cards");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred while creating the card");
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingHousehold) {
    return (
      <div className="text-center py-4">Loading household information...</div>
    );
  }

  console.log("household", household);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-bold tracking-tight">Issue New Card</h2>
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>

      {household && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Household Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Head Name
                </p>
                <p className="font-medium">{household[0].headName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Phone
                </p>
                <p>{household[0].phone}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Address
                </p>
                <p>{household[0].address}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Members
                </p>
                <p>{household[0].members.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Card Information</CardTitle>
            <CardDescription>
              Enter the details for the new health card
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="plan">Plan</Label>
              <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} - ₹{plan.price} ({plan.durationDays} days)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as CardStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                  <SelectItem value="EXPIRED">Expired</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="issueDate">Issue Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !issueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {issueDate ? (
                      format(issueDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={issueDate}
                    onSelect={(date) => date && setIssueDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              type="button"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Issue Card"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
