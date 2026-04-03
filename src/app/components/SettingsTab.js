import { Settings } from "lucide-react";

export default function SettingsTab() {
    return (
        <>
            <h1 className="text-3xl font-bold mb-6 text-white">Settings</h1>
            <div className="bg-[#0A2342] rounded-[2rem] p-8 shadow-inner border border-[#1a2d4a]">
                <div className="bg-[#1a2d4a]/50 rounded-3xl p-12 text-center border border-[#1a2d4a]">
                    <Settings size={48} className="mx-auto mb-4 text-[#FF5900]" />
                    <h3 className="text-xl font-bold text-white mb-2">Settings Coming Soon</h3>
                    <p className="text-gray-400">Account preferences, notification settings, and more will appear here.</p>
                </div>
            </div>
        </>
    );
}