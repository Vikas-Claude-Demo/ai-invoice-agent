"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Header from "@/components/layout/header";
import { Invoice } from "@/lib/types";
import StatusBadge from "@/components/invoices/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Eye, Mail, Upload, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

export default function InvoicesPage() {
  const [status, setStatus] = useState<string>("all");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["invoices", status, page],
    queryFn: () => api.invoices.list(status === "all" ? undefined : status, page),
    refetchInterval: 15_000,
  });

  const invoices: Invoice[] = data?.data ?? [];
  const total: number = data?.total ?? 0;

  const qc = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.invoices.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
    },
  });

  return (
    <div className="flex flex-col flex-1 bg-gray-50/50 min-h-screen">
      <Header title="Invoices" />
      <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Modern Header & Filters */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900">Invoice Registry</h1>
            <p className="text-sm text-gray-500 mt-1">Manage and verify automated invoice extractions.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={status} onValueChange={(v: string | null) => { setStatus(v ?? "all"); setPage(1); }}>
              <SelectTrigger className="w-48 bg-gray-50/50 border-gray-200 rounded-xl font-medium focus:ring-blue-500">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-gray-100 shadow-lg">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="extracted">Extracted</SelectItem>
                <SelectItem value="matched">Matched</SelectItem>
                <SelectItem value="exception">Exception</SelectItem>
                <SelectItem value="posted">Posted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-bold border border-blue-100 shadow-inner">
              {total} <span className="font-medium text-blue-600/80">Total</span>
            </div>
          </div>
        </div>

        {/* Premium Table */}
        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white ring-1 ring-gray-100">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/80 text-[10px] uppercase tracking-widest text-gray-400 font-black">
                    <th className="px-6 py-4 rounded-tl-xl">Invoice Details</th>
                    <th className="px-6 py-4">Vendor</th>
                    <th className="px-6 py-4">Reconciliation</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                    <th className="px-6 py-4">Source</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right rounded-tr-xl">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {isLoading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i}>
                        {[...Array(7)].map((_, j) => (
                          <td key={j} className="px-6 py-5">
                            <div className="h-5 bg-gray-100 rounded-md animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : invoices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center ring-4 ring-gray-50/50">
                            <Mail className="h-6 w-6 text-gray-300" />
                          </div>
                          <p className="text-gray-500 font-medium">No invoices found</p>
                          <p className="text-xs text-gray-400">Try adjusting your status filter or upload a new document.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900">{inv.invoice_number ?? "Drafting..."}</span>
                            <span className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">
                              {formatDistanceToNow(new Date(inv.created_at), { addSuffix: true })}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-gray-700">
                            {inv.vendors?.name ?? inv.extracted_data?.vendor_name ?? <span className="text-amber-500 italic text-xs">Unknown Supplier</span>}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {inv.po_number ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-600 text-xs font-medium border border-gray-200">
                              PO: {inv.po_number}
                            </span>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-black text-gray-900 tracking-tight">
                            {formatCurrency(inv.total, inv.extracted_data?.currency)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {inv.source === "email" ? (
                            <span className="flex items-center gap-1.5 text-gray-500 font-medium text-xs">
                              <div className="p-1 bg-blue-50 text-blue-600 rounded"><Mail className="h-3 w-3" /></div> Email
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-gray-500 font-medium text-xs">
                              <div className="p-1 bg-purple-50 text-purple-600 rounded"><Upload className="h-3 w-3" /></div> Upload
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4"><StatusBadge status={inv.status} /></td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                            <Link href={`/invoices/${inv.id}`}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              onClick={() => {
                                if (confirm("Are you sure you want to delete this invoice?")) {
                                  deleteMutation.mutate(inv.id);
                                }
                              }}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Elegant Pagination */}
        {total > 20 && (
          <div className="flex justify-center items-center gap-4 pt-4 pb-8">
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50"
              disabled={page === 1} 
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </Button>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Page {page} of {Math.ceil(total / 20)}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50"
              disabled={page >= Math.ceil(total / 20)} 
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
