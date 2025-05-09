"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Member } from "./types";

interface MemberSelectionSectionProps {
  members: Member[];
  selectedMembers: string[];
  onMemberToggle: (memberId: string) => void;
}

export default function MemberSelectionSection({
  members,
  selectedMembers,
  onMemberToggle,
}: MemberSelectionSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Members</CardTitle>
        <CardDescription>Choose members to receive the benefit</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center space-x-2 p-2 border rounded-lg"
            >
              <input
                type="checkbox"
                id={member.id}
                checked={selectedMembers.includes(member.id)}
                onChange={() => onMemberToggle(member.id)}
                className="rounded border-gray-300"
              />
              <Label htmlFor={member.id}>
                {member.firstName} {member.lastName}{" "}
                <span className="text-muted-foreground">
                  ({member.relation})
                </span>
              </Label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
