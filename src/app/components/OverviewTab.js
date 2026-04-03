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
  PieChart,
  Pie,
  Legend,
} from "recharts";
import { ChevronDown, CheckCircle, AlertTriangle } from "lucide-react";
import MetricCard from "./MetricCard";
import { callLogs } from "../data/callLogs";

const intentLabels = {
  takeout_order: "Phone Order",
  hours_location: "Other",
  reservation: "Reservation",
  catering_inquiry: "Catering",
  spam_call: "Spam",
};

const pieColors = ["#FF5900", "#38bdf8", "#4ade80", "#facc15", "#f87171", "#a78bfa", "#fb923c", "#e879f9"];

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

function getFilteredLogs(filter, customStart, customEnd) {
  if (filter === "Custom" && customStart && customEnd) {
    return callLogs.filter((c) => c.date >= customStart && c.date <= customEnd);
  }

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
    case "Today": return callLogs.filter((c) => c.date === todayStr);
    case "Yesterday": return callLogs.filter((c) => c.date === yesterdayStr);
    case "This Week": return callLogs.filter((c) => c.date >= weekAgoStr);
    case "This Month": return callLogs.filter((c) => c.date >= monthStartStr);
    default: return callLogs;
  }
}

function generateSummary(data) {
  const total = data.length;
  if (total === 0) return [];

  const resolved = data.filter((c) => c.outcome === "resolved").length;
  const transferred = data.filter((c) => c.outcome === "transferred").length;
  const callbackNeeded = data.filter((c) => c.outcome === "callback_needed").length;
  const revenue = Math.round(data.reduce((s, c) => s + c.durationSec, 0) * 3.5);

  const intentCounts = {};
  data.forEach((c) => { intentCounts[c.intent] = (intentCounts[c.intent] || 0) + 1; });
  const topIntent = Object.entries(intentCounts).sort((a, b) => b[1] - a[1])[0];
  const topPercent = ((topIntent[1] / total) * 100).toFixed(1);
  const topLabel = intentLabels[topIntent[0]] || topIntent[0];

  const hourCounts = {};
  data.forEach((c) => {
    const h = parseInt(c.time.split(":")[0], 10);
    hourCounts[h] = (hourCounts[h] || 0) + 1;
  });
  const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
  const peakLabel = peakHour ? `${parseInt(peakHour[0]) > 12 ? parseInt(peakHour[0]) - 12 : peakHour[0]}${parseInt(peakHour[0]) >= 12 ? "pm" : "am"}` : "";

  const summary = [];
  summary.push({ type: "success", text: `${topPercent}% of incoming calls were regarding ${topLabel.toLowerCase()}s` });
  summary.push({ type: "success", text: `Your AI agent has brought in $${revenue.toLocaleString()} in revenue` });
  if (peakLabel) summary.push({ type: "success", text: `Caller peak time was at ${peakLabel}` });
  const escalations = transferred + callbackNeeded;
  if (escalations > 0) {
    summary.push({ type: "warning", text: `There ${escalations === 1 ? "was" : "were"} ${escalations} escalation${escalations > 1 ? "s" : ""} that required a call transfer to a manager` });
  }
  return summary;
}

function ColumnFilter({ label, options, selected, onToggle, onToggleAll }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const allSelected = options.length > 0 && options.every((o) => selected.includes(o.value));

  return (
    <th className="p-4 font-bold border-r border-[#1a2d4a] relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1 text-[#FF5900] hover:text-white transition-colors">
        {label}
        <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 w-48 bg-[#0A2342] border border-[#1a2d4a] rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          <button onClick={onToggleAll} className="w-full text-left px-3 py-2 text-xs font-bold text-gray-300 hover:bg-[#1a2d4a] border-b border-[#1a2d4a] flex items-center gap-2">
            <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[10px] ${allSelected ? "bg-[#FF5900] border-[#FF5900] text-white" : "border-gray-500"}`}>
              {allSelected ? "✓" : ""}
            </span>
            {allSelected ? "Deselect All" : "Select All"}
          </button>
          {options.map((opt) => (
            <button key={opt.value} onClick={() => onToggle(opt.value)} className="w-full text-left px-3 py-2 text-xs font-bold text-gray-300 hover:bg-[#1a2d4a] flex items-center gap-2">
              <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[10px] ${selected.includes(opt.value) ? "bg-[#FF5900] border-[#FF5900] text-white" : "border-gray-500"}`}>
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

function CustomPieTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0A2342] border border-[#FF5900] rounded-lg px-4 py-2 shadow-lg">
        <p className="text-white font-bold text-sm">{payload[0].name}</p>
        <p className="text-[#FF5900] font-bold">{payload[0].value} calls ({((payload[0].value / callLogs.length) * 100).toFixed(1)}%)</p>
      </div>
    );
  }
  return null;
}

export default function OverviewTab() {
  const [filter, setFilter] = useState("This Month");
  const [filterOpen, setFilterOpen] = useState(false);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [activeIndex, setActiveIndex] = useState(null);
  const [showCount, setShowCount] = useState(5);
  const filterRef = useRef(null);

  const filterOptions = ["Today", "Yesterday", "This Week", "This Month", "Custom"];

  useEffect(() => {
    function handleClickOutside(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = getFilteredLogs(filter, customStart, customEnd);
  const data = filtered.length > 0 ? filtered : callLogs;
  const showingAll = filtered.length === 0;
  const aiSummary = generateSummary(data);

  const total = data.length;
  const orderCalls = data.filter((c) => c.intent === "takeout_order").length;
  const reservationCalls = data.filter((c) => c.intent === "reservation").length;
  const totalSeconds = data.reduce((s, c) => s + c.durationSec, 0);
  const staffHoursSaved = Math.round(totalSeconds / 3600);
  const avgConfidence = total > 0 ? Math.round(data.reduce((s, c) => s + c.confidence, 0) / total * 100) : 0;
  const revenue = Math.round(totalSeconds * 3.5);

  const intentCounts = {};
  data.forEach((c) => {
    const label = intentLabels[c.intent] || c.intent;
    intentCounts[label] = (intentCounts[label] || 0) + 1;
  });
  const pieData = Object.entries(intentCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value], i) => ({ name, value, fill: pieColors[i] }));

  const hourCounts = {};
  data.forEach((c) => {
    const h = parseInt(c.time.split(":")[0], 10);
    let label;
    if (h < 12) label = `${h === 0 ? 12 : h} am`;
    else if (h === 12) label = "12 pm";
    else label = `${h - 12} pm`;
    hourCounts[label] = (hourCounts[label] || 0) + 1;
  });
  const hourOrder = ["9 am", "10 am", "11 am", "12 pm", "1 pm", "2 pm", "3 pm", "4 pm", "5 pm"];
  const callTimesData = hourOrder.map((h) => ({ hour: h, calls: hourCounts[h] || 0 }));

  const today = new Date();
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNum = today.getDate();
  const suffix = dayNum % 10 === 1 && dayNum !== 11 ? "st" : dayNum % 10 === 2 && dayNum !== 12 ? "nd" : dayNum % 10 === 3 && dayNum !== 13 ? "rd" : "th";
  const dateString = `${days[today.getDay()]}, ${months[today.getMonth()]} ${dayNum}${suffix}, ${today.getFullYear()}`;

  const allDates = [...new Set(data.map((c) => c.date))].sort().reverse();
  const allIntentValues = [...new Set(data.map((c) => c.intent))];
  const allOutcomeValues = [...new Set(data.map((c) => c.outcome))];
  const allDurationValues = durationRanges.map((r) => r.label);
  const allTimeValues = timeOfDay.map((t) => t.label);

  const [selectedDates, setSelectedDates] = useState(allDates);
  const [selectedTimes, setSelectedTimes] = useState(allTimeValues);
  const [selectedDurations, setSelectedDurations] = useState(allDurationValues);
  const [selectedInquiries, setSelectedInquiries] = useState(allIntentValues);
  const [selectedStatuses, setSelectedStatuses] = useState(allOutcomeValues);

  useEffect(() => {
    setSelectedDates([...new Set(data.map((c) => c.date))].sort().reverse());
    setSelectedInquiries([...new Set(data.map((c) => c.intent))]);
    setSelectedStatuses([...new Set(data.map((c) => c.outcome))]);
  }, [filter, customStart, customEnd]);

  function toggleItem(list, setList, value) {
    if (list.includes(value)) setList(list.filter((v) => v !== value));
    else setList([...list, value]);
  }

  function toggleAll(list, setList, allItems) {
    if (list.length === allItems.length) setList([]);
    else setList([...allItems]);
  }

  const tableData = data.filter((c) => {
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

  const displayData = [...tableData].reverse().slice(0, showCount);

  const dateOptions = allDates.map((d) => ({ value: d, label: toMMDDYYYY(d) }));
  const timeOptions = timeOfDay.map((t) => ({ value: t.label, label: t.label }));
  const durationOptions = durationRanges.map((r) => ({ value: r.label, label: r.label }));
  const inquiryOptions = allIntentValues.map((i) => ({ value: i, label: intentLabels[i] || i }));
  const statusOptions = allOutcomeValues.map((o) => ({ value: o, label: getStatusLabel(o) }));

  return (
    <>
      <div className="bg-[#0A2342] rounded-2xl p-4 mb-6 text-center border border-[#1a2d4a]">
        <h1 className="text-2xl font-bold text-white">Overview</h1>
        <p className="text-gray-400 text-sm">{dateString}</p>
      </div>

      <div className="bg-[#0A2342] rounded-2xl p-6 mb-6 border border-[#1a2d4a]">
        <h3 className="text-sm font-bold text-gray-400 mb-4 text-center">AI Summary</h3>
        <div className="space-y-3 max-w-3xl mx-auto">
          {aiSummary.map((item, i) => (
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

      <div className="bg-[#0A2342] rounded-[2rem] p-8 shadow-inner border border-[#1a2d4a]">

        <div className="flex justify-end mb-6">
          <div className="relative" ref={filterRef}>
            <button onClick={() => setFilterOpen(!filterOpen)} className="flex items-center gap-2 bg-[#1a2d4a] px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#243a5e] transition-colors">
              Filter: {filter}
              <ChevronDown size={14} className={`transition-transform ${filterOpen ? "rotate-180" : ""}`} />
            </button>
            {filterOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[#0A2342] border border-[#1a2d4a] rounded-lg shadow-lg z-50 overflow-hidden">
                {filterOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setFilter(option);
                      if (option !== "Custom") setFilterOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm font-bold transition-colors ${
                      filter === option ? "bg-[#FF5900] text-white" : "text-gray-300 hover:bg-[#1a2d4a] hover:text-[#FF5900]"
                    }`}
                  >
                    {option}
                  </button>
                ))}
                {filter === "Custom" && (
                  <div className="px-4 py-3 border-t border-[#1a2d4a] space-y-2">
                    <div>
                      <label className="text-xs text-gray-400 font-bold">From:</label>
                      <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="w-full bg-[#0a1628] border border-[#1a2d4a] rounded px-2 py-1 text-xs text-white mt-1" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 font-bold">To:</label>
                      <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="w-full bg-[#0a1628] border border-[#1a2d4a] rounded px-2 py-1 text-xs text-white mt-1" />
                    </div>
                    <button onClick={() => setFilterOpen(false)} className="w-full bg-[#FF5900] text-white text-xs font-bold py-1.5 rounded hover:bg-[#ea580c] transition-colors mt-1">
                      Apply
                    </button>
                  </div>
                )}
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
          <MetricCard title="Orders Placed" value={orderCalls} />
          <MetricCard title="Reservations Booked" value={reservationCalls} />
          <MetricCard title="Staff Hours Saved" value={staffHoursSaved} />
          <MetricCard title="AI Confidence Rate" value={`${avgConfidence}%`} />
          <MetricCard title="Influenced Revenue" value={`$${revenue.toLocaleString()}`} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          <div className="bg-[#1a2d4a]/50 rounded-3xl p-6">
            <h3 className="text-sm font-bold text-gray-300 mb-4">Top 5 Call Reasons</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={100}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                    strokeWidth={2}
                    stroke="#0a1628"
                    onMouseEnter={(_, index) => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={activeIndex === index ? "#FF5900" : entry.fill}
                        style={{ cursor: "pointer", transition: "all 0.2s" }}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#1a2d4a]/50 rounded-3xl p-6">
            <h3 className="text-sm font-bold text-gray-300 mb-4">Call Times</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={callTimesData}>
                  <XAxis dataKey="hour" tick={{ fill: "#9ca3af", fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fill: "#9ca3af" }} label={{ value: "# of Calls", angle: -90, position: "insideLeft", fill: "#9ca3af", style: { fontSize: 11 } }} />
                  <Tooltip contentStyle={{ backgroundColor: "#0A2342", border: "1px solid #1a2d4a", color: "#fff" }} />
                  <Bar dataKey="calls" radius={[4, 4, 0, 0]}>
                    {callTimesData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill="#FF5900" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-center text-gray-500 text-xs mt-1">Call Time</p>
          </div>
        </div>

        <div className="bg-[#1a2d4a]/50 rounded-3xl overflow-visible">
          <div className="p-4 border-b border-[#1a2d4a]">
            <h3 className="text-lg font-bold text-white">Recent Activity</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-[#FF5900]">
                  <ColumnFilter label="DATE" options={dateOptions} selected={selectedDates} onToggle={(v) => toggleItem(selectedDates, setSelectedDates, v)} onToggleAll={() => toggleAll(selectedDates, setSelectedDates, allDates)} />
                  <ColumnFilter label="TIME" options={timeOptions} selected={selectedTimes} onToggle={(v) => toggleItem(selectedTimes, setSelectedTimes, v)} onToggleAll={() => toggleAll(selectedTimes, setSelectedTimes, allTimeValues)} />
                  <ColumnFilter label="DURATION" options={durationOptions} selected={selectedDurations} onToggle={(v) => toggleItem(selectedDurations, setSelectedDurations, v)} onToggleAll={() => toggleAll(selectedDurations, setSelectedDurations, allDurationValues)} />
                  <ColumnFilter label="INQUIRY" options={inquiryOptions} selected={selectedInquiries} onToggle={(v) => toggleItem(selectedInquiries, setSelectedInquiries, v)} onToggleAll={() => toggleAll(selectedInquiries, setSelectedInquiries, allIntentValues)} />
                  <th className="p-4 font-bold border-r border-[#1a2d4a] text-[#FF5900]">SUMMARY</th>
                  <ColumnFilter label="STATUS" options={statusOptions} selected={selectedStatuses} onToggle={(v) => toggleItem(selectedStatuses, setSelectedStatuses, v)} onToggleAll={() => toggleAll(selectedStatuses, setSelectedStatuses, allOutcomeValues)} />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a2d4a]">
                {tableData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500 font-bold">No calls match your filters</td>
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
                        <span className={`font-bold text-sm ${getStatusStyle(row.outcome)}`}>{getStatusLabel(row.outcome)}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {tableData.length > showCount && (
            <div className="p-4 text-center border-t border-[#1a2d4a]">
              <button onClick={() => setShowCount(showCount + 5)} className="bg-[#1a2d4a] hover:bg-[#FF5900] text-white font-bold py-2 px-6 rounded-full transition-colors text-sm">
                View More
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
