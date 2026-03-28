"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import MetricCard from "./MetricCard";
import { callLogs } from "../data/callLogs";

const intentLabels = {
    takeout_order: "Phone Order",
    hours_location: "Other",
    reservation: "Reservation",
    catering_inquiry: "Catering",
    spam_call: "Spam",
};

const allColumns = ["Date", "Time", "Duration", "Inquiry", "Summary", "Status"];

export default function CallsTab() {
    const allDates = [...new Set(callLogs.map((c) => c.date))].sort();
    const [startDate, setStartDate] = useState(allDates[0] || "");
    const [endDate, setEndDate] = useState(allDates[allDates.length - 1] || "");
    const [visibleColumns, setVisibleColumns] = useState(allColumns);
    const [filterOpen, setFilterOpen] = useState(false);
    const [showCount, setShowCount] = useState(10);
    const filterRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (filterRef.current && !filterRef.current.contains(e.target)) {
                setFilterOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filtered = callLogs.filter(
        (c) => c.date >= startDate && c.date <= endDate
    );

    const total = filtered.length;
    const resolved = filtered.filter((c) => c.outcome === "resolved").length;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
    const totalSec = filtered.reduce((s, c) => s + c.durationSec, 0);
    const avgSec = total > 0 ? Math.round(totalSec / total) : 0;
    const avgMin = Math.floor(avgSec / 60);
    const avgRemSec = avgSec % 60;
    const avgDurationLabel = avgMin > 0 ? `${avgMin}m ${avgRemSec}s` : `${avgRemSec}s`;

    const today = new Date();
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const dayNum = today.getDate();
    const suffix =
        dayNum % 10 === 1 && dayNum !== 11 ? "st" :
            dayNum % 10 === 2 && dayNum !== 12 ? "nd" :
                dayNum % 10 === 3 && dayNum !== 13 ? "rd" : "th";
    const dateString = `${days[today.getDay()]}, ${months[today.getMonth()]} ${dayNum}${suffix}, ${today.getFullYear()}`;

    function toggleColumn(col) {
        if (visibleColumns.includes(col)) {
            if (visibleColumns.length <= 1) return;
            setVisibleColumns(visibleColumns.filter((c) => c !== col));
        } else {
            setVisibleColumns([...visibleColumns, col]);
        }
    }

    function toggleAll() {
        if (visibleColumns.length === allColumns.length) {
            setVisibleColumns(["Date", "Status"]);
        } else {
            setVisibleColumns([...allColumns]);
        }
    }

    function formatDuration(sec) {
        const m = Math.floor(sec / 60);
        const s = Math.round(sec % 60);
        return m > 0 ? `${m}m ${s}s` : `${s}s`;
    }

    function getStatusStyle(outcome) {
        if (outcome === "resolved") return "text-green-400";
        if (outcome === "transferred") return "text-yellow-400";
        return "text-red-400";
    }

    function getStatusLabel(outcome) {
        if (outcome === "resolved") return "Resolved";
        if (outcome === "transferred") return "Follow-up";
        return "Unresolved";
    }

    const displayData = [...filtered].reverse().slice(0, showCount);

    return (
        <>
            <div className="bg-[#0f1d32] rounded-2xl p-4 mb-6 text-center border border-[#1a2d4a]">
                <h1 className="text-2xl font-bold text-white">Calls & Customers</h1>
                <p className="text-gray-400 text-sm">{dateString}</p>
            </div>

            <div className="bg-[#0f1d32] rounded-[2rem] p-8 shadow-inner border border-[#1a2d4a]">

                <div className="flex items-center justify-center gap-4 mb-8 flex-wrap">
                    <div className="flex items-center gap-2 bg-[#1a2d4a] rounded-xl px-4 py-2">
                        <span className="font-bold text-sm text-[#f97316]">Filter From:</span>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-[#0f1d32] border border-[#1a2d4a] rounded-lg px-3 py-1 text-sm font-bold text-white"
                        />
                    </div>
                    <div className="flex items-center gap-2 bg-[#1a2d4a] rounded-xl px-4 py-2">
                        <span className="font-bold text-sm text-[#f97316]">To:</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-[#0f1d32] border border-[#1a2d4a] rounded-lg px-3 py-1 text-sm font-bold text-white"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <MetricCard title="Calls Handled" value={total} />
                    <MetricCard title="Average Call Duration" value={total === 0 ? "—" : avgDurationLabel} />
                    <MetricCard title="Resolution Rate" value={total === 0 ? "—" : `${resolutionRate}%`} />
                </div>

                <div className="bg-[#1a2d4a]/50 rounded-3xl overflow-hidden">
                    <div className="p-4 border-b border-[#1a2d4a] flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white">Call History</h3>

                        <div className="relative" ref={filterRef}>
                            <button
                                onClick={() => setFilterOpen(!filterOpen)}
                                className="flex items-center gap-2 bg-[#0f1d32] border border-[#1a2d4a] px-3 py-1.5 rounded-lg text-sm font-bold hover:border-[#f97316] transition-colors"
                            >
                                Filter
                                <ChevronDown size={14} className={`transition-transform ${filterOpen ? "rotate-180" : ""}`} />
                            </button>

                            {filterOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-[#0f1d32] border border-[#1a2d4a] rounded-lg shadow-lg z-50 overflow-hidden">
                                    <button
                                        onClick={toggleAll}
                                        className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-300 hover:bg-[#1a2d4a] border-b border-[#1a2d4a] flex items-center gap-2"
                                    >
                                        <span className={`w-4 h-4 rounded border flex items-center justify-center text-xs ${visibleColumns.length === allColumns.length
                                                ? "bg-[#f97316] border-[#f97316] text-white"
                                                : "border-gray-500"
                                            }`}>
                                            {visibleColumns.length === allColumns.length ? "✓" : ""}
                                        </span>
                                        Select All
                                    </button>
                                    {allColumns.map((col) => (
                                        <button
                                            key={col}
                                            onClick={() => toggleColumn(col)}
                                            className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-300 hover:bg-[#1a2d4a] flex items-center gap-2"
                                        >
                                            <span className={`w-4 h-4 rounded border flex items-center justify-center text-xs ${visibleColumns.includes(col)
                                                    ? "bg-[#f97316] border-[#f97316] text-white"
                                                    : "border-gray-500"
                                                }`}>
                                                {visibleColumns.includes(col) ? "✓" : ""}
                                            </span>
                                            {col}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-[#f97316] border-b-2 border-[#f97316]">
                                    {visibleColumns.includes("Date") && <th className="p-4 font-bold border-r border-[#1a2d4a]">DATE</th>}
                                    {visibleColumns.includes("Time") && <th className="p-4 font-bold border-r border-[#1a2d4a]">TIME</th>}
                                    {visibleColumns.includes("Duration") && <th className="p-4 font-bold border-r border-[#1a2d4a]">DURATION</th>}
                                    {visibleColumns.includes("Inquiry") && <th className="p-4 font-bold border-r border-[#1a2d4a]">INQUIRY</th>}
                                    {visibleColumns.includes("Summary") && <th className="p-4 font-bold border-r border-[#1a2d4a]">SUMMARY</th>}
                                    {visibleColumns.includes("Status") && <th className="p-4 font-bold">STATUS</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#1a2d4a]">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={visibleColumns.length} className="p-8 text-center text-gray-500 font-bold">
                                            No calls in this date range
                                        </td>
                                    </tr>
                                ) : (
                                    displayData.map((row) => (
                                        <tr key={row.id} className="hover:bg-[#1a2d4a] text-gray-300">
                                            {visibleColumns.includes("Date") && (
                                                <td className="p-4 border-r border-[#1a2d4a] whitespace-nowrap">{row.date}</td>
                                            )}
                                            {visibleColumns.includes("Time") && (
                                                <td className="p-4 border-r border-[#1a2d4a] whitespace-nowrap">{row.time}</td>
                                            )}
                                            {visibleColumns.includes("Duration") && (
                                                <td className="p-4 border-r border-[#1a2d4a] whitespace-nowrap">{formatDuration(row.durationSec)}</td>
                                            )}
                                            {visibleColumns.includes("Inquiry") && (
                                                <td className="p-4 border-r border-[#1a2d4a] whitespace-nowrap">{intentLabels[row.intent] || row.intent}</td>
                                            )}
                                            {visibleColumns.includes("Summary") && (
                                                <td className="p-4 border-r border-[#1a2d4a] text-sm">{row.summary}</td>
                                            )}
                                            {visibleColumns.includes("Status") && (
                                                <td className="p-4">
                                                    <span className={`font-bold text-sm ${getStatusStyle(row.outcome)}`}>
                                                        {getStatusLabel(row.outcome)}
                                                    </span>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {filtered.length > showCount && (
                        <div className="p-4 text-center border-t border-[#1a2d4a]">
                            <button
                                onClick={() => setShowCount(showCount + 10)}
                                className="bg-[#1a2d4a] hover:bg-[#f97316] text-white font-bold py-2 px-6 rounded-full transition-colors text-sm"
                            >
                                View More
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}