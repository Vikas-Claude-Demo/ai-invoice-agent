"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Header from "@/components/layout/header";
import { PurchaseOrder, Vendor } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface LineItem { description: string; qty: string; rate: string; amount: string }

export default function PurchaseOrdersPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [vendorId, setVendorId] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [poDate, setPoDate] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([{ description: "", qty: "", rate: "", amount: "" }]);

  const { data: pos = [], isLoading } = useQuery<PurchaseOrder[]>({ queryKey: ["pos"], queryFn: () => api.erp.purchaseOrders.list() });
  const { data: vendors = [] } = useQuery<Vendor[]>({ queryKey: ["vendors"], queryFn: () => api.erp.vendors.list() });

  const create = useMutation({
    mutationFn: () => api.erp.purchaseOrders.create({
      vendor_id: vendorId,
      po_number: poNumber,
      po_date: poDate,
      line_items: lineItems.map(li => ({ description: li.description, qty: +li.qty, rate: +li.rate, amount: +li.qty * +li.rate })),
      total_amount: lineItems.reduce((s, li) => s + +li.qty * +li.rate, 0),
    }),
    onSuccess: () => {
      toast.success("Purchase order created");
      qc.invalidateQueries({ queryKey: ["pos"] });
      setOpen(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  function updateLI(i: number, field: keyof LineItem, val: string) {
    setLineItems(prev => prev.map((li, idx) => idx === i ? { ...li, [field]: val, amount: field === "qty" || field === "rate" ? String(+(field === "qty" ? val : li.qty) * +(field === "rate" ? val : li.rate)) : li.amount } : li));
  }

  const statusColor: Record<string, string> = { open: "bg-blue-100 text-blue-700", received: "bg-green-100 text-green-700", closed: "bg-gray-100 text-gray-700", cancelled: "bg-red-100 text-red-700" };

  return (
    <div className="flex flex-col flex-1">
      <Header title="Purchase Orders" />
      <div className="p-6 space-y-4">
        <div className="flex justify-end">
          <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" /> New PO</Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">PO Number</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Vendor</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Amount</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              </tr></thead>
              <tbody>
                {isLoading ? (
                  [...Array(3)].map((_, i) => <tr key={i} className="border-b"><td colSpan={5} className="px-4 py-3"><div className="h-4 bg-gray-100 animate-pulse rounded" /></td></tr>)
                ) : pos.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No purchase orders yet</td></tr>
                ) : pos.map((po) => (
                  <tr key={po.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{po.po_number}</td>
                    <td className="px-4 py-3 text-gray-600">{po.vendors?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{po.po_date ? format(new Date(po.po_date), "dd MMM yyyy") : "—"}</td>
                    <td className="px-4 py-3 text-right font-medium">₹{po.total_amount?.toLocaleString()}</td>
                    <td className="px-4 py-3"><Badge className={`${statusColor[po.status]} border-0`}>{po.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Create New Purchase Order</DialogTitle>
            <p className="text-sm text-gray-500">Enter the details for the new purchase order below.</p>
          </DialogHeader>
          
          <div className="grid grid-cols-3 gap-6 py-4">
            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold">Vendor *</Label>
              <Select value={vendorId} onValueChange={(v: string | null) => setVendorId(v ?? "")}>
                <SelectTrigger className="bg-white"><SelectValue placeholder="Select vendor" /></SelectTrigger>
                <SelectContent>{vendors.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold">PO Number *</Label>
              <Input value={poNumber} onChange={e => setPoNumber(e.target.value)} placeholder="e.g. PO-2024-001" className="bg-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold">PO Date</Label>
              <Input type="date" value={poDate} onChange={e => setPoDate(e.target.value)} className="bg-white" />
            </div>
          </div>

          <div className="mt-6 border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Line Items</h3>
              <Button variant="outline" size="sm" onClick={() => setLineItems(p => [...p, { description: "", qty: "", rate: "", amount: "" }])} className="border-blue-200 text-blue-600 hover:bg-blue-50">
                <Plus className="h-4 w-4 mr-1" /> Add Item
              </Button>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="grid grid-cols-12 gap-4 mb-2 px-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <div className="col-span-5">Description</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-center">Rate (₹)</div>
                <div className="col-span-2 text-right">Amount</div>
                <div className="col-span-1"></div>
              </div>
              
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {lineItems.map((li, i) => (
                  <div key={i} className="grid grid-cols-12 gap-4 items-center bg-white p-2 rounded-lg border border-gray-200 shadow-sm transition-all hover:border-blue-200">
                    <div className="col-span-5">
                      <Input className="border-0 shadow-none focus-visible:ring-0 h-8" placeholder="Item description..." value={li.description} onChange={e => updateLI(i, "description", e.target.value)} />
                    </div>
                    <div className="col-span-2">
                      <Input className="border-0 shadow-none focus-visible:ring-0 h-8 text-center" type="number" value={li.qty} onChange={e => updateLI(i, "qty", e.target.value)} />
                    </div>
                    <div className="col-span-2">
                      <Input className="border-0 shadow-none focus-visible:ring-0 h-8 text-center" type="number" value={li.rate} onChange={e => updateLI(i, "rate", e.target.value)} />
                    </div>
                    <div className="col-span-2 text-right py-1.5 font-medium text-gray-700">
                      ₹{(+li.qty * +li.rate || 0).toLocaleString()}
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50" onClick={() => setLineItems(p => p.filter((_, j) => j !== i))} disabled={lineItems.length === 1}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex justify-end border-t border-gray-200 pt-4">
                <div className="text-right">
                  <div className="text-sm text-gray-500">Grand Total</div>
                  <div className="text-3xl font-bold text-blue-600">₹{lineItems.reduce((s, li) => s + +li.qty * +li.rate || 0, 0).toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-8 gap-3">
            <Button variant="ghost" onClick={() => setOpen(false)} className="px-8">Cancel</Button>
            <Button 
              className="px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-200"
              disabled={!vendorId || !poNumber || create.isPending} 
              onClick={() => create.mutate()}
            >
              {create.isPending ? "Creating..." : "Confirm & Create PO"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
