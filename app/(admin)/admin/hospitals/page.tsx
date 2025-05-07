"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Search } from "lucide-react";

interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  licenseNo: string;
  user: {
    email: string;
    name: string;
  };
}

export default function HospitalsPage() {
  const router = useRouter();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async (search?: string) => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) {
        queryParams.append("search", search);
      }

      const response = await fetch(`/api/hospitals?${queryParams.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch hospitals");

      const data = await response.json();
      setHospitals(data);
    } catch (error) {
      console.error("Error fetching hospitals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHospitals(searchQuery);
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/hospitals/${id}/edit`);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Hospitals</h2>
        <Button onClick={() => router.push("/admin/hospitals/new")}>
          <Plus className="mr-2 h-4 w-4" /> Add Hospital
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Hospitals</CardTitle>
          <CardDescription>
            View and manage registered hospitals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSearch}
            className="flex w-full max-w-sm items-center space-x-2 mb-4"
          >
            <Input
              placeholder="Search hospitals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit">
              <Search className="h-4 w-4" />
            </Button>
          </form>

          {isLoading ? (
            <div className="text-center py-4">Loading hospitals...</div>
          ) : hospitals.length === 0 ? (
            <div className="text-center py-4">No hospitals found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>License No</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>User Email</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hospitals.map((hospital) => (
                  <TableRow key={hospital.id}>
                    <TableCell className="font-medium">
                      {hospital.name}
                    </TableCell>
                    <TableCell>{hospital.licenseNo}</TableCell>
                    <TableCell>{hospital.phone}</TableCell>
                    <TableCell>{hospital.user.email}</TableCell>
                    <TableCell>{hospital.address}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => handleEdit(hospital.id)}
                          >
                            Edit hospital
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              // Handle delete
                            }}
                          >
                            Delete hospital
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
