"use client";

import { Phone, Mail, MapPin, Calendar, Users } from "lucide-react";
import Image from "next/image";

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
  headName: string;
  phone: string;
  address: string;
  members: Member[];
  planName: string;
}

export default function HelpCard({
  cardId,
  issueDate,
  expiryDate,
  phone,
  address,
  members,
}: HelpCardProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-4 w-full max-w-[420px] mx-auto">
      {/* Front Side */}
      <div className="w-full h-[260px] rounded-xl overflow-hidden shadow-lg">
        <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 h-full p-2 flex flex-col">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-white text-sm font-bold tracking-wide mt-1">
                CHAKDULALPUR ARUNADAY SANGHA
              </h1>
              <p className="text-blue-100 text-[9px]">MEMBER CARE NETWORK</p>
            </div>
            <div className="">
              <Image
                src="/help-card-next.png"
                width={45}
                height={45}
                alt="HelpCard"
              />
            </div>
          </div>

          <div className="mt-2 bg-white/10 backdrop-blur-sm rounded-lg p-1">
            <p className="text-blue-100 text-xl">{cardId}</p>
          </div>

          <div className="mt-2 bg-white/10 backdrop-blur-sm rounded-lg p-1 flex-grow overflow-y-auto">
            <div className="flex items-center gap-2 mb-1">
              <Users className="text-blue-100 h-3 w-3" />
              <h3 className="text-white font-medium text-[11px]">MEMBERS</h3>
            </div>
            <div className="grid grid-cols-3 gap-x-2 gap-y-0.5">
              {members.map((member, index) => (
                <div key={index} className="text-[10px]">
                  <p className="text-white font-medium leading-tight">
                    {member.firstName} {member.lastName}
                  </p>
                  <p className="text-blue-100 text-[7px] leading-tight">
                    {member.relation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-2 flex justify-between text-[10px]">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-1.5">
              <div className="flex items-center gap-1">
                <Calendar className="text-blue-100 h-3 w-3" />
                <p className="text-blue-100">Valid From:</p>
              </div>
              <p className="text-white font-medium">{formatDate(issueDate)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-1.5">
              <div className="flex items-center gap-1">
                <Calendar className="text-blue-100 h-3 w-3" />
                <p className="text-blue-100">Valid Thru:</p>
              </div>
              <p className="text-white font-medium">{formatDate(expiryDate)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Back Side */}
      <div className="w-full h-[260px] rounded-xl overflow-hidden shadow-lg">
        <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 h-full p-2 flex flex-col">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-white font-bold tracking-wide">
                CHAKDULALPUR ARUNADAY SANGHA
              </h1>
              <p className="text-blue-100 text-[10px]">MEMBER CARE NETWORK</p>
            </div>
          </div>

          <div className="mt-1 bg-white/10 backdrop-blur-sm rounded-lg p-2">
            <h2 className="text-white text-[10px] font-medium mb-2">
              CONTACT INFORMATION
            </h2>

            <div className="space-y-1">
              <div className="flex items-start gap-2">
                <div className="bg-white/20 rounded-full p-1.5 mt-0.5">
                  <MapPin className="text-white h-2 w-2" />
                </div>
                <div>
                  <p className="text-blue-100 text-[10px]">Address</p>
                  <p className="text-white text-[9px] leading-tight">
                    {address}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="bg-white/20 rounded-full p-1.5">
                  <Phone className="text-white h-2 w-2" />
                </div>
                <div>
                  <p className="text-blue-100 text-[10px]">Helpline</p>
                  <p className="text-white text-[9px]">{phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="bg-white/20 rounded-full p-1.5">
                  <Mail className="text-white h-2 w-2" />
                </div>
                <div>
                  <p className="text-blue-100 text-[10px]">Email</p>
                  <p className="text-white text-[9px]">
                    support@healthbridge.org
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="text-red-500 text-center text-[10px] mt-4">
            <p className="font-bold">This card for NGO members.</p>
            <p className="font-bold">
              There have no similarities with government scheme.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
