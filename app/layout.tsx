import "./globals.css";
import Link from "next/link";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  metadataBase: new URL("https://goatland.net"),
  title: {
    default: "Goatland",
    template: "%s — Goatland",
  },
  description:
    "Headlines and happenings — Entertainment, Sports, Today in History, Recipes.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-gray-900`}>
        <header className="border-b">
          <div className="mx-auto max-w-5xl p-4 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold">
              Goatland
            </Link>
            <nav className="text-sm flex items-center gap-6">
              <Link href="/entertainment" className="hover:underline">
                Entertainment
              </Link>
              {/* Future: add Sports, History, Recipes routes */}
            </nav>
          </div>
        </header>

        <main className="min-h-[70vh]">{children}</main>

        <footer className="border-t">
          <div className="mx-auto max-w-5xl p-4 text-xs text-gray-500">
            © {new Date().getFullYear()} Goatland
          </div>
        </footer>
      </body>
    </html>
  );
}
