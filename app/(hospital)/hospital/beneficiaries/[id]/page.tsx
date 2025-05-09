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
    address: string;
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

export default function BeneficiaryDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [beneficiary, setBeneficiary] = useState<Beneficiary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBeneficiaryDetails();
  }, []);

  const fetchBeneficiaryDetails = async () => {
    try {
      const response = await fetch(`/api/beneficiaries/${params.id}`);
      if (!response.ok) throw new Error("Failed to fetch beneficiary details");

      const data = await response.json();
      setBeneficiary(data);
    } catch (error) {
      console.error("Error fetching beneficiary details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-4">Loading beneficiary details...</div>
    );
  }

  if (!beneficiary) {
    return <div className="text-center py-4">Beneficiary not found</div>;
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">
          Beneficiary Details
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() =>
              router.push(`/hospital/beneficiaries/${params.id}/edit`)
            }
          >
            Edit Beneficiary
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
                Benefit Type
              </p>
              <p className="text-lg">{beneficiary.benefitType}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Status
              </p>
              <Badge className={getStatusColor(beneficiary.status)}>
                {beneficiary.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Amount
              </p>
              <p className="text-lg">{formatAmount(beneficiary.amount)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Description
              </p>
              <p className="text-lg">{beneficiary.description}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Start Date
              </p>
              <p className="text-lg">
                {format(new Date(beneficiary.startDate), "PPP")}
              </p>
            </div>
            {beneficiary.endDate && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  End Date
                </p>
                <p className="text-lg">
                  {format(new Date(beneficiary.endDate), "PPP")}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Household Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Head Name
              </p>
              <p className="text-lg">{beneficiary.household.headName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Phone</p>
              <p className="text-lg">{beneficiary.household.phone}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm font-medium text-muted-foreground">
                Address
              </p>
              <p className="text-lg">{beneficiary.household.address}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Card Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Card ID
              </p>
              <p className="text-lg">{beneficiary.card.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Plan</p>
              <p className="text-lg">{beneficiary.card.plan.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Status
              </p>
              <Badge
                className={
                  beneficiary.card.status === "ACTIVE"
                    ? "bg-green-500"
                    : "bg-red-500"
                }
              >
                {beneficiary.card.status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>
            List of members included in this benefit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {beneficiary.members.map((member, index) => (
              <Card key={index}>
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
