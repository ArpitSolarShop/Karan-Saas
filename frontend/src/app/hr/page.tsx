"use client";

import { Leaf, Award, Trophy, ArrowUpRight, CheckCircle2, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function HrDashboardPage() {
  const leaves = [
    { id: 1, type: 'VACATION', dates: 'May 10 - May 15', status: 'APPROVED' },
    { id: 2, type: 'SICK', dates: 'June 1', status: 'PENDING' },
  ];

  const leaderboard = [
    { id: 1, name: 'Alice Smith', points: 1450, badge: 'Sales Champion' },
    { id: 2, name: 'Bob Jones', points: 1200, badge: 'Fast Responder' },
    { id: 3, name: 'Charlie Day', points: 950, badge: 'Team Player' },
  ];

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
            <Button size="sm">Request Leave</Button>
          </CardHeader>
          <CardContent className="space-y-4 mt-4">
            {leaves.map(l => (
              <div key={l.id} className="flex items-center justify-between p-3 rounded bg-surface-2 border border-border">
                <div>
                  <div className="font-semibold text-sm">{l.type}</div>
                  <div className="text-xs text-muted-foreground">{l.dates}</div>
                </div>
                <Badge variant={l.status === 'APPROVED' ? 'default' : 'secondary'}>{l.status}</Badge>
              </div>
            ))}
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
            {leaderboard.map((person, index) => (
              <div key={person.id} className="flex items-center justify-between p-4 rounded-lg bg-surface border border-orange-500/10 shadow-sm relative overflow-hidden">
                {index === 0 && <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 blur-2xl opacity-20 pointer-events-none" />}
                <div className="flex items-center gap-4 z-10">
                  <div className="text-2xl font-black text-muted-foreground/30 w-6 text-center">#{index + 1}</div>
                  <div>
                    <div className="font-bold">{person.name}</div>
                    <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-orange-400 tracking-widest mt-1">
                      <Award className="h-3 w-3" /> {person.badge}
                    </div>
                  </div>
                </div>
                <div className="text-right z-10">
                  <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500">
                    {person.points}
                  </div>
                  <div className="text-xs text-muted-foreground text-right uppercase tracking-[0.2em]">pts</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
