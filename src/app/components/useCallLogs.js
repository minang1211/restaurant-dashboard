"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function useCallLogs() {
    const [callLogs, setCallLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCalls() {
            const { data, error } = await supabase
                .from("call_logs")
                .select("*")
                .order("ended_at", { ascending: false });

            if (error) {
                console.error("Error fetching call logs:", error);
                setLoading(false);
                return;
            }

            const formatted = data.map((row, i) => ({
                id: i,
                date: row.ended_at ? row.ended_at.slice(0, 10) : "",
                time: row.ended_at ? row.ended_at.slice(11, 16) : "",
                durationSec: row.duration_sec || 0,
                callerNumber: row.caller_number || null,
                summary: row.summary || "",
                intent: row.AI_intent || "",
                outcome: row.AI_outcome || "",
                hoursMentioned: row.hours_mentioned || false,
                addressMentioned: row.address_mentioned || false,
                followupNeeded: row.followup_needed || false,
                confidence: parseFloat(String(row.confidence).replace("%", "")) > 1
                    ? parseFloat(String(row.confidence).replace("%", "")) / 100
                    : parseFloat(String(row.confidence).replace("%", "")) || 0,
            }));

            setCallLogs(formatted);
            setLoading(false);
        }

        fetchCalls();

        const channel = supabase
            .channel("call_logs_changes")
            .on("postgres_changes", { event: "*", schema: "public", table: "call_logs" }, () => {
                fetchCalls();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return { callLogs, loading };
}
