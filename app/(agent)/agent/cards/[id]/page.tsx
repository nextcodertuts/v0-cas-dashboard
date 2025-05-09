/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { CardStatus } from "@prisma/client";

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
    members: Array<{
      id: string;
      firstName: string;
      lastName: string;
      dob: string;
      relation: string;
      aadhaarNo: string;
    }>;
  };
  plan: {
    id: string;
    name: string;
    description: string;
    price: number;
    durationDays: number;
  };
}

export default function CardDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [card, setCard] = useState<CardDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCardDetails();
  }, []);

  const fetchCardDetails = async () => {
    try {
      const response = await fetch(`/api/cards/${params.id}`);
      if (!response.ok) throw new Error("Failed to fetch card details");

      const data = await response.json();
      setCard(data);
    } catch (error) {
      console.error("Error fetching card details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading card details...</div>;
  }

  if (!card) {
    return <div className="text-center py-4">Card not found</div>;
  }

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Card Details</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/agent/cards/${params.id}/edit`)}
          >
            Edit Card
          </Button>
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Card Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Status
              </p>
              <Badge className={getStatusColor(card.status)}>
                {card.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Plan</p>
              <p className="text-lg">{card.plan.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Issue Date
              </p>
              <p className="text-lg">
                {format(new Date(card.issueDate), "PPP")}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Expiry Date
              </p>
              <p className="text-lg">
                {format(new Date(card.expiryDate), "PPP")}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Plan Price
              </p>
              <p className="text-lg">₹{card.plan.price}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Duration
              </p>
              <p className="text-lg">{card.plan.durationDays} days</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Household Information</CardTitle>
          <CardDescription>Details of the card holder</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Head Name
              </p>
              <p className="text-lg">{card.household.headName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Phone</p>
              <p className="text-lg">{card.household.phone}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm font-medium text-muted-foreground">
                Address
              </p>
              <p className="text-lg">{card.household.address}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>List of covered members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {card.household.members.map((member) => (
              <Card key={member.id}>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Name
                      </p>
                      <p className="text-lg">
                        {member.firstName} {member.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Relation
                      </p>
                      <p className="text-lg">{member.relation}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Date of Birth
                      </p>
                      <p className="text-lg">
                        {format(new Date(member.dob), "PPP")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Aadhaar Number
                      </p>
                      <p className="text-lg">{member.aadhaarNo}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
