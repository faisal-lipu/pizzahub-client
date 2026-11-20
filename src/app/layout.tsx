import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "sonner";
import "./globals.css";

// Configure Google Montserrat font with required weights and subsets
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PizzaHub — Pizza Ordering & Delivery Platform",
  description: "Browse local pizza shops and place fresh, hot food orders directly to your door.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${montserrat.variable} h-full antialiased`}
    >
      <body className={`${montserrat.className} min-h-full flex flex-col bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans overflow-x-clip w-full max-w-full transition-colors duration-200`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>
            <Navbar />
            <main className="flex-1 w-full max-w-full overflow-x-clip">{children}</main>
            <Footer />
            <Toaster richColors position="top-right" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
