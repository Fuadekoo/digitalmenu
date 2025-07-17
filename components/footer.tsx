"use client";
import React from "react";
import { PhoneCall, MessageCircle, Facebook } from "lucide-react";

function Footer() {
    return (
        <footer className="bg-gray-900 text-white py-6 text-center">
            <div className="mb-3 flex justify-center items-center gap-4">
                <a
                    href="https://t.me/yourcompany"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline flex items-center mr-2"
                >
                    <MessageCircle size={18} />
                </a>
                <a
                    href="https://facebook.com/yourcompany"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 mx-2 hover:underline flex items-center gap-1"
                >
                    <Facebook size={18} />
                </a>
            </div>
            <div className="font-bold mb-2">Your Company Name</div>
            <div className="mb-2 flex justify-center items-center gap-2">
                <PhoneCall size={18} />
                Phone:{" "}
                <a href="tel:+1234567890" className="text-white underline">
                    +1 234 567 890
                </a>
            </div>
            <div className="text-sm text-gray-400">
                &copy; {new Date().getFullYear()} All rights reserved.
            </div>
        </footer>
    );
}

export default Footer;
