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

export default function ImpactTab() {
    const totalCalls = callLogs.length;
    const resolved = callLogs.filter((c) => c.outcome === "resolved").length;
    const totalSeconds = callLogs.reduce((s, c) => s + c.durationSec, 0);
    const minutesSaved = Math.round(totalSeconds / 60);
    const avgConfidence = Math.round(callLogs.reduce((s, c) => s + c.confidence, 0) / totalCalls * 100);
    const followups = callLogs.filter((c) => c.followupNeeded).length;

    const costPerMinuteStaff = 0.5;
    const estimatedSavings = (totalSeconds / 60 * costPerMinuteStaff).toFixed(2);

    const callsByDate = {};
    callLogs.forEach((c) => {
        callsByDate[c.date] = (callsByDate[c.date] || 0) + 1;
    });
    const dailyData = Object.entries(callsByDate).map(([date, count]) => ({
        date: date.slice(5),
        calls: count,
    }));

    const intentCounts = {};
    callLogs.forEach((c) => {
        const labels = {
            takeout_order: "Takeout Order",
            hours_location: "Hours / Location",
            reservation: "Reservation",
            catering_inquiry: "Catering Inquiry",
            spam_call: "Spam Call",
        };
        const label = labels[c.intent] || "Other";
        intentCounts[label] = (intentCounts[label] || 0) + 1;
    });
    const intentData = Object.entries(intentCounts).map(([name, value]) => ({
        name,
        value,
    }));

    return (
        <>
            <h1 className="text-3xl font-bold mb-6 text-white">Business Impact</h1>

            <div className="bg-[#0f1d32] rounded-[2rem] p-8 shadow-inner border border-[#1a2d4a]">

                <p className="text-center text-gray-400 mb-8 text-sm">
                    Data from {callLogs[0].date} to {callLogs[callLogs.length - 1].date}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    <MetricCard title="Calls AI Handled" value={totalCalls} />
                    <MetricCard title="Successfully Resolved" value={resolved} />
                    <MetricCard title="Resolution Rate" value={`${Math.round((resolved / totalCalls) * 100)}%`} />
                    <MetricCard title="Staff Minutes Saved" value={minutesSaved} />
                    <MetricCard title="Estimated Savings" value={`$${estimatedSavings}`} />
                    <MetricCard title="Avg AI Confidence" value={`${avgConfidence}%`} />
                </div>

                <div className="bg-[#1a2d4a]/50 rounded-3xl p-6 mb-8">
                    <h3 className="text-xl font-bold text-center underline decoration-[#f97316] decoration-2 underline-offset-4 mb-6 text-white">
                        Calls Handled by AI Per Day
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dailyData}>
                                <XAxis dataKey="date" tick={{ fill: "#9ca3af" }} />
                                <YAxis allowDecimals={false} tick={{ fill: "#9ca3af" }} />
                                <Tooltip contentStyle={{ backgroundColor: "#0f1d32", border: "1px solid #1a2d4a", color: "#fff" }} />
                                <Bar dataKey="calls" radius={[4, 4, 0, 0]}>
                                    {dailyData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill="#f97316" />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-[#1a2d4a]/50 rounded-3xl p-6 mb-8">
                    <h3 className="text-xl font-bold text-center underline decoration-[#f97316] decoration-2 underline-offset-4 mb-6 text-white">
                        What Callers Asked About
                    </h3>
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={intentData} layout="vertical">
                                <XAxis type="number" allowDecimals={false} tick={{ fill: "#9ca3af" }} />
                                <YAxis dataKey="name" type="category" tick={{ fill: "#9ca3af" }} width={120} />
                                <Tooltip contentStyle={{ backgroundColor: "#0f1d32", border: "1px solid #1a2d4a", color: "#fff" }} />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} fill="#f97316" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-[#1a2d4a]/50 rounded-3xl p-8">
                    <h3 className="text-xl font-bold text-center underline decoration-[#f97316] decoration-2 underline-offset-4 mb-6 text-white">
                        Key Takeaways
                    </h3>
                    <div className="space-y-4 max-w-2xl mx-auto">
                        <div className="flex items-start gap-3">
                            <span className="text-[#f97316] font-bold text-lg">✓</span>
                            <p className="text-gray-300">AI resolved <span className="text-white font-bold">{resolved} out of {totalCalls}</span> calls without staff involvement</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-[#f97316] font-bold text-lg">✓</span>
                            <p className="text-gray-300">Saved approximately <span className="text-white font-bold">{minutesSaved} minutes</span> of staff phone time</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-[#f97316] font-bold text-lg">✓</span>
                            <p className="text-gray-300">Most callers asked about <span className="text-white font-bold">hours and location</span> — the AI handles this perfectly</p>
                        </div>
                        {followups > 0 && (
                            <div className="flex items-start gap-3">
                                <span className="text-yellow-500 font-bold text-lg">!</span>
                                <p className="text-gray-300"><span className="text-white font-bold">{followups} call(s)</span> needed follow-up — consider reviewing those</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}