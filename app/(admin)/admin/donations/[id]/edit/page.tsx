/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import type React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { DonorType, PaymentMethod } from "@prisma/client";

interface Donation {
  id: string;
  amount: number | null;
  description: string;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  donorAddress: string;
  donorType: DonorType;
  donorPAN: string;
  organizationName: string | null;
  paymentMethod: PaymentMethod;
  paymentReference: string;
  paymentDate: Date;
  isAnonymous: boolean;
  notes: string;
}

const DonationEditPage = () => {
  const params = useParams();
  const router = useRouter();

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [donorAddress, setDonorAddress] = useState("");
  const [donorType, setDonorType] = useState<DonorType>("INDIVIDUAL");
  const [donorPAN, setDonorPAN] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (params.id) {
      fetchDonation();
    }
  }, [params.id]);

  const fetchDonation = async () => {
    try {
      const response = await fetch(`/api/donations/${params.id}`);
      if (!response.ok) throw new Error("Failed to fetch donation");

      const data = await response.json();
      setAmount(data.amount?.toString() || "");
      setDescription(data.description);
      // Set new fields
      setDonorName(data.donorName || "");
      setDonorEmail(data.donorEmail || "");
      setDonorPhone(data.donorPhone || "");
      setDonorAddress(data.donorAddress || "");
      setDonorType(data.donorType || "INDIVIDUAL");
      setDonorPAN(data.donorPAN || "");
      setOrganizationName(data.organizationName || "");
      setPaymentMethod(data.paymentMethod || "CASH");
      setPaymentReference(data.paymentReference || "");
      setPaymentDate(
        data.paymentDate ? new Date(data.paymentDate) : new Date()
      );
      setIsAnonymous(data.isAnonymous || false);
      setNotes(data.notes || "");
      console.log("data", data);
    } catch (error) {
      console.error("Error fetching donation:", error);
      setError("Failed to load donation");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/donations/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amount || null,
          description,
          donorName,
          donorEmail,
          donorPhone,
          donorAddress,
          donorType,
          donorPAN,
          organizationName,
          paymentMethod,
          paymentReference,
          paymentDate,
          isAnonymous,
          notes,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update donation");
      }

      router.push("/admin/donations");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    console.error(error);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Donation</CardTitle>
        <CardDescription>Edit the donation details below.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4 ">
          <div className="space-y-2">
            <Label htmlFor="donorType">Donor Type</Label>
            <Select
              value={donorType}
              onValueChange={(value) => setDonorType(value as DonorType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select donor type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                <SelectItem value="ORGANIZATION">Organization</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="donorName">Donor Name</Label>
              <Input
                id="donorName"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                required
              />
            </div>

            {donorType === "ORGANIZATION" && (
              <div className="space-y-2">
                <Label htmlFor="organizationName">Organization Name</Label>
                <Input
                  id="organizationName"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="donorEmail">Email</Label>
              <Input
                id="donorEmail"
                type="email"
                value={donorEmail}
                onChange={(e) => setDonorEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="donorPhone">Phone</Label>
              <Input
                id="donorPhone"
                value={donorPhone}
                onChange={(e) => setDonorPhone(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="donorAddress">Address</Label>
              <Input
                id="donorAddress"
                value={donorAddress}
                onChange={(e) => setDonorAddress(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="donorPAN">PAN Number</Label>
              <Input
                id="donorPAN"
                value={donorPAN}
                onChange={(e) => setDonorPAN(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select
                value={paymentMethod}
                onValueChange={(value) =>
                  setPaymentMethod(value as PaymentMethod)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="CHEQUE">Cheque</SelectItem>
                  <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                  <SelectItem value="DEBIT_CARD">Debit Card</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentReference">
                Payment Reference (Transaction ID/Cheque No.)
              </Label>
              <Input
                id="paymentReference"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentDate">Payment Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !paymentDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {paymentDate ? (
                      format(paymentDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={paymentDate}
                    onSelect={(date) => date && setPaymentDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Internal Notes</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isAnonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="isAnonymous">Anonymous Donation</Label>
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Donation"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default DonationEditPage;
