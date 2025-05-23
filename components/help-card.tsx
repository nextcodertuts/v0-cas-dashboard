/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
// @ts-nocheck
"use client";

import type React from "react";

import { Phone, Mail, MapPin, Users, Download } from "lucide-react";
import Image from "next/image";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";

interface Member {
  firstName: string;
  lastName: string;
  relation: string;
  dob: string;
}

interface HelpCardProps {
  cardId: string;
  issueDate: Date;
  expiryDate: Date;
  members: Member[];
  frontRef?: React.RefObject<HTMLDivElement>;
  backRef?: React.RefObject<HTMLDivElement>;
}

export default function HelpCard({
  cardId,
  expiryDate,
  members,
  frontRef,
  backRef,
}: HelpCardProps) {
  const [qrCode, setQrCode] = useState<string>("");
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    generateQRCode();
  }, [cardId]);

  const generateQRCode = async () => {
    try {
      const url = `${window.location.origin}/cards/${cardId}`;
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 128,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });
      setQrCode(qrDataUrl);
    } catch (err) {
      console.error("Error generating QR code:", err);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const downloadCardSide = async (side: "front" | "back") => {
    setIsDownloading(true);
    try {
      const element = side === "front" ? frontRef?.current : backRef?.current;
      if (!element) return;

      // Create a clone of the element to modify without affecting the display
      const clone = element.cloneNode(true) as HTMLElement;
      document.body.appendChild(clone);

      // Apply styles that are compatible with html2canvas
      const styles = `
        .from-blue-950 { background-color: #172554 !important; }
        .via-blue-850 { background-color: #1e3a8a !important; }
        .to-blue-900 { background-color: #1e3a8a !important; }
        .text-lime-400 { color: #a3e635 !important; }
        .text-blue-200 { color: #bfdbfe !important; }
        .text-blue-100 { color: #dbeafe !important; }
        .bg-white\/10 { background-color: rgba(255, 255, 255, 0.1) !important; }
        .bg-white\/20 { background-color: rgba(255, 255, 255, 0.2) !important; }
      `;

      // Add the styles to the document
      const styleElement = document.createElement("style");
      styleElement.textContent = styles;
      document.head.appendChild(styleElement);

      // Position the clone off-screen but still rendered
      clone.style.position = "absolute";
      clone.style.left = "-9999px";
      clone.style.top = "0";

      // Wait a bit for styles to apply
      await new Promise((resolve) => setTimeout(resolve, 100));

      const canvas = await html2canvas(clone, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        onclone: (clonedDoc) => {
          // Additional modifications to the cloned document if needed
        },
      });

      // Clean up
      document.body.removeChild(clone);
      document.head.removeChild(styleElement);

      const image = canvas.toDataURL("image/png", 1.0);
      const downloadLink = document.createElement("a");
      downloadLink.href = image;
      downloadLink.download = `card-${cardId}-${side}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (error) {
      console.error(`Error downloading ${side} card:`, error);
      alert(`Failed to download card: ${error.message}`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-4 w-full max-w-[420px] mx-auto">
      {/* Front Side */}
      <div className="space-y-2">
        <div
          ref={frontRef}
          className="w-full h-[260px] rounded-xl overflow-hidden shadow-lg relative"
        >
          <div className="bg-gradient-to-br from-blue-950 via-blue-850 to-blue-900 h-full p-2 flex flex-col relative z-10">
            <Image
              src="/card-2.png"
              alt="Card"
              layout="fill"
              objectFit="cover"
              className="opacity-45"
            />
            <div className="flex justify-between items-start z-50">
              <div>
                <h1 className="text-lime-400 text-xl font-bold tracking-wide mt-1">
                  CAS <span className="text-xs text-white">Members</span>
                </h1>
                <p className="text-white text-[9px] -mt-1 ml-[1px]">
                  CARE NETWORK
                </p>
              </div>
              <div className="z-50">
                <Image
                  src="/help-card-next.png"
                  width={45}
                  height={45}
                  alt="HelpCard"
                  className="z-50"
                />
              </div>
            </div>

            <div className="z-50">
              <p className="text-lime-400 text-2xl font-mono font-bold tracking-widest">
                {cardId.replace(/(.{4})/g, "$1 ").trim()}
              </p>
            </div>

            <div className="mt-2 bg-white/10 backdrop-blur-[1px] rounded-lg p-2 flex-grow overflow-y-auto">
              <div className="flex items-center gap-2 mb-1">
                <Users className="text-blue-200 h-3 w-3" />
                <h3 className="text-white font-medium text-[11px]">MEMBERS</h3>
              </div>
              <div className="grid grid-cols-3 gap-x-2 gap-y-0.5">
                {members.map((member, index) => (
                  <div key={index} className="">
                    <p className="text-white text-[9px] font-medium leading-tight">
                      {member.firstName} {member.lastName}
                    </p>
                    <p className="text-blue-100 text-[7px] leading-tight">
                      {member.relation}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-2 flex justify-between">
              <div className="bg-white/10 backdrop-blur-sm font-mono flex items-center space-x-1 rounded-lg p-1.5">
                <p className="text-blue-100 text-[11px]">Valid Upto:</p>
                <p className="text-lime-400 text-end font-semibold">
                  {formatDate(expiryDate)}
                </p>
              </div>
            </div>
          </div>
        </div>
        <Button
          onClick={() => downloadCardSide("front")}
          variant="outline"
          size="sm"
          className="w-full print:hidden"
          disabled={isDownloading}
        >
          <Download className="h-4 w-4 mr-2" />
          Download Front Side
        </Button>
      </div>

      {/* Back Side */}
      <div className="space-y-2">
        <div
          ref={backRef}
          className="w-full h-[260px] rounded-xl overflow-hidden shadow-lg relative"
        >
          <div className="bg-gradient-to-br from-blue-950 via-blue-850 to-blue-900 h-full p-2 flex flex-col justify-center relative z-10">
            <Image
              src="/card-2.png"
              alt="Card"
              layout="fill"
              objectFit="cover"
              className="opacity-45"
            />

            <div className="z-50 mt-1 bg-white/10 backdrop-blur-sm rounded-lg p-2">
              <h2 className="text-white text-[10px] font-medium mb-2">
                CONTACT INFORMATION
              </h2>
              <div className="flex  justify-between">
                <div className="space-y-1">
                  <div className="flex items-start gap-2">
                    <div className="bg-white/20 rounded-full p-1.5 mt-0.5">
                      <MapPin className="text-white h-2 w-2" />
                    </div>
                    <div>
                      <p className="text-blue-100 text-[10px]">Address</p>
                      <p className="text-white text-[9px] leading-tight">
                        ChakDulal Pur, Karanjali, South 24 parganas, 743348
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="bg-white/20 rounded-full p-1.5">
                      <Phone className="text-white h-2 w-2" />
                    </div>
                    <div>
                      <p className="text-blue-100 text-[10px]">Helpline</p>
                      <p className="text-white text-[9px]">+91 7001070713</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="bg-white/20 rounded-full p-1.5">
                      <Mail className="text-white h-2 w-2" />
                    </div>
                    <div>
                      <p className="text-blue-100 text-[10px]">Email</p>
                      <p className="text-white text-[9px]">support@cas4u.org</p>
                    </div>
                  </div>
                </div>
                {qrCode && (
                  <div className=" rounded-md z-50">
                    <Image
                      src={qrCode || "/placeholder.svg"}
                      width={120}
                      height={120}
                      className="rounded-md p-1"
                      alt="QR Code"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="text-center text-[10px] mt-4 z-50 opacity-60">
              <p className="font-bold">This card for NGO members.</p>
              <p className="font-bold">
                There have no similarities with government scheme.
              </p>
            </div>
          </div>
        </div>
        <Button
          onClick={() => downloadCardSide("back")}
          variant="outline"
          size="sm"
          className="w-full print:hidden"
          disabled={isDownloading}
        >
          <Download className="h-4 w-4 mr-2" />
          Download Back Side
        </Button>
      </div>
    </div>
  );
}
