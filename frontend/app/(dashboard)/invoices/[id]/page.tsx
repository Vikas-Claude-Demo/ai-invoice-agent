"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Header from "@/components/layout/header";
import { Invoice } from "@/lib/types";
import StatusBadge from "@/components/invoices/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { use } from "react";

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: invoice, isLoading } = useQuery<Invoice>({
    queryKey: ["invoice", id],
    queryFn: () => api.invoices.get(id),
  });

  if (isLoading) return <div className="flex-1 p-6 flex items-center justify-center text-gray-400">Loading...</div>;
  if (!invoice) return <div className="flex-1 p-6 text-gray-400">Invoice not found</div>;

  const ext = invoice.extracted_data;

  return (
    <div className="flex flex-col flex-1">
      <Header title="Invoice Detail" />
      <div className="p-6 space-y-4 max-w-5xl">
        <div className="flex items-center gap-3">
          <Link href="/invoices"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button></Link>
          <StatusBadge status={invoice.status} />
          {invoice.invoice_number && <span className="text-gray-500 text-sm">#{invoice.invoice_number}</span>}
        </div>

        {invoice.exceptions && invoice.exceptions.filter(e => e.status === "open").map((exc) => (
          <div key={exc.id} className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">Exception</p>
              <p className="text-sm text-amber-700">{exc.reason}</p>
              <Link href="/exceptions"><Button variant="link" className="p-0 h-auto text-amber-700 text-sm">Review exception →</Button></Link>
            </div>
          </div>
        ))}

        <div className="grid grid-cols-3 gap-4">
          <Card className="col-span-2">
            <CardHeader><CardTitle className="text-base">Extracted Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  ["Vendor", ext?.vendor_name],
                  ["Invoice Number", ext?.invoice_number],
                  ["Invoice Date", ext?.invoice_date],
                  ["PO Number", ext?.po_number],
                  ["Subtotal", ext?.subtotal ? `₹${ext.subtotal.toLocaleString()}` : null],
                  ["Tax", ext?.tax ? `₹${ext.tax.toLocaleString()}` : null],
                  ["Total", ext?.total ? `₹${ext.total.toLocaleString()}` : null],
                  ["Confidence", ext?.confidence_score ? `${Math.round(ext.confidence_score * 100)}%` : null],
                ].map(([label, value]) => (
                  <div key={label as string}>
                    <p className="text-gray-500 text-xs">{label}</p>
                    <p className="font-medium">{value ?? "—"}</p>
                  </div>
                ))}
              </div>

              {ext?.low_confidence_fields && ext.low_confidence_fields.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Low confidence fields</p>
                  <div className="flex gap-1 flex-wrap">
                    {ext.low_confidence_fields.map((f) => (
                      <Badge key={f} className="bg-amber-100 text-amber-700 border-0 text-xs">{f}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {ext?.line_items && ext.line_items.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Line Items</p>
                  <table className="w-full text-xs border rounded">
                    <thead><tr className="bg-gray-50 border-b">
                      <th className="text-left px-2 py-1.5">Description</th>
                      <th className="text-right px-2 py-1.5">Qty</th>
                      <th className="text-right px-2 py-1.5">Rate</th>
                      <th className="text-right px-2 py-1.5">Amount</th>
                    </tr></thead>
                    <tbody>
                      {ext.line_items.map((li, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="px-2 py-1.5">{li.description}</td>
                          <td className="px-2 py-1.5 text-right">{li.qty}</td>
                          <td className="px-2 py-1.5 text-right">₹{li.rate?.toLocaleString()}</td>
                          <td className="px-2 py-1.5 text-right font-medium">₹{li.amount?.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Source File</CardTitle></CardHeader>
              <CardContent>
                {invoice.raw_file_url ? (
                  <a href={invoice.raw_file_url} target="_blank" rel="noreferrer">
                    <Button variant="outline" size="sm" className="w-full gap-1">
                      <ExternalLink className="h-3.5 w-3.5" /> View File
                    </Button>
                  </a>
                ) : <p className="text-sm text-gray-400">No file available</p>}
                <div className="mt-3 text-xs space-y-1 text-gray-500">
                  <p>Source: <span className="text-gray-700 capitalize">{invoice.source}</span></p>
                  {invoice.sender_email && <p>From: <span className="text-gray-700">{invoice.sender_email}</span></p>}
                </div>
              </CardContent>
            </Card>

            {invoice.invoice_matches && invoice.invoice_matches.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-base">Match Result</CardTitle></CardHeader>
                <CardContent className="text-sm space-y-2">
                  {invoice.invoice_matches.map((m) => (
                    <div key={m.id}>
                      <p>PO: <span className="font-medium">{m.purchase_orders?.po_number ?? "—"}</span></p>
                      <p>GRN: <span className="font-medium">{m.grns?.grn_number ?? "—"}</span></p>
                      <p>Score: <span className="font-medium">{m.match_score ? `${Math.round(m.match_score * 100)}%` : "—"}</span></p>
                      <Badge className={m.match_status === "auto_matched" ? "bg-green-100 text-green-700 border-0 mt-1" : "bg-amber-100 text-amber-700 border-0 mt-1"}>
                        {m.match_status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
