/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { CardStatus } from "@prisma/client";

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
  cardNumber: string;
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

export default function PublicCardPage() {
  const params = useParams();
  const [card, setCard] = useState<CardDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCardDetails();
  }, []);

  const fetchCardDetails = async () => {
    try {
      const response = await fetch(`/api/cards/public/${params.cardNumber}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError("Card not found");
          return;
        }
        throw new Error("Failed to fetch card details");
      }

      const data = await response.json();
      setCard(data);
    } catch (error) {
      console.error("Error fetching card details:", error);
      setError("Failed to load card details");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading card details...</div>;
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-500">{error}</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
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
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Card Details</CardTitle>
            <Badge className={getStatusColor(card.status)}>{card.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Card Number
              </p>
              <p className="text-lg">{card.cardNumber}</p>
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
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Household Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Head Name
                </p>
                <p className="text-lg">{card.household.headName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Phone
                </p>
                <p className="text-lg">{card.household.phone}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Address
                </p>
                <p className="text-lg">{card.household.address}</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Members</h3>
            <div className="space-y-4">
              {card.household.members.map((member) => (
                <div key={member.id} className="border rounded-lg p-3">
                  <div className="grid grid-cols-2 gap-2">
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
                      <p>{format(new Date(member.dob), "PPP")}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
