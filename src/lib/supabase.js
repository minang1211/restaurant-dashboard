import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://rtauoipdrcrkjkeoimod.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0YXVvaXBkcmNya2prZW9pbW9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyOTgzOTMsImV4cCI6MjA5MDg3NDM5M30.SzjtKf-uVyhATQ5-IaVuxfUgMBLS6TJ_EGT31BJwNY8";

export const supabase = createClient(supabaseUrl, supabaseKey);