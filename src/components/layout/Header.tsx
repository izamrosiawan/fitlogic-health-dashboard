"use client"

import React from 'react'
import { User, Bell } from 'lucide-react'

interface HeaderProps {
  userEmail?: string | null
  userName?: string | null
}

export function Header({ userEmail, userName }: HeaderProps) {
  return (
    <header className="h-16 border-b border-neutral-900 bg-neutral-950/40 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-6">
      <div className="flex items-center gap-4 w-96 max-w-full">
        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 select-none animate-pulse">
          Demo Prototype
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button className="text-neutral-400 hover:text-white p-2 rounded-full hover:bg-neutral-900 transition-colors cursor-pointer">
          <Bell className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-3 border-l border-neutral-900 pl-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-white">
              {userName || 'Fitness Enthusiast'}
            </p>
            <p className="text-xs text-neutral-400 font-medium">
              {userEmail || ''}
            </p>
          </div>
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center font-bold text-white shadow-md shadow-orange-500/10">
            {userName ? userName[0].toUpperCase() : <User className="h-5 w-5" />}
          </div>
        </div>
      </div>
    </header>
  )
}
