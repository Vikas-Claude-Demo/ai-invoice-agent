"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Header from "@/components/layout/header";
import { Exception } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, CheckCircle, XCircle, Eye, Pencil, Brain, Sparkles, RotateCcw, FileText, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";

type EditableData = {
  vendor_name: string;
  invoice_number: string;
  invoice_date: string;
  po_number: string;
  subtotal: string;
  tax: string;
  total: string;
};

export default function ExceptionsPage() {
  const [statusFilter, setStatusFilter] = useState("open");
  const [selected, setSelected] = useState<Exception | null>(null);
  const [dialogMode, setDialogMode] = useState<"resolve" | "edit">("resolve");
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [notes, setNotes] = useState("");
  const [learnFromThis, setLearnFromThis] = useState(true);
  const [editData, setEditData] = useState<EditableData>({
    vendor_name: "", invoice_number: "", invoice_date: "", po_number: "",
    subtotal: "", tax: "", total: "",
  });
  const qc = useQueryClient();

  const { data: exceptions = [], isLoading } = useQuery<Exception[]>({
    queryKey: ["exceptions", statusFilter],
    queryFn: () => api.exceptions.list(statusFilter),
    refetchInterval: 15_000,
  });

  const resolve = useMutation({
    mutationFn: ({ id, act, edited }: { id: string; act: string; edited?: any }) =>
      api.exceptions.resolve(id, {
        action: act,
        notes: learnFromThis ? `[AI_LEARN] ${notes}` : notes,
        edited_data: edited,
      }),
    onSuccess: () => {
      toast.success("Exception resolved successfully");
      qc.invalidateQueries({ queryKey: ["exceptions"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      qc.invalidateQueries({ queryKey: ["invoices"] });
      closeDialog();
    },
    onError: (e: any) => toast.error(e.message),
  });

  function openEdit(exc: Exception) {
    const ext: any = exc.invoices?.extracted_data || {};
    setEditData({
      vendor_name: ext.vendor_name || "",
      invoice_number: ext.invoice_number || exc.invoices?.invoice_number || "",
      invoice_date: ext.invoice_date || "",
      po_number: ext.po_number || exc.invoices?.po_number || "",
      subtotal: ext.subtotal?.toString() || "",
      tax: ext.tax?.toString() || "",
      total: ext.total?.toString() || "",
    });
    setSelected(exc);
    setDialogMode("edit");
  }

  function openResolve(exc: Exception, act: "approve" | "reject") {
    setSelected(exc);
    setAction(act);
    setDialogMode("resolve");
  }

  function closeDialog() {
    setSelected(null);
    setNotes("");
    setAction(null);
    setDialogMode("resolve");
  }

  function handleEditSubmit() {
    if (!selected) return;
    const existing = selected.invoices?.extracted_data || {};
    const merged = {
      ...existing,
      vendor_name: editData.vendor_name || null,
      invoice_number: editData.invoice_number || null,
      invoice_date: editData.invoice_date || null,
      po_number: editData.po_number || null,
      subtotal: editData.subtotal ? parseFloat(editData.subtotal) : null,
      tax: editData.tax ? parseFloat(editData.tax) : null,
      total: editData.total ? parseFloat(editData.total) : null,
    };
    resolve.mutate({ id: selected.id, act: "edit", edited: merged });
  }

  const reasonIcon = (reason: string) => {
    if (reason.includes("PO number") && reason.includes("not found")) return "🔍";
    if (reason.includes("No PO number")) return "📋";
    if (reason.includes("No GRN")) return "📦";
    if (reason.includes("Amount variance")) return "💰";
    if (reason.includes("Duplicate")) return "🔄";
    if (reason.includes("Processing failed")) return "⚠️";
    return "❓";
  };

  const reasonCategory = (reason: string) => {
    if (reason.includes("PO number") && reason.includes("not found")) return "PO Mismatch";
    if (reason.includes("No PO number")) return "Missing PO";
    if (reason.includes("No GRN")) return "Missing GRN";
    if (reason.includes("Amount variance")) return "Amount Variance";
    if (reason.includes("Duplicate")) return "Duplicate";
    if (reason.includes("Processing failed")) return "Extraction Failed";
    return "Other";
  };

  const openCount = exceptions.filter(e => e.status === "open").length;

  return (
    <div className="flex flex-col flex-1 bg-gray-50/30">
      <Header title="Exception Queue" />
      <div className="p-8 space-y-6 max-w-5xl mx-auto w-full">

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-6">
          {[
            { label: "Open Issues", value: openCount, color: "text-amber-600", bg: "bg-amber-50 border-amber-100" },
            { label: "Total Exceptions", value: exceptions.length, color: "text-gray-900", bg: "bg-white border-gray-100" },
            { label: "AI Learning", value: "Active", color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
          ].map(s => (
            <div key={s.label} className={`${s.bg} border rounded-2xl p-5`}>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{s.label}</p>
              <p className={`text-2xl font-black ${s.color} mt-1`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {["open", "resolved", "rejected"].map(s => (
              <Button
                key={s}
                variant={statusFilter === s ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(s)}
                className={statusFilter === s
                  ? "bg-gray-900 text-white font-bold"
                  : "bg-white text-gray-600 font-semibold hover:bg-gray-100"
                }
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Button>
            ))}
          </div>
          <span className="text-sm text-gray-400 font-medium">{exceptions.length} results</span>
        </div>

        {/* Exception List */}
        <div className="space-y-4">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <Card key={i} className="border-none shadow-md rounded-2xl">
                <CardContent className="p-6 h-24 animate-pulse bg-gray-100/50 rounded-2xl" />
              </Card>
            ))
          ) : exceptions.length === 0 ? (
            <Card className="border-none shadow-md rounded-2xl">
              <CardContent className="p-16 text-center">
                <div className="text-4xl mb-3">🎉</div>
                <p className="text-lg font-bold text-gray-900">All Clear!</p>
                <p className="text-sm text-gray-400 mt-1">No {statusFilter} exceptions in the queue.</p>
              </CardContent>
            </Card>
          ) : (
            exceptions.map((exc) => (
              <Card key={exc.id} className="border-none shadow-md hover:shadow-lg rounded-2xl transition-all group">
                <CardContent className="p-0">
                  <div className="flex items-stretch">
                    {/* Left: Category indicator */}
                    <div className={`w-1.5 rounded-l-2xl shrink-0 ${
                      exc.status === "open" ? "bg-amber-400" :
                      exc.status === "resolved" ? "bg-green-400" : "bg-red-400"
                    }`} />

                    {/* Content */}
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between gap-6">
                        <div className="flex-1 min-w-0">
                          {/* Header row */}
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-xl">{reasonIcon(exc.reason)}</span>
                            <Badge className="bg-gray-100 text-gray-700 border-0 text-[10px] font-black uppercase tracking-widest px-3 py-1">
                              {reasonCategory(exc.reason)}
                            </Badge>
                            <Badge className={`border-0 text-[10px] font-black uppercase px-3 py-1 ${
                              exc.status === "open" ? "bg-amber-100 text-amber-700" :
                              exc.status === "resolved" ? "bg-green-100 text-green-700" :
                              "bg-red-100 text-red-700"
                            }`}>
                              {exc.status}
                            </Badge>
                            <span className="text-xs text-gray-400 ml-auto">
                              {formatDistanceToNow(new Date(exc.created_at), { addSuffix: true })}
                            </span>
                          </div>

                          {/* Reason */}
                          <p className="text-sm font-semibold text-gray-800 leading-relaxed">{exc.reason}</p>

                          {/* Invoice details */}
                          <div className="flex items-center gap-6 mt-3 text-xs">
                            {exc.invoices?.invoice_number && (
                              <div className="flex items-center gap-1.5 text-gray-500">
                                <FileText className="h-3.5 w-3.5" />
                                <span className="font-bold text-gray-700">#{exc.invoices.invoice_number}</span>
                              </div>
                            )}
                            {(exc.invoices as any)?.vendors?.name && (
                              <span className="text-gray-500">
                                Vendor: <span className="font-bold text-gray-700">{(exc.invoices as any).vendors.name}</span>
                              </span>
                            )}
                            {exc.invoices?.total && (
                              <span className="text-gray-500">
                                Amount: <span className="font-black text-gray-900">₹{exc.invoices.total.toLocaleString()}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                          {exc.invoice_id && (
                            <Link href={`/invoices/${exc.invoice_id}`}>
                              <Button variant="ghost" size="sm" className="w-full justify-start h-8 text-xs font-bold text-gray-500 hover:text-blue-600 hover:bg-blue-50">
                                <Eye className="h-3.5 w-3.5 mr-1.5" /> View Invoice
                              </Button>
                            </Link>
                          )}
                          {exc.status === "open" && (
                            <>
                              <Button size="sm" variant="ghost"
                                className="w-full justify-start h-8 text-xs font-bold text-blue-600 hover:bg-blue-50"
                                onClick={() => openEdit(exc)}>
                                <Pencil className="h-3.5 w-3.5 mr-1.5" /> Edit & Retry
                              </Button>
                              <Button size="sm" variant="ghost"
                                className="w-full justify-start h-8 text-xs font-bold text-green-600 hover:bg-green-50"
                                onClick={() => openResolve(exc, "approve")}>
                                <CheckCircle className="h-3.5 w-3.5 mr-1.5" /> Approve
                              </Button>
                              <Button size="sm" variant="ghost"
                                className="w-full justify-start h-8 text-xs font-bold text-red-500 hover:bg-red-50"
                                onClick={() => openResolve(exc, "reject")}>
                                <XCircle className="h-3.5 w-3.5 mr-1.5" /> Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* ── Resolve Dialog ── */}
      <Dialog open={!!selected && dialogMode === "resolve"} onOpenChange={() => closeDialog()}>
        <DialogContent className="sm:max-w-lg p-0 gap-0 border-none shadow-2xl rounded-3xl overflow-hidden">
          <div className={`p-6 ${action === "approve" ? "bg-green-50" : "bg-red-50"}`}>
            <DialogHeader>
              <DialogTitle className="text-xl font-black text-gray-900 flex items-center gap-3">
                {action === "approve" ? (
                  <><CheckCircle className="h-6 w-6 text-green-600" /> Approve & Post</>
                ) : (
                  <><XCircle className="h-6 w-6 text-red-600" /> Reject Invoice</>
                )}
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6 space-y-5">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Exception Reason</p>
              <p className="text-sm font-semibold text-gray-700">{selected?.reason}</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold text-gray-700">Resolution Notes</Label>
              <Textarea
                placeholder="Explain why you're taking this action..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="bg-white border-gray-200 resize-none"
              />
            </div>

            {/* AI Learning toggle */}
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <Brain className="h-5 w-5 text-blue-600 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-bold text-blue-900">AI Learning</p>
                <p className="text-xs text-blue-700/70">System will remember this resolution for similar future cases.</p>
              </div>
              <button
                onClick={() => setLearnFromThis(!learnFromThis)}
                className={`w-10 h-6 rounded-full transition-colors ${learnFromThis ? "bg-blue-600" : "bg-gray-300"}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-1 ${learnFromThis ? "translate-x-4" : ""}`} />
              </button>
            </div>
          </div>
          <div className="p-6 bg-gray-50 border-t flex justify-end gap-3">
            <Button variant="ghost" onClick={closeDialog} className="font-semibold">Cancel</Button>
            <Button
              variant={action === "approve" ? "default" : "destructive"}
              disabled={resolve.isPending}
              onClick={() => selected && resolve.mutate({ id: selected.id, act: action! })}
              className="font-bold px-8"
            >
              {resolve.isPending ? "Processing..." : action === "approve" ? "Approve & Post to Ledger" : "Reject Invoice"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Edit & Retry Dialog ── */}
      <Dialog open={!!selected && dialogMode === "edit"} onOpenChange={() => closeDialog()}>
        <DialogContent className="sm:max-w-3xl p-0 gap-0 border-none shadow-2xl rounded-3xl overflow-hidden max-h-[90vh] overflow-y-auto">
          <div className="p-6 bg-blue-50 border-b border-blue-100 sticky top-0 z-10">
            <DialogHeader>
              <DialogTitle className="text-xl font-black text-gray-900 flex items-center gap-3">
                <Pencil className="h-5 w-5 text-blue-600" /> Edit Extracted Data & Re-Match
              </DialogTitle>
              <p className="text-sm text-blue-700/70 mt-1">Correct the AI-extracted data and the system will re-run matching.</p>
            </DialogHeader>
          </div>
          <div className="p-8 space-y-8">
            {/* Current exception */}
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-900">Current Issue</p>
                <p className="text-sm text-amber-800/80">{selected?.reason}</p>
              </div>
            </div>

            {/* Editable fields */}
            <div className="grid grid-cols-2 gap-6">
              {[
                { key: "vendor_name", label: "Vendor Name", placeholder: "e.g. TechPro India Ltd" },
                { key: "invoice_number", label: "Invoice Number", placeholder: "e.g. INV-2025-001" },
                { key: "invoice_date", label: "Invoice Date", placeholder: "YYYY-MM-DD", type: "date" },
                { key: "po_number", label: "PO Reference", placeholder: "e.g. PO-2025-007" },
                { key: "subtotal", label: "Subtotal (₹)", placeholder: "0.00", type: "number" },
                { key: "tax", label: "Tax Amount (₹)", placeholder: "0.00", type: "number" },
                { key: "total", label: "Grand Total (₹)", placeholder: "0.00", type: "number" },
              ].map(field => (
                <div key={field.key} className={`space-y-2 ${field.key === "vendor_name" ? "col-span-2" : ""}`}>
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{field.label}</Label>
                  <Input
                    type={field.type || "text"}
                    value={(editData as any)[field.key]}
                    onChange={e => setEditData(prev => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="bg-white border-gray-200 h-11 font-medium focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>

            {/* Resolution notes */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Correction Notes</Label>
              <Textarea
                placeholder="What did you correct and why? This helps the AI learn..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="bg-white border-gray-200 resize-none"
              />
            </div>

            {/* AI Learning */}
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <Sparkles className="h-5 w-5 text-blue-600 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-bold text-blue-900">Train AI on this correction</p>
                <p className="text-xs text-blue-700/60">The system will apply this fix pattern to similar future invoices automatically.</p>
              </div>
              <button
                onClick={() => setLearnFromThis(!learnFromThis)}
                className={`w-10 h-6 rounded-full transition-colors ${learnFromThis ? "bg-blue-600" : "bg-gray-300"}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-1 ${learnFromThis ? "translate-x-4" : ""}`} />
              </button>
            </div>
          </div>

          <div className="p-6 bg-gray-50 border-t flex justify-between items-center sticky bottom-0 z-10">
            <Button variant="ghost" onClick={closeDialog} className="font-semibold text-gray-500">
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 h-11 rounded-xl shadow-xl shadow-blue-200 active:scale-95 transition-all"
              disabled={resolve.isPending}
              onClick={handleEditSubmit}
            >
              {resolve.isPending ? (
                <><RotateCcw className="h-4 w-4 mr-2 animate-spin" /> Re-Matching...</>
              ) : (
                <><ArrowRight className="h-4 w-4 mr-2" /> Save & Re-Match</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
