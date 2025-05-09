"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { CardWithDetails } from "./types";

interface SearchCardSectionProps {
  onCardSelect: (card: CardWithDetails) => void;
}

export default function SearchCardSection({
  onCardSelect,
}: SearchCardSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [cards, setCards] = useState<CardWithDetails[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const handleSearch = async () => {
    setSearchError(null);

    if (!searchQuery.trim()) {
      setSearchError("Please enter a phone number or Aadhaar number");
      return;
    }

    try {
      const response = await fetch(`/api/cards/lookup?query=${searchQuery}`);

      if (!response.ok) {
        if (response.status === 404) {
          setSearchError("No cards found with the provided information");
          setCards([]);
          return;
        }
        throw new Error("Failed to search cards");
      }

      const data = await response.json();

      // Handle both single card and array of cards
      const cardsArray = Array.isArray(data) ? data : [data];
      setCards(cardsArray.filter((card) => card.status === "ACTIVE"));

      if (cardsArray.length === 0) {
        setSearchError("No active cards found");
      }
    } catch (error) {
      console.error("Error searching cards:", error);
      setSearchError("Failed to search cards");
    }
  };

  const handleCardSelect = (card: CardWithDetails) => {
    setSelectedCardId(card.id);
    onCardSelect(card);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Search Card</CardTitle>
        <CardDescription>
          Search by phone number or Aadhaar number
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Enter phone number or Aadhaar number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button type="button" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {searchError && (
          <p className="mt-2 text-sm text-red-500">{searchError}</p>
        )}

        {cards.length > 0 && (
          <div className="mt-4 space-y-2">
            {cards.map((card) => (
              <div
                key={card.id}
                className={cn(
                  "p-4 border rounded-lg cursor-pointer transition-colors",
                  selectedCardId === card.id
                    ? "border-primary bg-accent"
                    : "hover:bg-accent"
                )}
                onClick={() => handleCardSelect(card)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{card.household.headName}</p>
                    <p className="text-sm text-muted-foreground">
                      Card ID: {card.id}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Phone: {card.household.phone}
                    </p>
                  </div>
                  <Badge
                    className={cn(
                      "ml-2",
                      card.status === "ACTIVE" ? "bg-green-500" : "bg-red-500"
                    )}
                  >
                    {card.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
