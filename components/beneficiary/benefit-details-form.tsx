"use client";

import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { BenefitType } from "@prisma/client";
import { FormData } from "./types";

interface BenefitDetailsFormProps {
  formData: FormData;
  onChange: (
    field: keyof FormData,
    value: string | Date | BenefitType | undefined
  ) => void;
}

export default function BenefitDetailsForm({
  formData,
  onChange,
}: BenefitDetailsFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="benefitType">Benefit Type</Label>
        <Select
          value={formData.benefitType}
          onValueChange={(value) =>
            onChange("benefitType", value as BenefitType)
          }
        >
          <SelectTrigger id="benefitType">
            <SelectValue placeholder="Select benefit type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MEDICAL_CHECKUP">Medical Checkup</SelectItem>
            <SelectItem value="HOSPITALIZATION">Hospitalization</SelectItem>
            <SelectItem value="SURGERY">Surgery</SelectItem>
            <SelectItem value="MEDICATION">Medication</SelectItem>
            <SelectItem value="CONSULTATION">Consultation</SelectItem>
            <SelectItem value="OTHER">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount (₹)</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          value={formData.amount}
          onChange={(e) => onChange("amount", e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => onChange("description", e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="startDate">Start Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !formData.startDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.startDate ? (
                format(formData.startDate, "PPP")
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={formData.startDate}
              onSelect={(date) => date && onChange("startDate", date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="endDate">End Date (Optional)</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !formData.endDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.endDate ? (
                format(formData.endDate, "PPP")
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={formData.endDate}
              onSelect={(date) => onChange("endDate", date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
