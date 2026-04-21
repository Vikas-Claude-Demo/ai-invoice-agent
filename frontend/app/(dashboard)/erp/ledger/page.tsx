"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Header from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

export default function LedgerPage() {
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["ledger"],
    queryFn: api.erp.ledger,
    refetchInterval: 30_000,
  });

  return (
    <div className="flex flex-col flex-1">
      <Header title="AP Ledger" />
      <div className="p-6 space-y-4">
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Invoice #</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Vendor</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Description</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Debit</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Credit (AP)</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              </tr></thead>
              <tbody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => <tr key={i} className="border-b"><td colSpan={7} className="px-4 py-3"><div className="h-4 bg-gray-100 animate-pulse rounded" /></td></tr>)
                ) : entries.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No ledger entries yet</td></tr>
                ) : entries.map((e: any) => (
                  <tr key={e.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">{e.posted_at ? format(new Date(e.posted_at), "dd MMM yyyy") : "—"}</td>
                    <td className="px-4 py-3 font-medium">{e.invoices?.invoice_number ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{e.invoices?.vendors?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{e.journal_entry?.description ?? "—"}</td>
                    <td className="px-4 py-3 text-right">₹{Number(e.invoices?.total ?? 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-green-700">₹{Number(e.invoices?.total ?? 0).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${e.status === "posted" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{e.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
