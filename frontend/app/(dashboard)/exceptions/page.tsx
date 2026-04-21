"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Header from "@/components/layout/header";
import { Exception } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertTriangle, CheckCircle, XCircle, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";

export default function ExceptionsPage() {
  const [statusFilter, setStatusFilter] = useState("open");
  const [selected, setSelected] = useState<Exception | null>(null);
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [notes, setNotes] = useState("");
  const qc = useQueryClient();

  const { data: exceptions = [], isLoading } = useQuery<Exception[]>({
    queryKey: ["exceptions", statusFilter],
    queryFn: () => api.exceptions.list(statusFilter),
    refetchInterval: 15_000,
  });

  const resolve = useMutation({
    mutationFn: ({ id, act }: { id: string; act: string }) =>
      api.exceptions.resolve(id, { action: act, notes }),
    onSuccess: () => {
      toast.success("Exception resolved");
      qc.invalidateQueries({ queryKey: ["exceptions"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      setSelected(null);
      setNotes("");
      setAction(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="flex flex-col flex-1">
      <Header title="Exception Queue" />
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Select value={statusFilter} onValueChange={(v: string | null) => setStatusFilter(v ?? "open")}>
            <SelectTrigger className="w-36 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-gray-500">{exceptions.length} exceptions</span>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <Card key={i}><CardContent className="p-4 h-20 animate-pulse bg-gray-50" /></Card>
            ))
          ) : exceptions.length === 0 ? (
            <Card><CardContent className="p-10 text-center text-gray-400">No {statusFilter} exceptions</CardContent></Card>
          ) : (
            exceptions.map((exc) => (
              <Card key={exc.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3 flex-1 min-w-0">
                      <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {exc.invoices?.invoice_number ?? "Unknown Invoice"}
                          </span>
                          {exc.invoices?.vendors && (
                            <span className="text-gray-500 text-sm">· {exc.invoices.vendors.name}</span>
                          )}
                          <Badge className={
                            exc.status === "open" ? "bg-amber-100 text-amber-700 border-0 text-xs" :
                            exc.status === "resolved" ? "bg-green-100 text-green-700 border-0 text-xs" :
                            "bg-red-100 text-red-700 border-0 text-xs"
                          }>{exc.status}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{exc.reason}</p>
                        {exc.invoices?.total && (
                          <p className="text-xs text-gray-400 mt-1">Amount: ₹{exc.invoices.total.toLocaleString()}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatDistanceToNow(new Date(exc.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {exc.invoice_id && (
                        <Link href={`/invoices/${exc.invoice_id}`}>
                          <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                        </Link>
                      )}
                      {exc.status === "open" && (
                        <>
                          <Button size="sm" variant="outline" className="text-green-700 border-green-200 hover:bg-green-50"
                            onClick={() => { setSelected(exc); setAction("approve"); }}>
                            <CheckCircle className="h-4 w-4 mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-700 border-red-200 hover:bg-red-50"
                            onClick={() => { setSelected(exc); setAction("reject"); }}>
                            <XCircle className="h-4 w-4 mr-1" /> Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <Dialog open={!!selected} onOpenChange={() => { setSelected(null); setNotes(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{action === "approve" ? "Approve Exception" : "Reject Exception"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">{selected?.reason}</p>
            <Textarea
              placeholder="Add resolution notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setSelected(null); setNotes(""); }}>Cancel</Button>
            <Button
              variant={action === "approve" ? "default" : "destructive"}
              disabled={resolve.isPending}
              onClick={() => selected && resolve.mutate({ id: selected.id, act: action! })}
            >
              {resolve.isPending ? "Processing..." : action === "approve" ? "Approve & Post" : "Reject Invoice"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
