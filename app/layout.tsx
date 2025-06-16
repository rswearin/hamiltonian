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
    <html lang="en" style={{ width: "100vw", height: "100vh", margin: 0, padding: 0 }}>
      <body
        className={inter.className}
        style={{ width: "100vw", height: "100vh", margin: 0, padding: 0, overflow: "hidden" }}
      >
        {children}
      </body>
    </html>
  )
}
