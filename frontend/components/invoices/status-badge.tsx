import { Badge } from "@/components/ui/badge";
import { InvoiceStatus } from "@/lib/types";

const config: Record<InvoiceStatus, { label: string; class: string }> = {
  received:   { label: "Received",   class: "bg-gray-100 text-gray-700" },
  processing: { label: "Processing", class: "bg-blue-100 text-blue-700" },
  extracted:  { label: "Extracted",  class: "bg-indigo-100 text-indigo-700" },
  matched:    { label: "Matched",    class: "bg-teal-100 text-teal-700" },
  exception:  { label: "Exception",  class: "bg-amber-100 text-amber-700" },
  approved:   { label: "Approved",   class: "bg-green-100 text-green-700" },
  posted:     { label: "Posted",     class: "bg-green-600 text-white" },
  rejected:   { label: "Rejected",   class: "bg-red-100 text-red-700" },
};

export default function StatusBadge({ status }: { status: InvoiceStatus }) {
  const c = config[status] ?? { label: status, class: "bg-gray-100 text-gray-700" };
  return <Badge className={`${c.class} border-0 font-medium`}>{c.label}</Badge>;
}
