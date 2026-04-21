"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Header from "@/components/layout/header";
import { Vendor } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";

const emptyForm = { name: "", email: "", gstin: "", bank_name: "", bank_account: "", bank_ifsc: "" };

export default function VendorsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Vendor | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: vendors = [], isLoading } = useQuery<Vendor[]>({
    queryKey: ["vendors"],
    queryFn: api.erp.vendors.list,
  });

  const save = useMutation({
    mutationFn: () =>
      editing ? api.erp.vendors.update(editing.id, form) : api.erp.vendors.create(form),
    onSuccess: () => {
      toast.success(editing ? "Vendor updated" : "Vendor created");
      qc.invalidateQueries({ queryKey: ["vendors"] });
      setOpen(false);
      setEditing(null);
      setForm(emptyForm);
    },
    onError: (e: any) => toast.error(e.message),
  });

  function openEdit(v: Vendor) {
    setEditing(v);
    setForm({ name: v.name, email: v.email ?? "", gstin: v.gstin ?? "", bank_name: v.bank_name ?? "", bank_account: v.bank_account ?? "", bank_ifsc: v.bank_ifsc ?? "" });
    setOpen(true);
  }

  return (
    <div className="flex flex-col flex-1">
      <Header title="Vendors" />
      <div className="p-6 space-y-4">
        <div className="flex justify-end">
          <Button onClick={() => { setEditing(null); setForm(emptyForm); setOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" /> Add Vendor
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">GSTIN</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Bank</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [...Array(3)].map((_, i) => <tr key={i} className="border-b"><td colSpan={5} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>)
                ) : vendors.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No vendors yet</td></tr>
                ) : vendors.map((v) => (
                  <tr key={v.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{v.name}</td>
                    <td className="px-4 py-3 text-gray-600">{v.email ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{v.gstin ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{v.bank_name ?? "—"}</td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(v)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Vendor" : "Add Vendor"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {([["name","Name*"],["email","Email"],["gstin","GSTIN"],["bank_name","Bank Name"],["bank_account","Account Number"],["bank_ifsc","IFSC Code"]] as [keyof typeof form, string][]).map(([key, label]) => (
              <div key={key} className="space-y-1">
                <Label>{label}</Label>
                <Input value={form[key]} onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))} />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button disabled={!form.name || save.isPending} onClick={() => save.mutate()}>
              {save.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
