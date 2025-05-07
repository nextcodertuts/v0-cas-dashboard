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

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
  relation: string;
  aadhaarNo: string;
}

interface HouseholdDetails {
  id: string;
  headName: string;
  address: string;
  phone: string;
  members: Member[];
  card?: {
    id: string;
    status: string;
    issueDate: string;
    expiryDate: string;
    plan: {
      name: string;
      description: string;
      price: number;
    };
  };
}

export default function HouseholdDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [household, setHousehold] = useState<HouseholdDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHouseholdDetails();
  }, []);

  const fetchHouseholdDetails = async () => {
    try {
      const response = await fetch(`/api/households/${params.id}`);
      if (!response.ok) throw new Error("Failed to fetch household details");

      const data = await response.json();
      setHousehold(data);
    } catch (error) {
      console.error("Error fetching household details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading household details...</div>;
  }

  if (!household) {
    return <div className="text-center py-4">Household not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Household Details</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/agent/households/${params.id}/edit`)}
          >
            Edit Household
          </Button>
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Head Name
              </p>
              <p className="text-lg">{household.headName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Phone</p>
              <p className="text-lg">{household.phone}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm font-medium text-muted-foreground">
                Address
              </p>
              <p className="text-lg">{household.address}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {household.card && (
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
                <Badge
                  className={
                    household.card.status === "ACTIVE"
                      ? "bg-green-500"
                      : household.card.status === "SUSPENDED"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }
                >
                  {household.card.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Plan
                </p>
                <p className="text-lg">{household.card.plan.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Issue Date
                </p>
                <p className="text-lg">
                  {format(new Date(household.card.issueDate), "PPP")}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Expiry Date
                </p>
                <p className="text-lg">
                  {format(new Date(household.card.expiryDate), "PPP")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>
            List of all members in this household
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {household.members.map((member) => (
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
