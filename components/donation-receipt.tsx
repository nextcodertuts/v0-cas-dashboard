"use client";

import { format } from "date-fns";
import { Barcode } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { DonationType, DonorType, PaymentMethod } from "@prisma/client";

interface DonationReceiptProps {
  // Organization details
  orgName?: string;
  orgLogo?: string;
  orgAddress?: string;
  orgPhone?: string;
  orgEmail?: string;
  orgWebsite?: string;
  orgRegistrationNumber?: string;

  // Donation details
  receiptNumber: string;
  receiptDate: Date;
  donorName: string;
  donorEmail?: string;
  donorPhone?: string;
  donorAddress?: string;
  donorType: DonorType;
  donorPAN?: string;
  organizationName?: string;
  type: DonationType;
  amount: string;
  description?: string;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  paymentDate: Date;
  isAnonymous?: boolean;
  notes?: string;
}

export default function DonationReceipt({
  // Organization details with defaults
  orgName = "Charitable Foundation",
  orgLogo = "/placeholder.svg?height=80&width=80",
  orgAddress = "123 Charity Lane, Helping City, HC 12345",
  orgPhone = "+91 1234567890",
  orgEmail = "info@charitablefoundation.org",
  orgWebsite = "www.charitablefoundation.org",
  orgRegistrationNumber = "REG12345678",

  // Donation details
  receiptNumber = "DON-2023-001",
  receiptDate = new Date(),
  donorName,
  donorEmail,
  donorPhone,
  donorAddress,
  donorType,
  donorPAN,
  organizationName,
  type,
  amount,
  description,
  paymentMethod,
  paymentReference,
  paymentDate,
}: DonationReceiptProps) {
  const formatPaymentMethod = (method: PaymentMethod) => {
    return method
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatDonationType = (type: DonationType) => {
    return type
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="print:hidden mb-4 flex justify-end">
        <Button onClick={handlePrint}>Print Receipt</Button>
      </div>

      <Card className="p-8 border-2 border-gray-200 bg-white shadow-lg">
        {/* Header with logo and organization details */}
        <div className="flex flex-col md:flex-row justify-between items-center border-b-2 border-gray-200 pb-6 mb-6">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <div className="w-20 h-20 relative">
              <Image
                src={orgLogo || "/placeholder.svg"}
                alt={`${orgName} Logo`}
                width={80}
                height={80}
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{orgName}</h1>
              <p className="text-sm text-gray-600">{orgAddress}</p>
              <p className="text-sm text-gray-600">
                {orgPhone} | {orgEmail}
              </p>
              <p className="text-sm text-gray-600">{orgWebsite}</p>
            </div>
          </div>

          <div className="text-right">
            <div className="inline-block border-2 border-gray-800 rounded-md px-4 py-2 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">
                DONATION RECEIPT
              </h2>
              <p className="text-sm text-gray-600">
                Reg No: {orgRegistrationNumber}
              </p>
            </div>
          </div>
        </div>

        {/* Receipt details */}
        <div className="mb-6">
          <div className="flex justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600">Receipt No:</p>
              <p className="font-semibold">{receiptNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date:</p>
              <p className="font-semibold">
                {format(receiptDate, "dd MMM yyyy")}
              </p>
            </div>
          </div>

          <div className="border-2 border-gray-200 rounded-md p-4 bg-gray-50 mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">
              Donor Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name:</p>
                <p className="font-semibold">{donorName}</p>
              </div>

              {donorType === "ORGANIZATION" && organizationName && (
                <div>
                  <p className="text-sm text-gray-600">Organization:</p>
                  <p className="font-semibold">{organizationName}</p>
                </div>
              )}

              {donorEmail && (
                <div>
                  <p className="text-sm text-gray-600">Email:</p>
                  <p className="font-semibold">{donorEmail}</p>
                </div>
              )}

              {donorPhone && (
                <div>
                  <p className="text-sm text-gray-600">Phone:</p>
                  <p className="font-semibold">{donorPhone}</p>
                </div>
              )}

              {donorAddress && (
                <div className="col-span-1 md:col-span-2">
                  <p className="text-sm text-gray-600">Address:</p>
                  <p className="font-semibold">{donorAddress}</p>
                </div>
              )}

              {donorPAN && (
                <div>
                  <p className="text-sm text-gray-600">PAN:</p>
                  <p className="font-semibold">{donorPAN}</p>
                </div>
              )}
            </div>
          </div>

          <div className="border-2 border-gray-200 rounded-md p-4 bg-gray-50">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">
              Donation Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Donation Type:</p>
                <p className="font-semibold">{formatDonationType(type)}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Amount:</p>
                <p className="font-semibold text-xl">
                  ₹ {Number.parseFloat(amount).toLocaleString("en-IN")}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Payment Method:</p>
                <p className="font-semibold">
                  {formatPaymentMethod(paymentMethod)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Payment Date:</p>
                <p className="font-semibold">
                  {format(paymentDate, "dd MMM yyyy")}
                </p>
              </div>

              {paymentReference && (
                <div>
                  <p className="text-sm text-gray-600">Reference:</p>
                  <p className="font-semibold">{paymentReference}</p>
                </div>
              )}

              {description && (
                <div className="col-span-1 md:col-span-2">
                  <p className="text-sm text-gray-600">Description:</p>
                  <p className="font-semibold">{description}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer with thank you message and barcode */}
        <div className="border-t-2 border-gray-200 pt-6 flex flex-col md:flex-row justify-between items-end">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-bold text-gray-800">
              Thank You for Your Generosity!
            </h3>
            <p className="text-sm text-gray-600 max-w-md">
              Your contribution helps us continue our mission to make a
              difference. This receipt is an official document for tax deduction
              purposes under Section 80G.
            </p>
            <div className="mt-4">
              <p className="text-sm font-semibold">Authorized Signatory</p>
              <div className="h-10 mt-2 border-b border-gray-400 w-40"></div>
            </div>
          </div>

          <div className="text-right">
            <div className="flex flex-col items-center">
              <Barcode className="h-16 w-32" />
              <p className="text-xs text-gray-500 mt-1">{receiptNumber}</p>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 text-xs text-gray-500 text-center">
          <p>
            This is a computer-generated receipt and does not require a physical
            signature.
          </p>
          <p>
            For any queries, please contact us at {orgEmail} or {orgPhone}.
          </p>
        </div>
      </Card>
    </div>
  );
}
