"use client";

import { Leaf, Award, Trophy, ArrowUpRight, CheckCircle2, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import useSWR from "swr";
import api, { fetcher } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function HrDashboardPage() {
  const { data: leaves, error, isLoading, mutate } = useSWR("/hr-leaves", fetcher);

  const handleRequestLeave = async () => {
    try {
      await api.post("/hr-leaves", {
        type: "VACATION",
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86400000 * 2).toISOString(),
        reason: "Taking some time off"
      });
      toast.success("Leave requested successfully");
      mutate();
    } catch (err) {
      toast.error("Failed to request leave");
    }
  };

  const { data: leaderboardData, error: lbError, isLoading: lbLoading } = useSWR("/gamification/leaderboard", fetcher);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 relative overflow-hidden bg-background">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <UserCircle2 className="h-8 w-8 text-primary" />
            HR & Gamification
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage your time off and track your performance points.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card className="bg-surface shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Leaf className="h-5 w-5 text-emerald-500" />
                Leave Requests
              </CardTitle>
              <CardDescription>Your upcoming absences.</CardDescription>
            </div>
            <Button onClick={handleRequestLeave} size="sm">Request Leave</Button>
          </CardHeader>
          <CardContent className="space-y-4 mt-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-8">Failed to load leaves.</div>
            ) : leaves?.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">No leave requests found.</div>
            ) : (
              leaves?.map((l: any) => (
                <div key={l.id} className="flex items-center justify-between p-3 rounded bg-surface-2 border border-border">
                  <div>
                    <div className="font-semibold text-sm">{l.type}</div>
                    <div className="text-xs text-muted-foreground">
                      {l.startDate ? new Date(l.startDate).toLocaleDateString() : l.dates}
                      {l.endDate ? ` - ${new Date(l.endDate).toLocaleDateString()}` : ''}
                    </div>
                  </div>
                  <Badge variant={l.status === 'APPROVED' ? 'default' : 'secondary'}>{l.status}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-600/5 shadow-sm border-orange-500/20">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2 text-orange-500">
              <Trophy className="h-5 w-5" />
              Company Leaderboard
            </CardTitle>
            <CardDescription>Top performers this month based on CRM gamification points.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 mt-2">
            {lbLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : lbError ? (
              <div className="text-center text-red-500 py-8">Failed to load leaderboard.</div>
            ) : leaderboardData?.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">No leaderboard data yet.</div>
            ) : (
              leaderboardData?.map((person: any, index: number) => (
                <div key={person.id} className="flex items-center justify-between p-4 rounded-lg bg-surface border border-orange-500/10 shadow-sm relative overflow-hidden">
                  {index === 0 && <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 blur-2xl opacity-20 pointer-events-none" />}
                  <div className="flex items-center gap-4 z-10">
                    <div className="text-2xl font-black text-muted-foreground/30 w-6 text-center">#{index + 1}</div>
                    <div>
                      <div className="font-bold">{person.firstName} {person.lastName}</div>
                      <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-orange-400 tracking-widest mt-1">
                        <Award className="h-3 w-3" /> {person.badges?.[0]?.badge?.name || `Level ${person.level}`}
                      </div>
                    </div>
                  </div>
                  <div className="text-right z-10">
                    <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500">
                      {person.totalPoints}
                    </div>
                    <div className="text-xs text-muted-foreground text-right uppercase tracking-[0.2em]">pts</div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
