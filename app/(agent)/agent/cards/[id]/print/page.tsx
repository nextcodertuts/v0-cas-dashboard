/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable react-hooks/exhaustive-deps */
// @ts-nocheck
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import HelpCard from "@/components/help-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

interface CardDetails {
  id: string;
  status: string;
  issueDate: string;
  expiryDate: string;
  cardNumber: string;
  household: {
    headName: string;
    phone: string;
    address: string;
    members: Array<{
      firstName: string;
      lastName: string;
      relation: string;
      dob: string;
    }>;
  };
  plan: {
    name: string;
  };
}

export default function PrintCardPage() {
  const router = useRouter();
  const params = useParams();
  const [card, setCard] = useState<CardDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const frontCardRef = useRef<HTMLDivElement>(null);
  const backCardRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4 print:hidden">
        <h2 className="text-3xl font-bold tracking-tight">Card Download</h2>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <Card className="print:shadow-none print:border-none">
        <CardHeader>
          <CardTitle>Card Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <HelpCard
            cardId={card.cardNumber}
            issueDate={new Date(card.issueDate)}
            expiryDate={new Date(card.expiryDate)}
            members={card.household.members}
            frontRef={frontCardRef}
            backRef={backCardRef}
          />
        </CardContent>
      </Card>
    </div>
  );
}
