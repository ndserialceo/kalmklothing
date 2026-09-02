"use client";

import { MessageCircle } from "lucide-react";
import { WHATSAPP_NUMBER } from "@/lib/constants";
import { generateWhatsAppLink } from "@/lib/utils";

export default function WhatsAppButton() {
  const link = generateWhatsAppLink(
    WHATSAPP_NUMBER,
    "Hello Kalmklothing! I have a question about your products."
  );

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 group"
      aria-label="Chat on WhatsApp"
    >
      <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-30" />
      <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-transform hover:scale-110">
        <MessageCircle className="h-6 w-6" />
      </span>
    </a>
  );
}
