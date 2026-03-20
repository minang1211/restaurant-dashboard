"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import MetricCard from "./MetricCard";
import { callLogs } from "../data/callLogs";

export default function OverviewTab() {
    const today = new Date();
    const month = new Intl.DateTimeFormat("en-US", { month: "long" }).format(today);
    const day = today.getDate();
    const year = today.getFullYear();
    const suffix =
        day % 10 === 1 && day !== 11 ? "st" :
            day % 10 === 2 && day !== 12 ? "nd" :
                day % 10 === 3 && day !== 13 ? "rd" : "th";
    const dateString = `Today is ${month} ${day}${suffix}, ${year}`;

    const totalCalls = callLogs.length;
    const resolved = callLogs.filter((c) => c.outcome === "resolved").length;
    const answerRate = Math.round((resolved / totalCalls) * 100);
    const avgDuration = Math.round(callLogs.reduce((sum, c) => sum + c.durationSec, 0) / totalCalls);
    const avgConfidence = Math.round(callLogs.reduce((sum, c) => sum + c.confidence, 0) / totalCalls * 100);
    const followups = callLogs.filter((c) => c.followupNeeded).length;
    const staffMinutesSaved = Math.round(callLogs.reduce((sum, c) => sum + c.durationSec, 0) / 60);
    const revenue = Math.round(callLogs.reduce((s, c) => s + c.durationSec, 0) * 3.5);

    const callsByDate = {};
    callLogs.forEach((c) => {
        callsByDate[c.date] = (callsByDate[c.date] || 0) + 1;
    });
    const callTimeline = Object.entries(callsByDate).map(([date, count]) => ({
        date: date.slice(5),
        calls: count,
    }));

    return (
        <>
            <h1 className="text-3xl font-bold mb-6 text-white">Overview</h1>

            <div className="bg-[#0f1d32] rounded-[2rem] p-8 shadow-inner border border-[#1a2d4a]">
                <h2 className="text-center text-3xl font-bold mb-10 text-[#f97316]">
                    {dateString}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    <MetricCard title="Calls Handled" value={totalCalls} />
                    <MetricCard title="Call Duration" value={`${avgDuration} seconds`} />
                    <MetricCard title="Staff Minutes Saved" value={staffMinutesSaved} />
                    <MetricCard title="Resolution Rate" value={`${answerRate}%`} />
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
                            Latest Incoming Calls
                        </h3>
                    </div>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-[#f97316] border-b-2 border-[#f97316]">
                                <th className="p-4 font-bold border-r border-[#1a2d4a]">Date</th>
                                <th className="p-4 font-bold border-r border-[#1a2d4a]">Duration</th>
                                <th className="p-4 font-bold border-r border-[#1a2d4a]">Reason</th>
                                <th className="p-4 font-bold border-r border-[#1a2d4a]">Summary</th>
                                <th className="p-4 font-bold">Outcome</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1a2d4a]">
                            {[...callLogs].reverse().map((row) => (
                                <tr key={row.id} className="hover:bg-[#1a2d4a] text-gray-300">
                                    <td className="p-4 border-r border-[#1a2d4a] whitespace-nowrap">{row.date}</td>
                                    <td className="p-4 border-r border-[#1a2d4a] whitespace-nowrap">{row.durationSec}s</td>
                                    <td className="p-4 border-r border-[#1a2d4a] whitespace-nowrap">{row.intent.replace("_", " / ")}</td>
                                    <td className="p-4 border-r border-[#1a2d4a] text-sm">{row.summary}</td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${row.outcome === "resolved"
                                                ? "bg-green-900/50 text-green-400"
                                                : "bg-red-900/50 text-red-400"
                                            }`}>
                                            {row.outcome}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}