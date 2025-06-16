import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Hamiltonian Camera Simulation",
  description: "Real-time Hamiltonian physics simulation with system analytics",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full w-full m-0 p-0">
      <body className={`${inter.className} h-full w-full m-0 p-0 overflow-hidden fixed inset-0`}>{children}</body>
    </html>
  )
}
