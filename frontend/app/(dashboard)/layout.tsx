import Sidebar from "@/components/layout/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="flex-1 ml-60 min-h-screen bg-gray-50 flex flex-col">
        {children}
      </main>
    </div>
  );
}
