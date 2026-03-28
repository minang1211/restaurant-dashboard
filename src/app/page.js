"use client";

import { useState, useRef, useEffect } from "react";
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

const restaurants = [
  "Royal Tandoor",
  "Tandoor Bite",
  "Indian Cuisine",
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [selectedRestaurant, setSelectedRestaurant] = useState(restaurants[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0a1628] font-sans text-white">

      <aside className="w-64 bg-[#0f1d32] border-r border-[#1a2d4a] flex flex-col shrink-0">
        <div className="p-8">
          <div className="bg-[#f97316] w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
            <span className="font-bold text-white text-sm">Logo</span>
          </div>
          <h2 className="text-center font-bold text-lg text-white">Apollo One</h2>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <SidebarItem icon={<Home size={20} />} label="Overview" active={activeTab === "Overview"} onClick={() => setActiveTab("Overview")} />
          <SidebarItem icon={<Phone size={20} />} label="Calls & Customers" active={activeTab === "Calls"} onClick={() => setActiveTab("Calls")} />
          <SidebarItem icon={<DollarSign size={20} />} label="Business Impact" active={activeTab === "Impact"} onClick={() => setActiveTab("Impact")} />
          <SidebarItem icon={<HelpCircle size={20} />} label="Support" active={activeTab === "Support"} onClick={() => setActiveTab("Support")} />
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
          <div className="flex items-center gap-4">
            <span className="font-bold text-lg">Welcome, {selectedRestaurant}</span>
            <span className="text-xs text-green-400 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full inline-block"></span>
              ACTIVE
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Settings size={20} className="text-gray-400 hover:text-[#f97316] cursor-pointer transition-colors" />

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 bg-[#1a2d4a] px-4 py-1.5 rounded shadow-sm font-bold text-sm hover:bg-[#243a5e] transition-colors"
              >
                {selectedRestaurant}
                <ChevronDown size={14} className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#0f1d32] border border-[#1a2d4a] rounded-lg shadow-lg z-50 overflow-hidden">
                  {restaurants.map((name) => (
                    <button
                      key={name}
                      onClick={() => {
                        setSelectedRestaurant(name);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm font-bold transition-colors ${selectedRestaurant === name
                          ? "bg-[#f97316] text-white"
                          : "text-gray-300 hover:bg-[#1a2d4a] hover:text-[#f97316]"
                        }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>
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