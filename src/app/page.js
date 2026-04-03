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
  ChevronUp,
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
  const [logoutOpen, setLogoutOpen] = useState(false);
  const dropdownRef = useRef(null);
  const logoutRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
      if (logoutRef.current && !logoutRef.current.contains(e.target)) setLogoutOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0A2342] font-sans text-white">

      <aside className="w-64 bg-[#0A2342] border-r border-[#1a2d4a] flex flex-col shrink-0">
        <div className="p-6 text-center">
          <img src="/images/logo.png" alt="Apollo One" className="w-28 mx-auto mb-1" />
          <div>
            <span className="text-[#FF5900] font-black text-xl">Apollo </span>
            <span className="text-white font-black text-xl">One</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <SidebarItem icon={<Home size={20} />} label="Overview" active={activeTab === "Overview"} onClick={() => setActiveTab("Overview")} />
          <SidebarItem icon={<Phone size={20} />} label="Calls & Customers" active={activeTab === "Calls"} onClick={() => setActiveTab("Calls")} />
          <SidebarItem icon={<DollarSign size={20} />} label="Business Impact" active={activeTab === "Impact"} onClick={() => setActiveTab("Impact")} />
          <SidebarItem icon={<HelpCircle size={20} />} label="Support" active={activeTab === "Support"} onClick={() => setActiveTab("Support")} />
        </nav>

        <div className="p-6 border-t border-[#1a2d4a] relative" ref={logoutRef}>
          {logoutOpen && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-[#0A2342] border border-[#1a2d4a] rounded-xl p-4 shadow-lg">
              <LogOut size={24} className="mx-auto mb-2 text-white" />
              <p className="text-white text-sm font-bold text-center mb-3">Are you sure you want to log out?</p>
              <div className="flex gap-2">
                <button className="flex-1 bg-[#E91515] text-white font-bold text-sm py-2 rounded-lg hover:bg-transparent hover:border hover:border-white transition-all">
                  Yes
                </button>
                <button
                  onClick={() => setLogoutOpen(false)}
                  className="flex-1 bg-[#0A2342] border border-white text-white font-bold text-sm py-2 rounded-lg hover:bg-[#1a2d4a] transition-all"
                >
                  No
                </button>
              </div>
            </div>
          )}
          <button
            onClick={() => setLogoutOpen(!logoutOpen)}
            className="flex items-center space-x-3 text-white hover:text-[#FF5900] transition-colors w-full font-bold"
          >
            <LogOut size={20} />
            <span>Log Off</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-[#0A2342] text-white flex items-center justify-between px-6 shadow-md shrink-0 border-b border-[#1a2d4a]">
          <div className="flex items-center gap-4">
            <span className="text-white font-bold text-lg">Welcome, {selectedRestaurant}</span>
            <div className="flex items-center gap-1">
              <span className="text-[#EDEDED] text-xs">Agent Status: ACTIVE</span>
              <span className="w-2.5 h-2.5 bg-[#7AD354] rounded-full inline-block"></span>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <LogOut size={20} className="text-white hover:text-[#FF5900] cursor-pointer transition-colors" />
            <HelpCircle size={20} className="text-white hover:text-[#FF5900] cursor-pointer transition-colors" onClick={() => setActiveTab("Support")} />
            <Settings size={20} className="text-white hover:text-[#FF5900] cursor-pointer transition-colors" />

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 bg-[#EDEDED] text-[#0A2342] px-4 py-1.5 rounded shadow-sm font-bold text-sm hover:bg-white transition-colors"
              >
                {selectedRestaurant}
                {dropdownOpen ? <ChevronUp size={14} className="text-[#0A2342]" /> : <ChevronDown size={14} className="text-[#0A2342]" />}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#EDEDED] border border-[#0A2342] rounded-lg shadow-lg z-50 overflow-hidden">
                  {restaurants.map((name) => (
                    <button
                      key={name}
                      onClick={() => {
                        setSelectedRestaurant(name);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm font-bold transition-colors ${selectedRestaurant === name
                          ? "bg-[#FF5900] text-white"
                          : "text-[#0A2342] hover:bg-[#FF5900] hover:text-white"
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
      className={`flex items-center space-x-3 w-full px-4 py-4 rounded-xl font-bold transition-all duration-200 border-2 ${active
          ? "border-[#FF5900] text-[#FF5900]"
          : "border-transparent text-white hover:border-[#FF5900] hover:text-[#FF5900]"
        }`}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </button>
  );
}