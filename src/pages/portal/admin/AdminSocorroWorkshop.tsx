import { useState } from "react";
import AdminSocorroApproval from "@/components/portal/AdminSocorroApproval";
import SocorroRegistrationsTable from "@/components/portal/SocorroRegistrationsTable";

type Tab = "advisors" | "registrations";

export default function AdminSocorroWorkshop() {
  const [activeTab, setActiveTab] = useState<Tab>("advisors");

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Socorro ISD Workshop</h1>
        <p className="text-sm text-gray-500">Manage advisors and view all workshop registrations.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {([
          { key: "advisors" as Tab, label: "Advisors" },
          { key: "registrations" as Tab, label: "All Registrations" },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="px-4 py-2 text-sm font-medium transition-colors"
            style={{
              color: activeTab === tab.key ? "#1A4D3E" : "#9CA3AF",
              borderBottom: activeTab === tab.key ? "2px solid #1A4D3E" : "2px solid transparent",
              marginBottom: "-1px",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "advisors" && <AdminSocorroApproval />}
      {activeTab === "registrations" && <SocorroRegistrationsTable />}
    </div>
  );
}
