"use client";

import { useState } from "react";
import {
    PieChart,
    Pie,
    Tooltip,
    ResponsiveContainer,
    Cell,
    Legend,
} from "recharts";
import MetricCard from "./MetricCard";
import { callLogs } from "../data/callLogs";

export default function CallsTab() {
    const [startDate, setStartDate] = useState("2026-01-01");
    const [endDate, setEndDate] = useState("2026-01-31");

    const filtered = callLogs.filter(
        (c) => c.date >= startDate && c.date <= endDate
    );

    const total = filtered.length;
    const resolved = filtered.filter((c) => c.outcome === "resolved").length;
    const unresolved = total - resolved;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
    const avgDuration = total > 0 ? Math.round(filtered.reduce((s, c) => s + c.durationSec, 0) / total) : 0;
    const followups = filtered.filter((c) => c.followupNeeded).length;
    const avgConfidence = total > 0 ? Math.round(filtered.reduce((s, c) => s + c.confidence, 0) / total * 100) : 0;

    const intentCounts = {};
    filtered.forEach((c) => {
        const label = c.intent === "hours_location" ? "Hours / Location" : "Other";
        intentCounts[label] = (intentCounts[label] || 0) + 1;
    });
    const pieColors = ["#f97316", "#1a2d4a", "#9ca3af", "#f59e0b", "#0f1d32"];
    const intentData = Object.entries(intentCounts).map(([name, value], i) => ({
        name,
        value,
        fill: pieColors[i % pieColors.length],
    }));

    return (
        <>
            <h1 className="text-3xl font-bold mb-6 text-white">Calls and Customers</h1>

            <div className="bg-[#0f1d32] rounded-[2rem] p-8 shadow-inner border border-[#1a2d4a]">

                <div className="flex items-center justify-center gap-6 mb-10 flex-wrap">
                    <div className="flex items-center gap-2 bg-[#1a2d4a] rounded-xl px-4 py-2">
                        <span className="font-bold text-sm text-[#f97316]">Start Date:</span>
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-[#0f1d32] border border-[#1a2d4a] rounded-lg px-3 py-1 text-sm font-bold text-white" />
                    </div>
                    <div className="flex items-center gap-2 bg-[#1a2d4a] rounded-xl px-4 py-2">
                        <span className="font-bold text-sm text-[#f97316]">End Date:</span>
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-[#0f1d32] border border-[#1a2d4a] rounded-lg px-3 py-1 text-sm font-bold text-white" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    <MetricCard title="Calls Handled" value={total} />
                    <MetricCard title="Answer Rate" value={total === 0 ? "—" : `${resolutionRate}%`} />
                    <MetricCard title="Average Call Duration" value={total === 0 ? "—" : `${avgDuration}s`} />
                    <MetricCard title="Resolution Rate" value={total === 0 ? "—" : `${resolutionRate}%`} />
                    <MetricCard title="Escalation Rate" value={total === 0 ? "—" : `${Math.round((unresolved / total) * 100)}%`} />
                    <MetricCard title="Abandoned Rate" value={total === 0 ? "—" : `${Math.round((followups / total) * 100)}%`} />
                </div>

                <div className="bg-[#1a2d4a]/50 rounded-3xl p-6 mb-12">
                    <h3 className="text-xl font-bold text-center underline decoration-[#f97316] decoration-2 underline-offset-4 mb-6 text-white">
                        Call Reasons
                    </h3>
                    <div className="h-80 w-full">
                        {intentData.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-gray-500 font-bold">
                                No calls in this date range
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={intentData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={110}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        strokeWidth={2}
                                        stroke="#0a1628"
                                    >
                                        {intentData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: "#0f1d32", border: "1px solid #1a2d4a", color: "#fff" }} />
                                    <Legend wrapperStyle={{ color: "#9ca3af" }} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                <div className="bg-[#1a2d4a]/50 rounded-3xl overflow-hidden">
                    <div className="p-4 border-b border-[#1a2d4a]">
                        <h3 className="text-xl font-bold text-center underline decoration-[#f97316] decoration-2 underline-offset-4 text-white">
                            Call Details
                        </h3>
                    </div>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-[#f97316] border-b-2 border-[#f97316]">
                                <th className="p-4 font-bold border-r border-[#1a2d4a]">Date</th>
                                <th className="p-4 font-bold border-r border-[#1a2d4a]">Duration</th>
                                <th className="p-4 font-bold border-r border-[#1a2d4a]">Reason</th>
                                <th className="p-4 font-bold border-r border-[#1a2d4a]">Summary</th>
                                <th className="p-4 font-bold border-r border-[#1a2d4a]">Confidence</th>
                                <th className="p-4 font-bold">Outcome</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1a2d4a]">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500 font-bold">
                                        No calls in this date range
                                    </td>
                                </tr>
                            ) : (
                                [...filtered].reverse().map((row) => (
                                    <tr key={row.id} className="hover:bg-[#1a2d4a] text-gray-300">
                                        <td className="p-4 border-r border-[#1a2d4a] whitespace-nowrap">{row.date}</td>
                                        <td className="p-4 border-r border-[#1a2d4a] whitespace-nowrap">{row.durationSec}s</td>
                                        <td className="p-4 border-r border-[#1a2d4a] whitespace-nowrap">{row.intent.replace("_", " / ")}</td>
                                        <td className="p-4 border-r border-[#1a2d4a] text-sm">{row.summary}</td>
                                        <td className="p-4 border-r border-[#1a2d4a] whitespace-nowrap">{Math.round(row.confidence * 100)}%</td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${row.outcome === "resolved"
                                                    ? "bg-green-900/50 text-green-400"
                                                    : "bg-red-900/50 text-red-400"
                                                }`}>
                                                {row.outcome}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}