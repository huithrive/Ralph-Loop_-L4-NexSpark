'use client'

import { useModule } from '@/hooks/useModule'
import { Bell, Settings, User } from 'lucide-react'

export default function Header() {
  const { currentModule, moduleProgress } = useModule()

  const getModuleIcon = (module: string) => {
    switch (module) {
      case 'strategist': return '🎯'
      case 'executor': return '⚡'
      case 'advertiser': return '📢'
      case 'analyzer': return '📊'
      default: return '🚀'
    }
  }

  const getModuleName = (module: string) => {
    switch (module) {
      case 'strategist': return 'GTM Strategist'
      case 'executor': return 'Creative Executor'
      case 'advertiser': return 'Meta & Google Ads'
      case 'analyzer': return 'Performance Analyzer'
      default: return 'NexSpark AI Growth OS'
    }
  }

  return (
    <header className="border-b border-border-subtle bg-bg-surface backdrop-blur-lg">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Current Module Info */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl" role="img" aria-label="Module icon">
              {getModuleIcon(currentModule)}
            </span>
            <div>
              <h1 className="text-xl font-display font-bold text-text-secondary tracking-wide">
                {getModuleName(currentModule)}
              </h1>
              {currentModule !== 'dashboard' && (
                <p className="text-sm text-text-muted">
                  Module {['strategist', 'executor', 'advertiser', 'analyzer'].indexOf(currentModule) + 1} of 4
                </p>
              )}
            </div>
          </div>

          {/* Progress Indicator */}
          {moduleProgress && currentModule !== 'dashboard' && (
            <div className="flex items-center space-x-2 ml-8">
              <div className="w-32 h-1 bg-bg-card rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-gold to-primary-blue transition-all duration-500"
                  style={{ width: `${moduleProgress}%` }}
                />
              </div>
              <span className="text-xs text-text-muted font-mono">
                {moduleProgress}%
              </span>
            </div>
          )}
        </div>

        {/* Header Actions */}
        <div className="flex items-center space-x-4">
          {/* Notification Bell */}
          <button
            className="p-2 text-text-muted hover:text-primary-gold transition-colors duration-200 rounded-lg hover:bg-bg-card"
            title="Notifications"
          >
            <Bell size={20} />
          </button>

          {/* Settings */}
          <button
            className="p-2 text-text-muted hover:text-primary-gold transition-colors duration-200 rounded-lg hover:bg-bg-card"
            title="Settings"
          >
            <Settings size={20} />
          </button>

          {/* User Profile */}
          <button
            className="flex items-center space-x-2 p-2 text-text-muted hover:text-primary-gold transition-colors duration-200 rounded-lg hover:bg-bg-card"
            title="User Profile"
          >
            <User size={20} />
            <span className="text-sm">Profile</span>
          </button>

          {/* Status Indicator */}
          <div className="flex items-center space-x-2 pl-4 border-l border-border-subtle">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span className="text-xs text-text-muted font-mono">ONLINE</span>
          </div>
        </div>
      </div>

      {/* Module Navigation Breadcrumb */}
      {currentModule !== 'dashboard' && (
        <div className="px-6 py-2 border-t border-border-subtle bg-bg-card/50">
          <div className="flex items-center space-x-2 text-sm text-text-muted">
            <span className="text-primary-blue">NexSpark</span>
            <span>/</span>
            <span className="text-primary-gold capitalize">{currentModule}</span>
            <span>/</span>
            <span>Active Session</span>
          </div>
        </div>
      )}
    </header>
  )
}