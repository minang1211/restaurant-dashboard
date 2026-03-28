"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import MetricCard from "./MetricCard";
import { callLogs } from "../data/callLogs";

const intentLabels = {
    takeout_order: "Phone Orders",
    hours_location: "Other",
    reservation: "Reservations",
    catering_inquiry: "Catering",
    spam_call: "Spam",
};

const durationRanges = [
    { label: "0-30s", min: 0, max: 30 },
    { label: "30s-1m", min: 30, max: 60 },
    { label: "1m-1m30s", min: 60, max: 90 },
    { label: "1m30s-2m", min: 90, max: 120 },
    { label: "2m+", min: 120, max: Infinity },
];

const timeOfDay = [
    { label: "Morning", min: 0, max: 12 },
    { label: "Afternoon", min: 12, max: 17 },
    { label: "Evening", min: 17, max: 24 },
];

function toMMDDYYYY(dateStr) {
    const [y, m, d] = dateStr.split("-");
    return `${m}/${d}/${y}`;
}

function formatDuration(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.round(sec % 60);
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function getStatusLabel(outcome) {
    if (outcome === "resolved") return "Resolved";
    if (outcome === "transferred") return "Follow-up";
    return "Unresolved";
}

function getStatusStyle(outcome) {
    if (outcome === "resolved") return "text-green-400";
    if (outcome === "transferred") return "text-yellow-400";
    return "text-red-400";
}

function ColumnFilter({ label, options, selected, onToggle, onToggleAll }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const allSelected = options.length > 0 && options.every((o) => selected.includes(o.value));

    return (
        <th className="p-4 font-bold border-r border-[#1a2d4a] relative" ref={ref}>
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-1 text-[#f97316] hover:text-white transition-colors"
            >
                {label}
                <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
                <div className="absolute left-0 top-full mt-1 w-48 bg-[#0f1d32] border border-[#1a2d4a] rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                    <button
                        onClick={onToggleAll}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-gray-300 hover:bg-[#1a2d4a] border-b border-[#1a2d4a] flex items-center gap-2"
                    >
                        <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[10px] ${allSelected ? "bg-[#f97316] border-[#f97316] text-white" : "border-gray-500"
                            }`}>
                            {allSelected ? "✓" : ""}
                        </span>
                        {allSelected ? "Deselect All" : "Select All"}
                    </button>
                    {options.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => onToggle(opt.value)}
                            className="w-full text-left px-3 py-2 text-xs font-bold text-gray-300 hover:bg-[#1a2d4a] flex items-center gap-2"
                        >
                            <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[10px] ${selected.includes(opt.value)
                                    ? "bg-[#f97316] border-[#f97316] text-white"
                                    : "border-gray-500"
                                }`}>
                                {selected.includes(opt.value) ? "✓" : ""}
                            </span>
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </th>
    );
}

export default function CallsTab() {
    const allDates = [...new Set(callLogs.map((c) => c.date))].sort().reverse();
    const [startDate, setStartDate] = useState(allDates[allDates.length - 1] || "");
    const [endDate, setEndDate] = useState(allDates[0] || "");
    const [showCount, setShowCount] = useState(10);

    const allIntentValues = [...new Set(callLogs.map((c) => c.intent))];
    const allOutcomeValues = [...new Set(callLogs.map((c) => c.outcome))];
    const allDurationValues = durationRanges.map((r) => r.label);
    const allTimeValues = timeOfDay.map((t) => t.label);

    const [selectedDates, setSelectedDates] = useState(allDates);
    const [selectedTimes, setSelectedTimes] = useState(allTimeValues);
    const [selectedDurations, setSelectedDurations] = useState(allDurationValues);
    const [selectedInquiries, setSelectedInquiries] = useState(allIntentValues);
    const [selectedStatuses, setSelectedStatuses] = useState(allOutcomeValues);

    function toggleItem(list, setList, value) {
        if (list.includes(value)) {
            setList(list.filter((v) => v !== value));
        } else {
            setList([...list, value]);
        }
    }

    function toggleAll(list, setList, allItems) {
        if (list.length === allItems.length) {
            setList([]);
        } else {
            setList([...allItems]);
        }
    }

    const dateFiltered = callLogs.filter(
        (c) => c.date >= startDate && c.date <= endDate
    );

    const filtered = dateFiltered.filter((c) => {
        if (!selectedDates.includes(c.date)) return false;

        const hour = parseInt(c.time.split(":")[0], 10);
        const timeMatch = selectedTimes.some((t) => {
            const range = timeOfDay.find((td) => td.label === t);
            return range && hour >= range.min && hour < range.max;
        });
        if (!timeMatch) return false;

        const durMatch = selectedDurations.some((d) => {
            const range = durationRanges.find((dr) => dr.label === d);
            return range && c.durationSec >= range.min && c.durationSec < range.max;
        });
        if (!durMatch) return false;

        if (!selectedInquiries.includes(c.intent)) return false;
        if (!selectedStatuses.includes(c.outcome)) return false;

        return true;
    });

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

    const dateOptions = allDates.map((d) => ({ value: d, label: toMMDDYYYY(d) }));
    const timeOptions = timeOfDay.map((t) => ({ value: t.label, label: t.label }));
    const durationOptions = durationRanges.map((r) => ({ value: r.label, label: r.label }));
    const inquiryOptions = allIntentValues.map((i) => ({ value: i, label: intentLabels[i] || i }));
    const statusOptions = allOutcomeValues.map((o) => ({ value: o, label: getStatusLabel(o) }));

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

                <div className="bg-[#1a2d4a]/50 rounded-3xl overflow-visible">
                    <div className="p-4 border-b border-[#1a2d4a]">
                        <h3 className="text-lg font-bold text-white">Call History</h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b-2 border-[#f97316]">
                                    <ColumnFilter
                                        label="DATE"
                                        options={dateOptions}
                                        selected={selectedDates}
                                        onToggle={(val) => toggleItem(selectedDates, setSelectedDates, val)}
                                        onToggleAll={() => toggleAll(selectedDates, setSelectedDates, allDates)}
                                    />
                                    <ColumnFilter
                                        label="TIME"
                                        options={timeOptions}
                                        selected={selectedTimes}
                                        onToggle={(val) => toggleItem(selectedTimes, setSelectedTimes, val)}
                                        onToggleAll={() => toggleAll(selectedTimes, setSelectedTimes, allTimeValues)}
                                    />
                                    <ColumnFilter
                                        label="DURATION"
                                        options={durationOptions}
                                        selected={selectedDurations}
                                        onToggle={(val) => toggleItem(selectedDurations, setSelectedDurations, val)}
                                        onToggleAll={() => toggleAll(selectedDurations, setSelectedDurations, allDurationValues)}
                                    />
                                    <ColumnFilter
                                        label="INQUIRY"
                                        options={inquiryOptions}
                                        selected={selectedInquiries}
                                        onToggle={(val) => toggleItem(selectedInquiries, setSelectedInquiries, val)}
                                        onToggleAll={() => toggleAll(selectedInquiries, setSelectedInquiries, allIntentValues)}
                                    />
                                    <th className="p-4 font-bold border-r border-[#1a2d4a] text-[#f97316]">SUMMARY</th>
                                    <ColumnFilter
                                        label="STATUS"
                                        options={statusOptions}
                                        selected={selectedStatuses}
                                        onToggle={(val) => toggleItem(selectedStatuses, setSelectedStatuses, val)}
                                        onToggleAll={() => toggleAll(selectedStatuses, setSelectedStatuses, allOutcomeValues)}
                                    />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#1a2d4a]">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-gray-500 font-bold">
                                            No calls match your filters
                                        </td>
                                    </tr>
                                ) : (
                                    displayData.map((row) => (
                                        <tr key={row.id} className="hover:bg-[#1a2d4a] text-gray-300">
                                            <td className="p-4 border-r border-[#1a2d4a] whitespace-nowrap">{toMMDDYYYY(row.date)}</td>
                                            <td className="p-4 border-r border-[#1a2d4a] whitespace-nowrap">{row.time}</td>
                                            <td className="p-4 border-r border-[#1a2d4a] whitespace-nowrap">{formatDuration(row.durationSec)}</td>
                                            <td className="p-4 border-r border-[#1a2d4a] whitespace-nowrap">{intentLabels[row.intent] || row.intent}</td>
                                            <td className="p-4 border-r border-[#1a2d4a] text-sm">{row.summary}</td>
                                            <td className="p-4">
                                                <span className={`font-bold text-sm ${getStatusStyle(row.outcome)}`}>
                                                    {getStatusLabel(row.outcome)}
                                                </span>
                                            </td>
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