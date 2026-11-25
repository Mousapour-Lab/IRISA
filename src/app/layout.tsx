import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "همراه Oracle Forms | تمرین و چک‌لیست",
  description: "راهنمای فارسی و شبیه‌ساز آفلاین دو تمرین Oracle Forms؛ بدون ادعای نصب یا اجرای واقعی.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
