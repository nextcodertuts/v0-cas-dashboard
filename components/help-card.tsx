"use client";

import { useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Globe,
  Calendar,
  Users,
  CreditCard,
} from "lucide-react";

export default function HelpCard() {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="relative w-full max-w-[420px] h-[260px] cursor-pointer perspective">
      <div
        className={`relative w-full h-full duration-700 preserve-3d ${
          isFlipped ? "rotate-y-180" : ""
        }`}
        onClick={handleFlip}
      >
        {/* Front Side */}
        <div className="absolute w-full h-full backface-hidden">
          <div className="w-full h-full rounded-xl overflow-hidden shadow-lg">
            <div className="bg-gradient-to-br from-blue-800 via-blue-700 to-blue-900 h-full p-2 flex flex-col">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-white text-sm font-bold tracking-wide">
                    CHAKDULALPUR ARUNADAY SANGHA
                  </h1>
                  <p className="text-blue-100 text-[10px]">
                    MEMBER CARE NETWORK
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                  <CreditCard className="text-white h-5 w-5" />
                </div>
              </div>

              <div className="mt-2 bg-white/10 backdrop-blur-sm rounded-lg p-1">
                <p className="text-blue-100 text-xl">CAS 2025 0042 2345</p>
              </div>

              <div className="mt-2 bg-white/10 backdrop-blur-sm rounded-lg p-1 flex-grow overflow-y-auto">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="text-blue-100 h-3 w-3" />
                  <h3 className="text-white font-medium text-[11px]">
                    MEMBERS
                  </h3>
                </div>
                <div className="grid grid-cols-3 gap-x-2 gap-y-0.5">
                  {[
                    { name: "Sarah Johnson", relation: "Primary" },
                    { name: "Michael Johnson", relation: "Spouse" },
                    { name: "Emma Johnson", relation: "Child" },
                    { name: "James Johnson", relation: "Child" },
                    { name: "Olivia Johnson", relation: "Child" },
                    { name: "Noah Johnson", relation: "Child" },
                    { name: "Sophia Johnson", relation: "Dependent" },
                  ].map((member, index) => (
                    <div key={index} className="text-[10px]">
                      <p className="text-white text-[10px] font-medium leading-tight">
                        {member.name}
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
                  <p className="text-white font-medium">01.06.2025</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-1.5">
                  <div className="flex items-center gap-1">
                    <Calendar className="text-blue-100 h-3 w-3" />
                    <p className="text-blue-100">Valid Thru:</p>
                  </div>
                  <p className="text-white font-medium">31.05.2027</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back Side */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180">
          <div className="w-full h-full rounded-xl overflow-hidden shadow-lg">
            <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 h-full p-2 flex flex-col">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-white  font-bold tracking-wide">
                    CHAKDULALPUR ARUNADAY SANGHA
                  </h1>
                  <p className="text-blue-100 text-[10px]">
                    MEMBER CARE NETWORK
                  </p>
                </div>
              </div>

              <div className="mt-1 bg-white/10 backdrop-blur-sm rounded-lg p-2 ">
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
                        CHAKDULALPUR, KARANJALI, SOUTH 24 PARGANAS
                        <br />
                        WEST BENGAL, INDIA, PIN: 743348
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="bg-white/20 rounded-full p-1.5">
                      <Phone className="text-white h-2 w-2" />
                    </div>
                    <div>
                      <p className="text-blue-100 text-[10px]">Helpline</p>
                      <p className="text-white text-[9px]">+1 (800) 123-4567</p>
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

                  <div className="flex items-center gap-2">
                    <div className="bg-white/20 rounded-full p-1.5">
                      <Globe className="text-white h-2 w-2" />
                    </div>
                    <div>
                      <p className="text-blue-100 text-[10px]">Website</p>
                      <p className="text-white text-[9px]">
                        www.healthbridge.org
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-red-500 text-center text-[10px]">
                <p className="font-bold">This card for NGO members.</p>
                <p className="font-bold">
                  There have no similarities with government scheme.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="text-center mt-4 text-sm text-slate-500">
        Click the card to flip
      </p>
    </div>
  );
}
