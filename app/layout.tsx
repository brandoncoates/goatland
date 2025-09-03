import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Goatland",
  description: "Goatland MVP – Entertainment, Sports, Today in History, Recipes",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
