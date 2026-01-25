'use client'

import { Inter } from 'next/font/google'
import { ReactNode } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import { ModuleProvider } from '@/hooks/useModule'

const inter = Inter({ subsets: ['latin'] })

interface RootLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <ModuleProvider>
      <div className={`min-h-screen bg-bg-primary ${inter.className}`}>
        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none">
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(153, 204, 255, 0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(153, 204, 255, 0.1) 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px'
              }}
            />
          </div>

          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary-gold opacity-5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-primary-blue opacity-5 rounded-full blur-3xl" />
        </div>

        {/* Main Application Layout */}
        <div className="relative z-10 flex h-screen">
          {/* Sidebar Navigation */}
          <Sidebar />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Top Header */}
            <Header />

            {/* Page Content */}
            <main className="flex-1 overflow-hidden">
              <div className="h-full p-6 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                  {children}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </ModuleProvider>
  )
}