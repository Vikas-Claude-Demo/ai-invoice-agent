"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, AlertTriangle, CheckCircle, Clock, TrendingUp, XCircle } from "lucide-react";
import { Stats } from "@/lib/types";
import InvoiceUpload from "@/components/invoices/invoice-upload";

function StatCard({ title, value, icon: Icon, color }: { title: string; value: number; icon: any; color: string }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ["stats"],
    queryFn: api.invoices.stats,
    refetchInterval: 30_000,
  });

  return (
    <div className="flex flex-col flex-1">
      <Header title="Dashboard" />
      <div className="p-6 space-y-6">
        {isLoading ? (
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}><CardContent className="p-6 h-24 animate-pulse bg-gray-100" /></Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Invoices" value={stats?.total ?? 0} icon={FileText} color="bg-blue-500" />
            <StatCard title="Open Exceptions" value={stats?.open_exceptions ?? 0} icon={AlertTriangle} color="bg-amber-500" />
            <StatCard title="Posted" value={stats?.by_status?.posted ?? 0} icon={CheckCircle} color="bg-green-500" />
            <StatCard title="Processing" value={(stats?.by_status?.processing ?? 0) + (stats?.by_status?.received ?? 0)} icon={Clock} color="bg-purple-500" />
          </div>
        )}

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Invoice Pipeline</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { label: "Received", key: "received", color: "bg-gray-400" },
                    { label: "Processing", key: "processing", color: "bg-blue-400" },
                    { label: "Extracted", key: "extracted", color: "bg-indigo-400" },
                    { label: "Matched", key: "matched", color: "bg-teal-400" },
                    { label: "Exception", key: "exception", color: "bg-amber-400" },
                    { label: "Posted", key: "posted", color: "bg-green-500" },
                    { label: "Rejected", key: "rejected", color: "bg-red-400" },
                  ].map(({ label, key, color }) => {
                    const count = stats?.by_status?.[key as keyof typeof stats.by_status] ?? 0;
                    const pct = stats?.total ? Math.round((count / stats.total) * 100) : 0;
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 w-24">{label}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div className={`${color} h-2 rounded-full`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-sm font-medium w-8 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <InvoiceUpload />
          </div>
        </div>
      </div>
    </div>
  );
}
