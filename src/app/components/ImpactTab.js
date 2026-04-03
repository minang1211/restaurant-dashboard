"use client";

import { useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";
import MetricCard from "./MetricCard";
import { callLogs } from "../data/callLogs";

function toMMDDYYYY(dateStr) {
    const [y, m, d] = dateStr.split("-");
    return `${m}/${d}/${y}`;
}

export default function ImpactTab() {
    const allDates = [...new Set(callLogs.map((c) => c.date))].sort();
    const [startDate, setStartDate] = useState(allDates[0] || "");
    const [endDate, setEndDate] = useState(allDates[allDates.length - 1] || "");

    const filtered = callLogs.filter(
        (c) => c.date >= startDate && c.date <= endDate
    );

    const total = filtered.length;
    const totalSeconds = filtered.reduce((s, c) => s + c.durationSec, 0);
    const staffHoursSaved = Math.round(totalSeconds / 3600);
    const revenue = Math.round(totalSeconds * 3.5);

    const orderCalls = filtered.filter((c) => c.intent === "takeout_order").length;
    const reservationCalls = filtered.filter((c) => c.intent === "reservation").length;
    const uniqueCallers = new Set(filtered.map((c) => c.callerNumber).filter(Boolean)).size;

    const revenueByDate = {};
    filtered.forEach((c) => {
        const d = c.date;
        revenueByDate[d] = (revenueByDate[d] || 0) + Math.round(c.durationSec * 3.5);
    });
    const dailyRevenue = Object.entries(revenueByDate).sort().map(([date, amount]) => ({
        date: toMMDDYYYY(date),
        revenue: amount,
    }));

    const revenueByMonth = {};
    filtered.forEach((c) => {
        const month = c.date.slice(0, 7);
        revenueByMonth[month] = (revenueByMonth[month] || 0) + Math.round(c.durationSec * 3.5);
    });
    const monthNames = {
        "01": "January", "02": "February", "03": "March", "04": "April",
        "05": "May", "06": "June", "07": "July", "08": "August",
        "09": "September", "10": "October", "11": "November", "12": "December",
    };
    const monthlyRevenue = Object.entries(revenueByMonth).sort().map(([ym, amount]) => ({
        month: monthNames[ym.slice(5)] || ym,
        revenue: amount,
    }));

    const today = new Date();
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const dayNum = today.getDate();
    const suffix =
        dayNum % 10 === 1 && dayNum !== 11 ? "st" :
            dayNum % 10 === 2 && dayNum !== 12 ? "nd" :
                dayNum % 10 === 3 && dayNum !== 13 ? "rd" : "th";
    const dateString = `${days[today.getDay()]}, ${months[today.getMonth()]} ${dayNum}${suffix}, ${today.getFullYear()}`;

    function CustomTooltip({ active, payload, label }) {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#0A2342] border border-[#FF5900] rounded-lg px-4 py-2 shadow-lg">
                    <p className="text-gray-400 text-xs">{label}</p>
                    <p className="text-[#FF5900] font-bold text-lg">${payload[0].value.toLocaleString()}</p>
                </div>
            );
        }
        return null;
    }

    return (
        <>
            <div className="bg-[#0A2342] rounded-2xl p-4 mb-6 text-center border border-[#1a2d4a]">
                <h1 className="text-2xl font-bold text-white">Business Impact</h1>
                <p className="text-gray-400 text-sm">{dateString}</p>
            </div>

            <div className="bg-[#0A2342] rounded-[2rem] p-8 shadow-inner border border-[#1a2d4a]">

                <div className="flex items-center justify-center gap-4 mb-8 flex-wrap">
                    <div className="flex items-center gap-2 bg-[#1a2d4a] rounded-xl px-4 py-2">
                        <span className="font-bold text-sm text-[#FF5900]">Filter From:</span>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-[#0A2342] border border-[#1a2d4a] rounded-lg px-3 py-1 text-sm font-bold text-white"
                        />
                    </div>
                    <div className="flex items-center gap-2 bg-[#1a2d4a] rounded-xl px-4 py-2">
                        <span className="font-bold text-sm text-[#FF5900]">To:</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-[#0A2342] border border-[#1a2d4a] rounded-lg px-3 py-1 text-sm font-bold text-white"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    <MetricCard title="Influenced Revenue" value={`$${revenue.toLocaleString()}`} />
                    <MetricCard title="Orders Placed" value={orderCalls} />
                    <MetricCard title="Reservations Booked" value={reservationCalls} />
                    <MetricCard title="Staff Hours Saved" value={staffHoursSaved} />
                    <MetricCard title="New Customers" value={uniqueCallers} />
                    <MetricCard title="Total Calls Handled" value={total} />
                </div>

                <div className="bg-[#1a2d4a]/50 rounded-3xl p-6 mb-8">
                    <h3 className="text-lg font-bold text-gray-300 mb-6">
                        Influenced Revenue (Last 30 Days)
                    </h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={dailyRevenue}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4a" />
                                <XAxis
                                    dataKey="date"
                                    angle={-45}
                                    textAnchor="end"
                                    height={60}
                                    tick={{ fontSize: 10, fill: "#9ca3af" }}
                                    axisLine={{ stroke: "#1a2d4a" }}
                                />
                                <YAxis
                                    tickFormatter={(v) => `$${v}`}
                                    tick={{ fill: "#9ca3af" }}
                                    axisLine={{ stroke: "#1a2d4a" }}
                                    label={{ value: "Revenue", angle: -90, position: "insideLeft", fill: "#9ca3af", style: { fontSize: 12 } }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#FF5900"
                                    strokeWidth={2}
                                    dot={{ r: 5, fill: "#FF5900", stroke: "#FF5900" }}
                                    activeDot={{ r: 8, fill: "#FF5900", stroke: "#fff", strokeWidth: 2 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-center text-gray-500 text-xs mt-2">Date</p>
                </div>

                <div className="bg-[#1a2d4a]/50 rounded-3xl p-6">
                    <h3 className="text-lg font-bold text-gray-300 mb-6">
                        Influenced Revenue (Last 6 Months)
                    </h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={monthlyRevenue}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4a" />
                                <XAxis
                                    dataKey="month"
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                                    axisLine={{ stroke: "#1a2d4a" }}
                                />
                                <YAxis
                                    tickFormatter={(v) => `$${v.toLocaleString()}`}
                                    tick={{ fill: "#9ca3af" }}
                                    axisLine={{ stroke: "#1a2d4a" }}
                                    label={{ value: "Revenue", angle: -90, position: "insideLeft", fill: "#9ca3af", style: { fontSize: 12 } }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#FF5900"
                                    strokeWidth={2}
                                    dot={{ r: 6, fill: "#FF5900", stroke: "#FF5900" }}
                                    activeDot={{ r: 10, fill: "#FF5900", stroke: "#fff", strokeWidth: 2 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-center text-gray-500 text-xs mt-2">Month</p>
                </div>
            </div>
        </>
    );
}