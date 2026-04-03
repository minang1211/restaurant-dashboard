import { Info } from "lucide-react";

export default function MetricCard({ title, value }) {
    return (
        <div className="bg-[#0A2342] rounded-[2rem] p-6 shadow-sm flex flex-col items-center justify-center relative h-48 transition-transform hover:scale-105 duration-200 border border-[#1a2d4a]">
            <h3 className="text-[#FF5900] font-bold text-lg mb-4 border-b border-[#1a2d4a] pb-2 w-full text-center">
                {title}
            </h3>
            <p className="text-5xl font-black text-white text-center">{value}</p>
            <div className="absolute bottom-5 right-5 text-gray-500 hover:text-[#FF5900] cursor-pointer">
                <Info size={18} />
            </div>
        </div>
    );
}