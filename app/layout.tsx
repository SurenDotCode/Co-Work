import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Co-work — Deadlines & File Submissions",
  description: "Room-based collaboration to assign deadlines to team members and collect Excel spreadsheets and project files.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className="min-h-screen bg-[#f8fafc] text-slate-900 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
