import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-6">
      <div className="container mx-auto flex flex-col items-center space-y-3 text-center">
        <p className="text-sm">
          &copy; 2024 By <span className="font-semibold">Morad Oulhaj - CMHW</span>
          {/* with the
          help of <span className="font-semibold">Ayoub Aharmouch</span>,{" "}
          <span className="font-semibold">Noureddine Charifi</span> and{" "}
          <span className="font-semibold">Omar Elmohamedy</span> */}
          . All rights reserved.
        </p>

        {/* Social Links */}
        <div className="flex space-x-6">
          <a
            href="https://t.me/moulhaj"
            className="text-gray-400 hover:text-blue-500 transition-all duration-200"
            aria-label="Telegram"
          >
            <i className="ri-telegram-fill"></i>{" "}
          </a>
        </div>
      </div>
    </footer>
  );
}
