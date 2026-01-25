'use client'

import { useState } from 'react'
import { useModule } from '@/hooks/useModule'
import { ChevronLeft, ChevronRight, Home, Target, Zap, Megaphone, BarChart3, HelpCircle } from 'lucide-react'
import Link from 'next/link'

const modules = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: Home,
    path: '/',
    description: 'Overview & Control Center'
  },
  {
    id: 'strategist',
    name: 'GTM Strategist',
    icon: Target,
    path: '/strategist',
    description: 'Market Research & Strategy'
  },
  {
    id: 'executor',
    name: 'Creative Executor',
    icon: Zap,
    path: '/executor',
    description: 'Content & Creative Generation'
  },
  {
    id: 'advertiser',
    name: 'Meta & Google Ads',
    icon: Megaphone,
    path: '/advertiser',
    description: 'Campaign Management & Automation'
  },
  {
    id: 'analyzer',
    name: 'Performance Analyzer',
    icon: BarChart3,
    path: '/analyzer',
    description: 'Analytics & Optimization'
  }
]

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { currentModule, setCurrentModule } = useModule()

  return (
    <aside className={`
      ${isCollapsed ? 'w-16' : 'w-64'}
      bg-bg-surface border-r border-border-subtle backdrop-blur-lg
      transition-all duration-300 ease-in-out flex flex-col
    `}>
      {/* Sidebar Header */}
      <div className="p-4 border-b border-border-subtle">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-gold to-primary-blue rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-sm">N</span>
              </div>
              <div>
                <h2 className="font-display font-bold text-text-secondary tracking-wide">
                  NexSpark
                </h2>
                <p className="text-xs text-text-muted">AI Growth OS</p>
              </div>
            </div>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 text-text-muted hover:text-primary-gold transition-colors rounded-md hover:bg-bg-card"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {modules.map((module) => {
            const Icon = module.icon
            const isActive = currentModule === module.id

            return (
              <li key={module.id}>
                <Link
                  href={module.path}
                  onClick={() => setCurrentModule(module.id)}
                  className={`
                    flex items-center p-3 rounded-lg transition-all duration-200 group
                    ${isActive
                      ? 'bg-primary-gold/20 border border-primary-gold/30 text-primary-gold shadow-glow-gold'
                      : 'text-text-muted hover:text-text-primary hover:bg-bg-card border border-transparent'
                    }
                  `}
                  title={isCollapsed ? module.name : undefined}
                >
                  <Icon
                    size={20}
                    className={`
                      ${isActive ? 'text-primary-gold' : 'group-hover:text-primary-blue'}
                      transition-colors duration-200
                    `}
                  />

                  {!isCollapsed && (
                    <div className="ml-3 flex-1 min-w-0">
                      <p className={`
                        text-sm font-medium truncate
                        ${isActive ? 'text-primary-gold' : 'group-hover:text-text-secondary'}
                      `}>
                        {module.name}
                      </p>
                      <p className="text-xs text-text-muted truncate mt-0.5">
                        {module.description}
                      </p>
                    </div>
                  )}

                  {/* Active indicator */}
                  {isActive && (
                    <div className="w-2 h-2 bg-primary-gold rounded-full animate-pulse" />
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-border-subtle">
        {!isCollapsed ? (
          <div className="space-y-3">
            {/* Help & Support */}
            <button className="w-full flex items-center space-x-2 p-2 text-text-muted hover:text-primary-blue transition-colors rounded-lg hover:bg-bg-card">
              <HelpCircle size={16} />
              <span className="text-sm">Help & Support</span>
            </button>

            {/* Status */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-muted">Status:</span>
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-success rounded-full" />
                <span className="text-success font-mono">OPERATIONAL</span>
              </div>
            </div>

            {/* Version */}
            <div className="text-xs text-text-muted text-center">
              v1.0.0-beta
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <button
              className="p-2 text-text-muted hover:text-primary-blue transition-colors rounded-lg hover:bg-bg-card"
              title="Help & Support"
            >
              <HelpCircle size={16} />
            </button>
            <div className="w-1.5 h-1.5 bg-success rounded-full" title="Status: Operational" />
          </div>
        )}
      </div>
    </aside>
  )
}