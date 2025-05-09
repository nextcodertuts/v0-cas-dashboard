"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { BenefitType } from "@prisma/client";
import { CardWithDetails, FormData } from "@/components/beneficiary/types";
import SearchCardSection from "@/components/beneficiary/search-card-section";
import MemberSelectionSection from "@/components/beneficiary/member-selection-section";
import BenefitDetailsForm from "@/components/beneficiary/benefit-details-form";

export default function NewBeneficiaryPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<CardWithDetails | null>(
    null
  );
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [formData, setFormData] = useState<FormData>({
    benefitType: "MEDICAL_CHECKUP",
    amount: "",
    description: "",
    startDate: new Date(),
    endDate: undefined,
  });

  const handleCardSelect = (card: CardWithDetails) => {
    setSelectedCard(card);
    setSelectedMembers([]); // Reset selected members when card changes
  };

  const handleMemberToggle = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleFormChange = (
    field: keyof FormData,
    value: string | Date | BenefitType | undefined
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!selectedCard) {
      setError("Please select a valid card");
      setIsLoading(false);
      return;
    }

    if (selectedMembers.length === 0) {
      setError("Please select at least one member");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/beneficiaries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          householdId: selectedCard.household.id,
          cardId: selectedCard.id,
          benefitType: formData.benefitType,
          amount: Number.parseFloat(formData.amount),
          description: formData.description,
          startDate: formData.startDate,
          endDate: formData.endDate,
          memberIds: selectedMembers,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create beneficiary");
      }

      router.push("/hospital/beneficiaries");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-bold tracking-tight">New Beneficiary</h2>
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Beneficiary Information</CardTitle>
            <CardDescription>Enter the beneficiary details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <SearchCardSection onCardSelect={handleCardSelect} />

              {selectedCard && (
                <MemberSelectionSection
                  members={selectedCard.household.members}
                  selectedMembers={selectedMembers}
                  onMemberToggle={handleMemberToggle}
                />
              )}
            </div>

            <BenefitDetailsForm
              formData={formData}
              onChange={handleFormChange}
            />
          </CardContent>
          <div className="flex justify-between p-6 pt-0">
            <Button
              variant="outline"
              type="button"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Beneficiary"}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
