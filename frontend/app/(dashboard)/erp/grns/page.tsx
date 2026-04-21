"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Header from "@/components/layout/header";
import { GRN, PurchaseOrder } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function GRNsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [poId, setPoId] = useState("");
  const [grnNumber, setGrnNumber] = useState("");
  const [receivedDate, setReceivedDate] = useState("");
  const [notes, setNotes] = useState("");

  const { data: grns = [], isLoading } = useQuery<GRN[]>({ queryKey: ["grns"], queryFn: () => api.erp.grns.list() });
  const { data: pos = [] } = useQuery<PurchaseOrder[]>({ queryKey: ["pos"], queryFn: () => api.erp.purchaseOrders.list() });

  const create = useMutation({
    mutationFn: () => api.erp.grns.create({ po_id: poId, grn_number: grnNumber, received_date: receivedDate, items_received: [], notes }),
    onSuccess: () => {
      toast.success("GRN created");
      qc.invalidateQueries({ queryKey: ["grns"] });
      setOpen(false);
      setPoId(""); setGrnNumber(""); setReceivedDate(""); setNotes("");
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="flex flex-col flex-1">
      <Header title="Goods Receipt Notes" />
      <div className="p-6 space-y-4">
        <div className="flex justify-end">
          <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" /> New GRN</Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">GRN Number</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">PO Number</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Vendor</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Received Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              </tr></thead>
              <tbody>
                {isLoading ? (
                  [...Array(3)].map((_, i) => <tr key={i} className="border-b"><td colSpan={5} className="px-4 py-3"><div className="h-4 bg-gray-100 animate-pulse rounded" /></td></tr>)
                ) : grns.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No GRNs yet</td></tr>
                ) : grns.map((g) => (
                  <tr key={g.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{g.grn_number}</td>
                    <td className="px-4 py-3 text-gray-600">{g.purchase_orders?.po_number ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{g.purchase_orders?.vendors?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{g.received_date ? format(new Date(g.received_date), "dd MMM yyyy") : "—"}</td>
                    <td className="px-4 py-3 capitalize text-gray-600">{g.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create GRN</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Purchase Order *</Label>
              <Select value={poId} onValueChange={(v: string | null) => setPoId(v ?? "")}>
                <SelectTrigger><SelectValue placeholder="Select PO" /></SelectTrigger>
                <SelectContent>{pos.filter(p => p.status === "open").map(p => <SelectItem key={p.id} value={p.id}>{p.po_number} — {p.vendors?.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>GRN Number *</Label><Input value={grnNumber} onChange={e => setGrnNumber(e.target.value)} /></div>
            <div className="space-y-1"><Label>Received Date</Label><Input type="date" value={receivedDate} onChange={e => setReceivedDate(e.target.value)} /></div>
            <div className="space-y-1"><Label>Notes</Label><Input value={notes} onChange={e => setNotes(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button disabled={!poId || !grnNumber || create.isPending} onClick={() => create.mutate()}>{create.isPending ? "Creating..." : "Create GRN"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
