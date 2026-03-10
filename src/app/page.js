"use client";

import { useState } from "react";
import {
  Home,
  Phone,
  DollarSign,
  HelpCircle,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";
import OverviewTab from "./components/OverviewTab";
import CallsTab from "./components/CallsTab";
import ImpactTab from "./components/ImpactTab";
import SupportTab from "./components/SupportTab";
import SettingsTab from "./components/SettingsTab";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("Overview");

  return (
    <div className="flex min-h-screen bg-[#0a1628] font-sans text-white">

      <aside className="w-64 bg-[#0f1d32] border-r border-[#1a2d4a] flex flex-col shrink-0">
        <div className="p-8">
          <div className="bg-[#f97316] w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
            <span className="font-bold text-white text-sm">Logo</span>
          </div>
          <h2 className="text-center font-bold text-lg text-white">Uncle Tom</h2>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <SidebarItem icon={<Home size={20} />} label="Overview" active={activeTab === "Overview"} onClick={() => setActiveTab("Overview")} />
          <SidebarItem icon={<Phone size={20} />} label="Calls and Customers" active={activeTab === "Calls"} onClick={() => setActiveTab("Calls")} />
          <SidebarItem icon={<DollarSign size={20} />} label="Business Impact" active={activeTab === "Impact"} onClick={() => setActiveTab("Impact")} />
          <SidebarItem icon={<HelpCircle size={20} />} label="Support" active={activeTab === "Support"} onClick={() => setActiveTab("Support")} />
          <SidebarItem icon={<Settings size={20} />} label="Settings" active={activeTab === "Settings"} onClick={() => setActiveTab("Settings")} />
        </nav>

        <div className="p-8 border-t border-[#1a2d4a]">
          <button className="flex items-center space-x-3 text-gray-400 hover:text-[#f97316] transition-colors w-full font-bold">
            <LogOut size={20} />
            <span>Log Off</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-[#0f1d32] text-white flex items-center justify-between px-6 shadow-md shrink-0 border-b border-[#1a2d4a]">
          <div className="flex items-center space-x-2 bg-[#f97316] text-white px-4 py-1.5 rounded shadow-sm">
            <div className="font-bold text-sm">📍 Uncle Tom&apos;s Restaurant</div>
            <ChevronDown size={14} />
          </div>
          <div className="bg-[#1a2d4a] text-white px-4 py-1.5 rounded shadow-sm font-bold text-sm">
            Hello, Tom
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-[#0a1628]">
          {activeTab === "Overview" && <OverviewTab />}
          {activeTab === "Calls" && <CallsTab />}
          {activeTab === "Impact" && <ImpactTab />}
          {activeTab === "Support" && <SupportTab />}
          {activeTab === "Settings" && <SettingsTab />}
        </div>
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-3 w-full px-4 py-4 rounded-xl font-bold transition-all duration-200 ${active
          ? "bg-[#f97316] text-white shadow-sm"
          : "text-gray-400 hover:bg-[#1a2d4a] hover:text-white"
        }`}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </button>
  );
}