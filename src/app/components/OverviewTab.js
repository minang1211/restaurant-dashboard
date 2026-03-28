"use client";

import { useState, useRef, useEffect } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import { ChevronDown, CheckCircle, AlertTriangle } from "lucide-react";
import MetricCard from "./MetricCard";
import { callLogs } from "../data/callLogs";

const intentLabels = {
    takeout_order: "Takeout Order",
    hours_location: "Hours / Location",
    reservation: "Reservation",
    catering_inquiry: "Catering Inquiry",
    spam_call: "Spam Call",
};

function getFilteredLogs(filter) {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().slice(0, 10);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthStartStr = monthStart.toISOString().slice(0, 10);

    switch (filter) {
        case "Today":
            return callLogs.filter((c) => c.date === todayStr);
        case "Yesterday":
            return callLogs.filter((c) => c.date === yesterdayStr);
        case "This Week":
            return callLogs.filter((c) => c.date >= weekAgoStr);
        case "This Month":
            return callLogs.filter((c) => c.date >= monthStartStr);
        default:
            return callLogs;
    }
}

function generateSummary(filtered) {
    const total = filtered.length;
    if (total === 0) return [];

    const resolved = filtered.filter((c) => c.outcome === "resolved").length;
    const transferred = filtered.filter((c) => c.outcome === "transferred").length;
    const callbackNeeded = filtered.filter((c) => c.outcome === "callback_needed").length;

    const intentCounts = {};
    filtered.forEach((c) => {
        intentCounts[c.intent] = (intentCounts[c.intent] || 0) + 1;
    });
    const topIntent = Object.entries(intentCounts).sort((a, b) => b[1] - a[1])[0];
    const topPercent = ((topIntent[1] / total) * 100).toFixed(1);
    const topLabel = intentLabels[topIntent[0]] || topIntent[0];

    const totalMinutes = Math.round(filtered.reduce((s, c) => s + c.durationSec, 0) / 60);

    const summary = [];

    summary.push({
        type: "success",
        text: `${topPercent}% of incoming calls were regarding ${topLabel.toLowerCase()}`,
    });

    summary.push({
        type: "success",
        text: `AI handled ${total} calls, saving approximately ${totalMinutes} minutes of staff time`,
    });

    summary.push({
        type: "success",
        text: `Resolution rate: ${Math.round((resolved / total) * 100)}% of calls resolved without staff`,
    });

    if (transferred > 0 || callbackNeeded > 0) {
        const escalations = transferred + callbackNeeded;
        summary.push({
            type: "warning",
            text: `${escalations} call${escalations > 1 ? "s" : ""} required escalation (${transferred} transferred, ${callbackNeeded} callback needed)`,
        });
    }

    return summary;
}

export default function OverviewTab() {
    const [filter, setFilter] = useState("This Month");
    const [filterOpen, setFilterOpen] = useState(false);
    const filterRef = useRef(null);

    const filterOptions = ["Today", "Yesterday", "This Week", "This Month"];

    useEffect(() => {
        function handleClickOutside(e) {
            if (filterRef.current && !filterRef.current.contains(e.target)) {
                setFilterOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filtered = getFilteredLogs(filter);
    const aiSummary = generateSummary(filtered.length > 0 ? filtered : callLogs);
    const data = filtered.length > 0 ? filtered : callLogs;
    const showingAll = filtered.length === 0;

    const total = data.length;
    const resolved = data.filter((c) => c.outcome === "resolved").length;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
    const avgDuration = total > 0 ? Math.round(data.reduce((s, c) => s + c.durationSec, 0) / total) : 0;
    const avgConfidence = total > 0 ? Math.round(data.reduce((s, c) => s + c.confidence, 0) / total * 100) : 0;
    const staffMinutesSaved = Math.round(data.reduce((s, c) => s + c.durationSec, 0) / 60);
    const revenue = Math.round(data.reduce((s, c) => s + c.durationSec, 0) * 3.5);

    const today = new Date();
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const dayNum = today.getDate();
    const suffix =
        dayNum % 10 === 1 && dayNum !== 11 ? "st" :
            dayNum % 10 === 2 && dayNum !== 12 ? "nd" :
                dayNum % 10 === 3 && dayNum !== 13 ? "rd" : "th";
    const dateString = `${days[today.getDay()]}, ${months[today.getMonth()]} ${dayNum}${suffix}, ${today.getFullYear()}`;

    const callsByDate = {};
    data.forEach((c) => {
        callsByDate[c.date] = (callsByDate[c.date] || 0) + 1;
    });
    const callTimeline = Object.entries(callsByDate).map(([date, count]) => ({
        date: date.slice(5),
        calls: count,
    }));

    return (
        <>
            <div className="bg-[#0f1d32] rounded-2xl p-4 mb-6 text-center border border-[#1a2d4a]">
                <h1 className="text-2xl font-bold text-white">Overview</h1>
                <p className="text-gray-400 text-sm">{dateString}</p>
            </div>

            <div className="bg-[#0f1d32] rounded-2xl p-6 mb-6 border border-[#1a2d4a]">
                <h3 className="text-sm font-bold text-gray-400 mb-4 text-center">AI Summary</h3>
                <div className="space-y-3 max-w-3xl mx-auto">
                    {(showingAll ? generateSummary(callLogs) : aiSummary).map((item, i) => (
                        <div key={i} className="flex items-start gap-3">
                            {item.type === "success" ? (
                                <CheckCircle size={18} className="text-green-400 mt-0.5 shrink-0" />
                            ) : (
                                <AlertTriangle size={18} className="text-red-400 mt-0.5 shrink-0" />
                            )}
                            <p className="text-gray-300 text-sm">{item.text}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-[#0f1d32] rounded-[2rem] p-8 shadow-inner border border-[#1a2d4a]">

                <div className="flex justify-end mb-6">
                    <div className="relative" ref={filterRef}>
                        <button
                            onClick={() => setFilterOpen(!filterOpen)}
                            className="flex items-center gap-2 bg-[#1a2d4a] px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#243a5e] transition-colors"
                        >
                            Filter: {filter}
                            <ChevronDown size={14} className={`transition-transform ${filterOpen ? "rotate-180" : ""}`} />
                        </button>

                        {filterOpen && (
                            <div className="absolute right-0 mt-2 w-40 bg-[#0f1d32] border border-[#1a2d4a] rounded-lg shadow-lg z-50 overflow-hidden">
                                {filterOptions.map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => {
                                            setFilter(option);
                                            setFilterOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-2.5 text-sm font-bold transition-colors ${filter === option
                                                ? "bg-[#f97316] text-white"
                                                : "text-gray-300 hover:bg-[#1a2d4a] hover:text-[#f97316]"
                                            }`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {showingAll && (
                    <p className="text-center text-gray-500 text-sm mb-6">
                        No calls found for &quot;{filter}&quot; — showing all {callLogs.length} calls
                    </p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    <MetricCard title="Calls Handled" value={total} />
                    <MetricCard title="Call Duration" value={`${avgDuration} seconds`} />
                    <MetricCard title="Staff Minutes Saved" value={staffMinutesSaved} />
                    <MetricCard title="Resolution Rate" value={`${resolutionRate}%`} />
                    <MetricCard title="Revenue" value={`$${revenue}`} />
                    <MetricCard title="AI Confidence" value={`${avgConfidence}%`} />
                </div>

                <div className="bg-[#1a2d4a]/50 rounded-3xl p-6 mb-12">
                    <h3 className="text-xl font-bold text-center underline decoration-[#f97316] decoration-2 underline-offset-4 mb-6 text-white">
                        Calls by Date
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={callTimeline}>
                                <XAxis dataKey="date" tick={{ fill: "#9ca3af" }} />
                                <YAxis allowDecimals={false} tick={{ fill: "#9ca3af" }} />
                                <Tooltip contentStyle={{ backgroundColor: "#0f1d32", border: "1px solid #1a2d4a", color: "#fff" }} />
                                <Bar dataKey="calls" radius={[4, 4, 0, 0]}>
                                    {callTimeline.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill="#f97316" />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-[#1a2d4a]/50 rounded-3xl overflow-hidden">
                    <div className="p-4 border-b border-[#1a2d4a]">
                        <h3 className="text-xl font-bold text-center underline decoration-[#f97316] decoration-2 underline-offset-4 text-white">
                            Recent Activity
                        </h3>
                    </div>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-[#f97316] border-b-2 border-[#f97316]">
                                <th className="p-4 font-bold border-r border-[#1a2d4a]">Date</th>
                                <th className="p-4 font-bold border-r border-[#1a2d4a]">Time</th>
                                <th className="p-4 font-bold border-r border-[#1a2d4a]">Duration</th>
                                <th className="p-4 font-bold border-r border-[#1a2d4a]">Inquiry</th>
                                <th className="p-4 font-bold border-r border-[#1a2d4a]">Summary</th>
                                <th className="p-4 font-bold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1a2d4a]">
                            {[...data].reverse().slice(0, 10).map((row) => (
                                <tr key={row.id} className="hover:bg-[#1a2d4a] text-gray-300">
                                    <td className="p-4 border-r border-[#1a2d4a] whitespace-nowrap">{row.date}</td>
                                    <td className="p-4 border-r border-[#1a2d4a] whitespace-nowrap">{row.time}</td>
                                    <td className="p-4 border-r border-[#1a2d4a] whitespace-nowrap">
                                        {row.durationSec >= 60
                                            ? `${Math.floor(row.durationSec / 60)}m ${Math.round(row.durationSec % 60)}s`
                                            : `${Math.round(row.durationSec)}s`
                                        }
                                    </td>
                                    <td className="p-4 border-r border-[#1a2d4a] whitespace-nowrap">{intentLabels[row.intent] || row.intent}</td>
                                    <td className="p-4 border-r border-[#1a2d4a] text-sm">{row.summary}</td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${row.outcome === "resolved"
                                                ? "bg-green-900/50 text-green-400"
                                                : row.outcome === "transferred"
                                                    ? "bg-yellow-900/50 text-yellow-400"
                                                    : "bg-red-900/50 text-red-400"
                                            }`}>
                                            {row.outcome === "resolved" ? "Resolved" :
                                                row.outcome === "transferred" ? "Transferred" :
                                                    "Callback"}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="p-4 text-center border-t border-[#1a2d4a]">
                        <button className="bg-[#1a2d4a] hover:bg-[#f97316] text-white font-bold py-2 px-6 rounded-full transition-colors text-sm">
                            View More
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}