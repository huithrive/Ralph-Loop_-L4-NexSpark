'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface ModuleContextType {
  currentModule: string
  setCurrentModule: (module: string) => void
  moduleProgress: number
  setModuleProgress: (progress: number) => void
  moduleData: any
  setModuleData: (data: any) => void
}

const ModuleContext = createContext<ModuleContextType | undefined>(undefined)

interface ModuleProviderProps {
  children: ReactNode
}

export function ModuleProvider({ children }: ModuleProviderProps) {
  const [currentModule, setCurrentModule] = useState('dashboard')
  const [moduleProgress, setModuleProgress] = useState(0)
  const [moduleData, setModuleData] = useState({})

  const value = {
    currentModule,
    setCurrentModule,
    moduleProgress,
    setModuleProgress,
    moduleData,
    setModuleData,
  }

  return (
    <ModuleContext.Provider value={value}>
      {children}
    </ModuleContext.Provider>
  )
}

export function useModule() {
  const context = useContext(ModuleContext)
  if (context === undefined) {
    throw new Error('useModule must be used within a ModuleProvider')
  }
  return context
}