"use client"

import React from 'react'
import { User, Bell } from 'lucide-react'

interface HeaderProps {
  userEmail?: string | null
  userName?: string | null
}

export function Header({ userEmail, userName }: HeaderProps) {
  return (
    <header className="h-16 border-b border-border bg-background/85 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-6">
      <div className="flex items-center gap-4 w-96 max-w-full">
        <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-primary/20 bg-primary/10 text-primary select-none">
          Demo Prototype
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button className="text-muted-foreground hover:text-foreground p-2 rounded-full hover:bg-muted transition-colors cursor-pointer">
          <Bell className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-3 border-l border-border pl-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-foreground">
              {userName || 'Fitness Enthusiast'}
            </p>
            <p className="text-xs text-muted-foreground font-medium">
              {userEmail || ''}
            </p>
          </div>
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center font-bold text-primary-foreground">
            {userName ? userName[0].toUpperCase() : <User className="h-5 w-5" />}
          </div>
        </div>
      </div>
    </header>
  )
}
