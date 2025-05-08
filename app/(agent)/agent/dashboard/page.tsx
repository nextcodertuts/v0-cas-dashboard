"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Users } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface DashboardData {
  stats: {
    totalHouseholds: number;
    activeCards: number;
    expiringCards: number;
  };
  recentActivity: Array<{
    id: string;
    status: string;
    issueDate: string;
    expiryDate: string;
    household: {
      headName: string;
    };
    plan: {
      name: string;
    };
  }>;
  expiringCardsDetails: Array<{
    id: string;
    expiryDate: string;
    household: {
      headName: string;
      phone: string;
    };
    plan: {
      name: string;
    };
  }>;
}

export default function AgentDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();

    // Set up polling every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/agent/dashboard");
      if (!response.ok) throw new Error("Failed to fetch dashboard data");

      const data = await response.json();
      setData(data);
      setError(null);
    } catch (err) {
      setError("Error loading dashboard data");
      console.error("Dashboard error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading dashboard data...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (!data) {
    return <div className="p-4">No data available</div>;
  }

  return (
    <div className="flex-1 space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Households
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.stats.totalHouseholds}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cards</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.activeCards}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.expiringCards}</div>
            <p className="text-xs text-muted-foreground">
              Cards expiring in 30 days
            </p>
          </CardContent>
        </Card>
      </div>
      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
          <TabsTrigger value="expiring">Expiring Cards</TabsTrigger>
        </TabsList>
        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Card Activity</CardTitle>
              <CardDescription>
                Recently issued or renewed cards
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No recent activity to display.
                </p>
              ) : (
                <div className="space-y-4">
                  {data.recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="font-medium">
                          {activity.household.headName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {activity.plan.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          className={
                            activity.status === "ACTIVE"
                              ? "bg-green-500"
                              : activity.status === "SUSPENDED"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }
                        >
                          {activity.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(activity.issueDate), "dd MMM yyyy")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="expiring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Expiring Cards</CardTitle>
              <CardDescription>
                Cards that will expire in the next 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.expiringCardsDetails.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No expiring cards to display.
                </p>
              ) : (
                <div className="space-y-4">
                  {data.expiringCardsDetails.map((card) => (
                    <div
                      key={card.id}
                      className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="font-medium">{card.household.headName}</p>
                        <p className="text-sm text-muted-foreground">
                          {card.household.phone}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {card.plan.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">Expires</p>
                        <p className="text-sm text-red-500">
                          {format(new Date(card.expiryDate), "dd MMM yyyy")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
