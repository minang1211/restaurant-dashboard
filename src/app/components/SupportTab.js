"use client";

import { Ticket, Mail, Phone } from "lucide-react";

export default function SupportTab() {
    return (
        <>
            <div className="bg-[#0A2342] rounded-2xl p-4 mb-6 text-center border border-[#1a2d4a]">
                <h1 className="text-2xl font-bold text-white">How Can We Assist You?</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                <div className="bg-white rounded-2xl p-8 text-center flex flex-col items-center">
                    <Ticket size={32} className="text-[#0A2342] mb-4" />
                    <h3 className="text-xl font-bold text-[#0A2342] mb-3">Submit a Ticket</h3>
                    <p className="text-gray-500 text-sm mb-6">
                        For non-urgent issues, please submit a ticket to our support team, we are happy to assist you.
                    </p>
                    <button className="bg-[#0A2342] text-white font-bold text-sm px-6 py-2.5 rounded-full hover:bg-[#FF5900] transition-colors mt-auto">
                        Ticket Support Coming Soon!
                    </button>
                </div>

                <div className="bg-white rounded-2xl p-8 text-center flex flex-col items-center">
                    <Mail size={32} className="text-[#0A2342] mb-4" />
                    <h3 className="text-xl font-bold text-[#0A2342] mb-3">Email Us</h3>
                    <p className="text-gray-500 text-sm mb-6">
                        For non-urgent issues, send us an email with your restaurant name and details of the issue.
                    </p>
                    <a
                        href="mailto:apollooneco@gmail.com"
                        className="bg-[#0A2342] text-white font-bold text-sm px-6 py-2.5 rounded-full hover:bg-[#FF5900] transition-colors mt-auto"
                    >
                        Email Us at: apollooneco@gmail.com
                    </a>
                </div>

                <div className="bg-white rounded-2xl p-8 text-center flex flex-col items-center">
                    <Phone size={32} className="text-[#0A2342] mb-4" />
                    <h3 className="text-xl font-bold text-[#0A2342] mb-3">Call Us (Urgent Only)</h3>
                    <p className="text-gray-500 text-sm mb-6">
                        For urgent issues such as an outage, please give us a call.
                        <br />For non-urgent issues, please send an email or submit a ticket.
                    </p>
                    <a
                        href="tel:2087158432"
                        className="bg-[#0A2342] text-white font-bold text-sm px-6 py-2.5 rounded-full hover:bg-[#FF5900] transition-colors mt-auto"
                    >
                        Call Us at: (208) 715-8432
                    </a>
                </div>

            </div>
        </>
    );
}