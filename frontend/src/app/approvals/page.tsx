"use client";

import { CheckCircle2, XCircle, Clock, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import useSWR from "swr";
import api, { fetcher } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function ApprovalsPage() {
  const { data: requests, error, isLoading, mutate } = useSWR("/approvals", fetcher);

  const handleApprove = async (id: string) => {
    try {
      await api.patch(`/approvals/${id}/approve`);
      toast.success("Request approved successfully");
      mutate();
    } catch (err) {
      toast.error("Failed to approve request");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.patch(`/approvals/${id}/reject`);
      toast.success("Request rejected successfully");
      mutate();
    } catch (err) {
      toast.error("Failed to reject request");
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 relative overflow-hidden bg-background">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ShieldAlert className="h-8 w-8 text-primary" />
            Approval Inbox
          </h2>
          <p className="text-muted-foreground mt-1">
            Review and resolve system requests that require your elevation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
           <div className="col-span-full text-center text-red-500 py-12">
             Failed to load approvals.
           </div>
        ) : requests?.length === 0 ? (
           <div className="col-span-full text-center text-muted-foreground py-12">
             No approval requests found.
           </div>
        ) : (
          requests?.map((req: any) => (
            <Card key={req.id} className={`bg-surface border-border hover:border-primary/50 transition-colors shadow-sm ${req.status === 'PENDING' ? 'border-primary/20 bg-primary/5' : 'opacity-70'}`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className="text-[10px] tracking-widest uppercase bg-surface-2">{req.entityType || req.entity}</Badge>
                  <span className="text-xs text-muted-foreground flex items-center"><Clock className="h-3 w-3 mr-1" />{req.createdAt ? new Date(req.createdAt).toLocaleDateString() : req.time}</span>
                </div>
                <CardTitle className="text-lg mt-2">{req.title}</CardTitle>
                <CardDescription>Requested by: <span className="font-semibold text-foreground">{req.requester?.name || req.requestedBy}</span></CardDescription>
              </CardHeader>
              <CardContent>
                {req.status === 'PENDING' ? (
                  <div className="flex items-center gap-3 mt-4">
                    <Button onClick={() => handleApprove(req.id)} className="flex-1 bg-success hover:bg-success/90 text-success-foreground">
                      <CheckCircle2 className="mr-2 h-4 w-4" /> Approve
                    </Button>
                    <Button onClick={() => handleReject(req.id)} variant="destructive" className="flex-1">
                      <XCircle className="mr-2 h-4 w-4" /> Reject
                    </Button>
                  </div>
                ) : (
                  <div className="mt-4 flex items-center justify-center p-2 rounded bg-surface-2 border border-border">
                    <Badge variant={req.status === 'APPROVED' ? 'default' : 'destructive'} className={req.status === 'APPROVED' ? 'bg-success text-success-foreground' : ''}>
                      {req.status}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
