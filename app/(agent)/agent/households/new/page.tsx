/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MemberRelation } from "@prisma/client";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface MemberForm {
  firstName: string;
  lastName: string;
  dob: Date | undefined;
  aadhaarNo: string;
  relation: MemberRelation;
}

export default function NewHouseholdPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [headName, setHeadName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  const [members, setMembers] = useState<MemberForm[]>([
    {
      firstName: "",
      lastName: "",
      dob: undefined,
      aadhaarNo: "",
      relation: MemberRelation.HEAD,
    },
  ]);

  const handleAddMember = () => {
    setMembers([
      ...members,
      {
        firstName: "",
        lastName: "",
        dob: undefined,
        aadhaarNo: "",
        relation: MemberRelation.OTHER,
      },
    ]);
  };

  const handleRemoveMember = (index: number) => {
    if (members.length === 1) return;
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleMemberChange = (
    index: number,
    field: keyof MemberForm,
    value: any
  ) => {
    const updatedMembers = [...members];
    updatedMembers[index] = {
      ...updatedMembers[index],
      [field]: value,
    };
    setMembers(updatedMembers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate form
    if (!headName || !address || !phone) {
      setError("Please fill in all required fields");
      setIsLoading(false);
      return;
    }

    // Validate members
    for (const member of members) {
      if (
        !member.firstName ||
        !member.lastName ||
        !member.dob ||
        !member.aadhaarNo ||
        !member.relation
      ) {
        setError("Please fill in all member details");
        setIsLoading(false);
        return;
      }
    }

    try {
      const response = await fetch("/api/households", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          headName,
          address,
          phone,
          members,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create household");
      }

      router.push("/agent/households");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred while creating the household");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-bold tracking-tight">New Household</h2>
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Household Information</CardTitle>
            <CardDescription>
              Enter the details of the new household
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="headName">Head Name</Label>
              <Input
                id="headName"
                value={headName}
                onChange={(e) => setHeadName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <Separator className="my-4" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Members</h3>
              </div>

              <div className="space-y-6">
                {members.map((member, index) => (
                  <div key={index} className="p-4 border rounded-md space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Member {index + 1}</h4>
                      {members.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`firstName-${index}`}>First Name</Label>
                        <Input
                          id={`firstName-${index}`}
                          value={member.firstName}
                          onChange={(e) =>
                            handleMemberChange(
                              index,
                              "firstName",
                              e.target.value
                            )
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`lastName-${index}`}>Last Name</Label>
                        <Input
                          id={`lastName-${index}`}
                          value={member.lastName}
                          onChange={(e) =>
                            handleMemberChange(
                              index,
                              "lastName",
                              e.target.value
                            )
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`dob-${index}`}>Date of Birth</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !member.dob && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {member.dob ? (
                                format(member.dob, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={member.dob}
                              onSelect={(date) =>
                                handleMemberChange(index, "dob", date)
                              }
                              fromYear={1900}
                              toYear={new Date().getFullYear()}
                              captionLayout="dropdown"
                              defaultMonth={member.dob ?? new Date(1990, 0, 1)}
                              disabled={(date) => date > new Date()}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`aadhaarNo-${index}`}>
                          Aadhaar Number
                        </Label>
                        <Input
                          id={`aadhaarNo-${index}`}
                          value={member.aadhaarNo}
                          onChange={(e) =>
                            handleMemberChange(
                              index,
                              "aadhaarNo",
                              e.target.value
                            )
                          }
                          required
                          pattern="[0-9]{12}"
                          maxLength={12}
                          placeholder="12-digit Aadhaar number"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`relation-${index}`}>Relation</Label>
                        <Select
                          value={member.relation}
                          onValueChange={(value) =>
                            handleMemberChange(index, "relation", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select relation" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="HEAD">Head</SelectItem>
                            <SelectItem value="SPOUSE">Spouse</SelectItem>
                            <SelectItem value="FATHER">Father</SelectItem>
                            <SelectItem value="MOTHER">Mother</SelectItem>
                            <SelectItem value="SON">Son</SelectItem>
                            <SelectItem value="DAUGHTER">Daughter</SelectItem>
                            <SelectItem value="OTHER">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddMember}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Member
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              type="button"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Household"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
