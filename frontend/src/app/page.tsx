'use client'

import { useModule } from '@/hooks/useModule'
import { Target, Zap, Megaphone, BarChart3, ArrowRight, Play, Activity, Cpu, Globe } from 'lucide-react'

const modules = [
  {
    id: 'strategist',
    title: 'GTM Strategist',
    icon: Target,
    description: 'AI-powered market research, competitive analysis, and go-to-market strategy development',
    features: ['Market Research', 'Competitor Analysis', 'Customer Interviews', 'Strategy Reports'],
    status: 'available',
    progress: 0,
    path: '/strategist'
  },
  {
    id: 'executor',
    title: 'Creative Executor',
    icon: Zap,
    description: 'Generate high-converting creatives, copy variations, and multimedia content',
    features: ['AI Creative Generation', 'Copy Variations', 'Image/Video Content', 'Brand Consistency'],
    status: 'available',
    progress: 0,
    path: '/executor'
  },
  {
    id: 'advertiser',
    title: 'Meta & Google Ads',
    icon: Megaphone,
    description: 'Automated campaign creation, optimization, and cross-platform advertising management',
    features: ['Campaign Creation', 'Bid Optimization', 'Creative Rotation', 'Budget Management'],
    status: 'available',
    progress: 0,
    path: '/advertiser'
  },
  {
    id: 'analyzer',
    title: 'Performance Analyzer',
    icon: BarChart3,
    description: 'Real-time analytics, performance tracking, and AI-driven optimization insights',
    features: ['Performance Tracking', 'ROI Analysis', 'Predictive Analytics', 'Optimization Insights'],
    status: 'available',
    progress: 0,
    path: '/analyzer'
  }
]

const stats = [
  { label: 'Active Campaigns', value: '12', trend: '+8%', icon: Activity },
  { label: 'Total Revenue', value: '$245K', trend: '+24%', icon: Cpu },
  { label: 'Conversion Rate', value: '3.8%', trend: '+12%', icon: Target },
  { label: 'Global Reach', value: '89K', trend: '+18%', icon: Globe },
]

export default function Dashboard() {
  const { setCurrentModule } = useModule()

  const handleModuleClick = (moduleId: string) => {
    setCurrentModule(moduleId)
    // In a real app, this would navigate to the module
    console.log(`Navigating to ${moduleId} module`)
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12">
        <div className="inline-flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-gold to-primary-blue rounded-lg flex items-center justify-center">
            <span className="text-black font-bold text-xl">N</span>
          </div>
          <h1 className="text-5xl font-display font-black gradient-text">
            NexSpark AI Growth OS
          </h1>
        </div>
        <p className="text-xl text-text-muted max-w-3xl mx-auto leading-relaxed">
          Transform your marketing with our integrated 4-module AI system.
          From strategy to execution, advertising to analysis—all powered by artificial intelligence.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="bg-bg-surface border border-border-subtle rounded-lg p-6 backdrop-blur-lg hover:border-primary-gold/50 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <Icon size={24} className="text-primary-blue" />
                <span className="text-sm text-success font-mono">{stat.trend}</span>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-text-secondary">{stat.value}</div>
                <div className="text-sm text-text-muted">{stat.label}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {modules.map((module, index) => {
          const Icon = module.icon
          return (
            <div
              key={module.id}
              className="group bg-bg-surface border border-border-subtle rounded-lg p-6 hover:border-primary-gold/50 transition-all duration-300 hover:shadow-glow-gold cursor-pointer backdrop-blur-lg"
              onClick={() => handleModuleClick(module.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-bg-card border border-border-blue rounded-lg flex items-center justify-center group-hover:border-primary-gold transition-colors">
                    <Icon size={24} className="text-primary-blue group-hover:text-primary-gold transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold text-text-secondary group-hover:text-primary-gold transition-colors">
                      {module.title}
                    </h3>
                    <span className="text-sm text-text-muted">Module {index + 1}</span>
                  </div>
                </div>

                <button className="p-2 text-text-muted group-hover:text-primary-gold transition-colors rounded-lg hover:bg-bg-card">
                  <Play size={20} />
                </button>
              </div>

              <p className="text-text-muted mb-6 leading-relaxed">
                {module.description}
              </p>

              {/* Features List */}
              <div className="grid grid-cols-2 gap-2 mb-6">
                {module.features.map((feature) => (
                  <div key={feature} className="flex items-center space-x-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-primary-blue rounded-full" />
                    <span className="text-text-muted">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Progress Bar */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Progress</span>
                  <span className="text-text-primary font-mono">{module.progress}%</span>
                </div>
                <div className="w-full h-2 bg-bg-card rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-blue to-primary-gold transition-all duration-500"
                    style={{ width: `${module.progress}%` }}
                  />
                </div>
              </div>

              {/* Action Button */}
              <button
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-primary-gold/10 border border-primary-gold/30 rounded-lg text-primary-gold hover:bg-primary-gold/20 transition-all duration-200 group"
                onClick={(e) => {
                  e.stopPropagation()
                  handleModuleClick(module.id)
                }}
              >
                <span className="font-medium">Launch Module</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-bg-surface border border-border-subtle rounded-lg p-6 backdrop-blur-lg">
        <h3 className="text-xl font-display font-bold text-text-secondary mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button className="flex items-center space-x-3 p-4 bg-bg-card border border-border-subtle rounded-lg hover:border-primary-blue/50 transition-all">
            <Target size={20} className="text-primary-blue" />
            <span className="text-text-primary">Start Market Research</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-bg-card border border-border-subtle rounded-lg hover:border-primary-blue/50 transition-all">
            <Zap size={20} className="text-primary-blue" />
            <span className="text-text-primary">Generate Creatives</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-bg-card border border-border-subtle rounded-lg hover:border-primary-blue/50 transition-all">
            <BarChart3 size={20} className="text-primary-blue" />
            <span className="text-text-primary">View Analytics</span>
          </button>
        </div>
      </div>
    </div>
  )
}
