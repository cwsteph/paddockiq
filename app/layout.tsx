import type { Metadata } from "next"
import { DM_Sans, JetBrains_Mono } from "next/font/google"
import "./globals.css"

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600"],
})

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "700"],
})

export const metadata: Metadata = {
  title: "PaddockIQ — Horse Racing Analysis",
  description: "Professional horse racing analysis and handicapping",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body className="bg-bg text-base">
        {children}
      </body>
    </html>
  )
}
