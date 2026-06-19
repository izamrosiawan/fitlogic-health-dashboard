"use client"

import React from 'react'
import { Sparkles, Calendar } from 'lucide-react'

interface WelcomeSectionProps {
  userName?: string
}

export function WelcomeSection({ userName }: WelcomeSectionProps) {
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const getQuote = () => {
    const quotes = [
      "Consistency is the key to achieving your fitness goals.",
      "Track your efforts. Progress is progress, no matter how small.",
      "Fuel your body correctly and let your workouts match your logic.",
      "Stay active today! Every step brings you closer to your target.",
      "Make health a habit, not a chore."
    ]
    const day = new Date().getDate()
    return quotes[day % quotes.length]
  }

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 md:p-8">
      {/* Background design elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
            {getGreeting()}, <span className="text-primary">{userName || 'Enthusiast'}</span>!
          </h2>
          <p className="text-sm md:text-base text-muted-foreground font-medium flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-primary shrink-0" />
            {getQuote()}
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-background border border-border text-muted-foreground text-xs font-semibold self-start md:self-center">
          <Calendar className="h-4 w-4 text-primary" />
          {formatDate()}
        </div>
      </div>
    </div>
  )
}
