import type { BenefitType } from "@prisma/client";

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  relation: string;
}

export interface CardWithDetails {
  id: string;
  status: string;
  household: {
    id: string;
    headName: string;
    phone: string;
    members: Member[];
  };
}

export interface FormData {
  benefitType: BenefitType;
  amount: string;
  description: string;
  startDate: Date;
  endDate?: Date;
}
