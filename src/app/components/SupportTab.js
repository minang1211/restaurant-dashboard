"use client";

import { useState } from "react";

export default function SupportTab() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [contactMethod, setContactMethod] = useState("");
    const [issueType, setIssueType] = useState("");
    const [description, setDescription] = useState("");
    const [contactDetail, setContactDetail] = useState("");

    const handleSubmit = () => {
        alert(
            `Support request submitted!\n\nName: ${firstName} ${lastName}\nContact: ${contactMethod} - ${contactDetail}\nIssue: ${issueType}\nDescription: ${description}`
        );
    };

    return (
        <>
            <h1 className="text-3xl font-bold mb-6 text-white">Customer Support</h1>

            <div className="bg-[#0f1d32] rounded-[2rem] p-8 shadow-inner border border-[#1a2d4a]">

                <div className="bg-[#1a2d4a]/50 rounded-3xl p-8 mb-8 max-w-2xl mx-auto border border-[#1a2d4a]">
                    <h3 className="text-2xl font-bold text-center underline decoration-[#f97316] decoration-2 underline-offset-4 mb-2 text-white">
                        Contact Us
                    </h3>
                    <p className="text-center text-gray-400 text-sm mb-8">
                        Please fill out the form for concerns or questions regarding AI agent or dashboard.
                        <br />We&apos;ll respond within 24 hours.
                    </p>

                    <div className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-[#f97316] mb-1">First Name:</label>
                                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full bg-[#0f1d32] border border-[#1a2d4a] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500" placeholder="Enter first name" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-[#f97316] mb-1">Last Name:</label>
                                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full bg-[#0f1d32] border border-[#1a2d4a] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500" placeholder="Enter last name" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-[#f97316] mb-1">Preferred Contact Method:</label>
                                <select value={contactMethod} onChange={(e) => { setContactMethod(e.target.value); setContactDetail(""); }} className="w-full bg-[#0f1d32] border border-[#1a2d4a] rounded-lg px-3 py-2 text-sm text-white">
                                    <option value="">Select...</option>
                                    <option value="phone">Phone Number</option>
                                    <option value="email">Email</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-[#f97316] mb-1">What is your issue regarding?</label>
                                <select value={issueType} onChange={(e) => setIssueType(e.target.value)} className="w-full bg-[#0f1d32] border border-[#1a2d4a] rounded-lg px-3 py-2 text-sm text-white">
                                    <option value="">Select...</option>
                                    <option value="ai-agent">AI Agent</option>
                                    <option value="dashboard">Dashboard</option>
                                    <option value="billing">Billing</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>

                        {contactMethod && (
                            <div>
                                <label className="block text-sm font-bold text-[#f97316] mb-1">
                                    {contactMethod === "phone" ? "Phone Number:" : "Email Address:"}
                                </label>
                                <input type={contactMethod === "phone" ? "tel" : "email"} value={contactDetail} onChange={(e) => setContactDetail(e.target.value)} className="w-full bg-[#0f1d32] border border-[#1a2d4a] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500" placeholder={contactMethod === "phone" ? "Enter phone number" : "Enter email address"} />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-bold text-[#f97316] mb-1">Provide a description of issue:</label>
                            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-[#0f1d32] border border-[#1a2d4a] rounded-lg px-3 py-2 text-sm h-32 resize-none text-white placeholder-gray-500" placeholder="Describe your issue here..." />
                        </div>

                        <div className="text-center pt-2">
                            <button onClick={handleSubmit} className="bg-[#f97316] hover:bg-[#ea580c] text-white font-bold py-2.5 px-10 rounded-lg transition-colors shadow-sm">
                                SUBMIT
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-[#1a2d4a]/50 rounded-3xl p-8 max-w-2xl mx-auto text-center border-2 border-[#f97316]/30">
                    <h3 className="text-xl font-bold underline decoration-[#f97316] decoration-2 underline-offset-4 text-[#f97316] mb-2">
                        Emergency Contact Number
                    </h3>
                    <p className="text-sm text-gray-400 mb-3">Call number ONLY regarding outages</p>
                    <p className="text-4xl font-black text-white">(253) 444-5555</p>
                </div>
            </div>
        </>
    );
}